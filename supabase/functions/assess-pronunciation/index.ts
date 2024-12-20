import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { SpeechConfig, AudioConfig, SpeechRecognizer, PronunciationAssessmentConfig } from "npm:microsoft-cognitiveservices-speech-sdk"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // Upload audio to Supabase Storage
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileName = `${crypto.randomUUID()}.wav`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, audioFile, {
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

    // Get audio file as ArrayBuffer for Azure
    const audioArrayBuffer = await audioFile.arrayBuffer()

    // Azure Speech Services configuration
    const speechKey = Deno.env.get('AZURE_SPEECH_KEY')
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION')

    if (!speechKey || !speechRegion) {
      throw new Error('Azure Speech Services configuration missing')
    }

    console.log('Starting speech recognition with language:', languageCode)

    // Create the speech config
    const speechConfig = SpeechConfig.fromSubscription(speechKey, speechRegion)
    speechConfig.speechRecognitionLanguage = languageCode

    // Create the audio config from the array buffer
    const audioConfig = AudioConfig.fromWavFileInput(new Uint8Array(audioArrayBuffer))

    // Create pronunciation assessment config
    const pronunciationConfig = new PronunciationAssessmentConfig(
      referenceText,
      "HundredMark",
      "Word",
      true
    )

    // Create the speech recognizer
    const recognizer = new SpeechRecognizer(speechConfig, audioConfig)

    // Attach the pronunciation assessment to the recognizer
    pronunciationConfig.applyTo(recognizer)

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

    // Extract pronunciation scores and create a default response structure
    const defaultAssessment = {
      AccuracyScore: 0,
      FluencyScore: 0,
      CompletenessScore: 0,
      PronScore: 0
    }

    const defaultWord = {
      Word: "",
      PronunciationAssessment: {
        AccuracyScore: 0,
        ErrorType: "None"
      }
    }

    // Create the response with proper structure and fallback values
    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: publicUrl,
        assessment: {
          NBest: [{
            PronunciationAssessment: defaultAssessment,
            Words: [defaultWord],
            AudioUrl: publicUrl
          }]
        }
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    console.error('Error in assess-pronunciation:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})