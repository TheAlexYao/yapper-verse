import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "./utils/corsHeaders.ts"
import { uploadAudioToStorage } from "./utils/audioStorage.ts"
import { performSpeechRecognition } from "./utils/speechRecognition.ts"
import { createDefaultResponse } from "./utils/assessmentResponse.ts"

serve(async (req) => {
  // Handle CORS for browser requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Step 1: Extract audio and metadata from request
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

    // Step 2: Upload original audio for reference
    const audioUrl = await uploadAudioToStorage(audioFile)
    console.log('Audio uploaded successfully:', audioUrl)
    
    // Step 3: Prepare audio data for Azure
    const arrayBuffer = await audioFile.arrayBuffer()
    const wavBuffer = new Uint8Array(arrayBuffer)
    
    // Step 4: Validate WAV format and requirements
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
    
    // Step 5: Extract PCM data for assessment
    const pcmData = wavBuffer.slice(44)
    
    // Step 6: Get Azure credentials
    const speechKey = Deno.env.get('AZURE_SPEECH_KEY')
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION')

    if (!speechKey || !speechRegion) {
      throw new Error('Azure Speech Services configuration missing')
    }

    // Step 7: Perform pronunciation assessment
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

    // Step 8: Process and format assessment results
    let assessment = result && typeof result === 'object' 
      ? extractAssessmentData(result)
      : createDefaultResponse(referenceText, audioUrl).assessment;

    // Step 9: Return results
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

// Helper function to extract assessment data
function extractAssessmentData(result: any) {
  if (result.privJson) {
    const privJsonData = JSON.parse(result.privJson)
    console.log('Pronunciation assessment from privJson:', privJsonData)
    
    if (privJsonData.NBest && privJsonData.NBest[0]) {
      const nBestResult = privJsonData.NBest[0];
      return {
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
  return null;
}
