import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function createWavHeader(audioData: ArrayBuffer): ArrayBuffer {
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  
  // "RIFF" chunk descriptor
  view.setUint32(0, 0x52494646, false); // "RIFF" in ASCII
  view.setUint32(4, 36 + audioData.byteLength, true); // File size
  view.setUint32(8, 0x57415645, false); // "WAVE" in ASCII
  
  // "fmt " sub-chunk
  view.setUint32(12, 0x666D7420, false); // "fmt " in ASCII
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 for mono)
  view.setUint32(24, 16000, true); // SampleRate (16000Hz)
  view.setUint32(28, 16000 * 2, true); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample (16 bits)
  
  // "data" sub-chunk
  view.setUint32(36, 0x64617461, false); // "data" in ASCII
  view.setUint32(40, audioData.byteLength, true); // Subchunk2Size
  
  return wavHeader;
}

function concatenateArrayBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
  const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp.buffer;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const referenceText = formData.get('text') as string
    const languageCode = formData.get('languageCode') as string

    console.log('Processing request with:', {
      hasAudio: !!audioFile,
      referenceText,
      languageCode,
      audioType: audioFile?.type
    })

    if (!audioFile || !referenceText || !languageCode) {
      throw new Error('Missing required fields')
    }

    // Get audio data as ArrayBuffer
    const rawAudioData = await audioFile.arrayBuffer()
    
    // Create WAV header and combine with audio data
    const wavHeader = createWavHeader(rawAudioData)
    const completeWavFile = concatenateArrayBuffers(wavHeader, rawAudioData)

    // Upload audio to Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileName = `${crypto.randomUUID()}.wav`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, new Blob([completeWavFile], { type: 'audio/wav' }), {
        contentType: 'audio/wav',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error('Failed to upload audio file')
    }

    // Get the public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(fileName)

    // Azure Speech Services configuration
    const speechKey = Deno.env.get('AZURE_SPEECH_KEY')
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION')

    if (!speechKey || !speechRegion) {
      throw new Error('Azure Speech Services configuration missing')
    }

    console.log('Starting speech recognition with language:', languageCode)

    // Create the speech config
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)
    speechConfig.speechRecognitionLanguage = languageCode

    // Create the audio config from the WAV file
    const pushStream = sdk.AudioInputStream.createPushStream()
    pushStream.write(new Uint8Array(completeWavFile))
    pushStream.close()
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)

    // Create pronunciation assessment config
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      true
    )

    // Create the speech recognizer
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)

    // Attach the pronunciation assessment to the recognizer
    pronunciationConfig.applyTo(recognizer)

    try {
      // Start recognition and get assessment
      const result = await new Promise((resolve, reject) => {
        recognizer.recognizeOnceAsync(
          result => {
            recognizer.close()
            resolve(result)
          },
          error => {
            recognizer.close()
            reject(error)
          }
        )
      })

      console.log('Assessment result:', result)

      // Parse the pronunciation assessment result
      const pronunciationResult = result.properties.get(sdk.PropertyId.SpeechServiceResponse)
        ? JSON.parse(result.properties.get(sdk.PropertyId.SpeechServiceResponse))
        : null

      // Prepare the response
      const response = {
        success: true,
        audioUrl: publicUrl,
        assessment: {
          NBest: [{
            PronunciationAssessment: pronunciationResult?.NBest?.[0]?.PronunciationAssessment || {
              AccuracyScore: 0,
              FluencyScore: 0,
              CompletenessScore: 0,
              PronScore: 0
            },
            Words: pronunciationResult?.NBest?.[0]?.Words || [{
              Word: referenceText,
              PronunciationAssessment: {
                AccuracyScore: 0,
                ErrorType: "None"
              }
            }],
            AudioUrl: publicUrl
          }]
        }
      }

      return new Response(
        JSON.stringify(response),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      )

    } catch (error) {
      console.error('Speech recognition error:', error)
      throw error
    }

  } catch (error) {
    console.error('Error in assess-pronunciation:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})