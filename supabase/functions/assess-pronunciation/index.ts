import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "./utils/corsHeaders.ts"
import { uploadAudioToStorage } from "./utils/audioStorage.ts"
import { performSpeechRecognition } from "./utils/speechRecognition.ts"
import { createDefaultResponse } from "./utils/assessmentResponse.ts"

serve(async (req) => {
  // Handle CORS
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
      audioType: audioFile?.type,
      audioSize: audioFile?.size
    })

    if (!audioFile || !referenceText || !languageCode) {
      throw new Error('Missing required fields')
    }

    // Upload original WAV file to storage
    const audioUrl = await uploadAudioToStorage(audioFile)
    console.log('Audio uploaded successfully:', audioUrl)
    
    // Convert WAV to raw PCM data
    const arrayBuffer = await audioFile.arrayBuffer()
    const wavBuffer = new Uint8Array(arrayBuffer)
    
    // Parse WAV header
    const wavHeader = {
      chunkID: new TextDecoder().decode(wavBuffer.slice(0, 4)),
      fileSize: new DataView(arrayBuffer).getUint32(4, true),
      format: new TextDecoder().decode(wavBuffer.slice(8, 12)),
      subchunk1ID: new TextDecoder().decode(wavBuffer.slice(12, 16)),
      audioFormat: new DataView(arrayBuffer).getUint16(20, true),
      numChannels: new DataView(arrayBuffer).getUint16(22, true),
      sampleRate: new DataView(arrayBuffer).getUint32(24, true),
      byteRate: new DataView(arrayBuffer).getUint32(28, true),
      blockAlign: new DataView(arrayBuffer).getUint16(32, true),
      bitsPerSample: new DataView(arrayBuffer).getUint16(34, true)
    }
    
    console.log('WAV Header:', wavHeader)
    
    // Validate WAV format
    if (wavHeader.chunkID !== 'RIFF' || wavHeader.format !== 'WAVE') {
      throw new Error('Invalid WAV format')
    }

    // Validate audio format requirements
    if (wavHeader.sampleRate !== 16000) {
      throw new Error('Sample rate must be 16000 Hz')
    }

    if (wavHeader.numChannels !== 1) {
      throw new Error('Audio must be mono (1 channel)')
    }

    if (wavHeader.bitsPerSample !== 16) {
      throw new Error('Bits per sample must be 16')
    }

    // Skip WAV header (44 bytes) to get raw PCM data
    const pcmData = wavBuffer.slice(44)
    
    console.log('Audio data details:', {
      originalSize: wavBuffer.length,
      pcmSize: pcmData.length,
      type: Object.prototype.toString.call(pcmData),
      sampleRate: wavHeader.sampleRate,
      channels: wavHeader.numChannels,
      bitsPerSample: wavHeader.bitsPerSample
    })

    const speechKey = Deno.env.get('AZURE_SPEECH_KEY')
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION')

    if (!speechKey || !speechRegion) {
      throw new Error('Azure Speech Services configuration missing')
    }

    const result = await performSpeechRecognition({
      speechKey,
      speechRegion,
      languageCode,
      referenceText,
      audioData: pcmData.buffer,
      sampleRate: wavHeader.sampleRate,
      channels: wavHeader.numChannels,
      bitsPerSample: wavHeader.bitsPerSample
    })

    console.log('Speech recognition result:', result)

    // Extract the pronunciation assessment from the result
    let assessment;
    if (result && typeof result === 'object') {
      const jsonResult = JSON.stringify(result)
      console.log('Raw recognition result:', jsonResult)
      
      const parsedResult = JSON.parse(jsonResult)
      console.log('Parsed recognition result:', parsedResult)
      
      if (parsedResult.privJson) {
        // Parse the privJson string which contains the detailed assessment
        const privJsonData = JSON.parse(parsedResult.privJson)
        console.log('Pronunciation assessment from privJson:', privJsonData)
        
        if (privJsonData.NBest && privJsonData.NBest[0]) {
          const nBestResult = privJsonData.NBest[0];
          assessment = {
            NBest: [{
              PronunciationAssessment: nBestResult.PronunciationAssessment,
              Words: nBestResult.Words.map((word: any) => ({
                Word: word.Word,
                PronunciationAssessment: {
                  AccuracyScore: word.PronunciationAssessment?.AccuracyScore || 0,
                  ErrorType: word.PronunciationAssessment?.ErrorType || "None",
                  Feedback: word.PronunciationAssessment?.Feedback || null
                },
                Syllables: word.Syllables || [],
                Phonemes: word.Phonemes || []
              }))
            }],
            pronunciationScore: nBestResult.PronunciationAssessment?.PronScore || 0
          }
        }
      }
    }

    if (!assessment) {
      assessment = createDefaultResponse(referenceText, audioUrl).assessment
    }

    console.log('Final assessment data:', assessment)

    return new Response(
      JSON.stringify({ audioUrl, assessment }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in assess-pronunciation:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})