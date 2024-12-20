import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "./utils/corsHeaders.ts"
import { uploadAudioToStorage } from "./utils/audioStorage.ts"
import { performSpeechRecognition } from "./utils/speechRecognition.ts"
import { createDefaultResponse } from "./utils/assessmentResponse.ts"

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

    // Upload original WAV file to storage
    const audioUrl = await uploadAudioToStorage(audioFile)
    console.log('Audio uploaded successfully:', audioUrl)
    
    // Convert WAV to raw PCM data
    const arrayBuffer = await audioFile.arrayBuffer()
    const wavBuffer = new Uint8Array(arrayBuffer)
    
    // Skip WAV header (44 bytes) to get raw PCM data
    // WAV header structure:
    // 4 bytes: "RIFF"
    // 4 bytes: File size (minus 8 bytes)
    // 4 bytes: "WAVE"
    // 4 bytes: "fmt "
    // 4 bytes: Length of format data
    // 2 bytes: Type of format (1 is PCM)
    // 2 bytes: Number of channels
    // 4 bytes: Sample rate
    // 4 bytes: Bytes per second
    // 2 bytes: Bytes per sample
    // 2 bytes: Bits per sample
    // 4 bytes: "data"
    // 4 bytes: Size of data section
    const pcmData = wavBuffer.slice(44)
    
    console.log('Audio data details:', {
      originalSize: wavBuffer.length,
      pcmSize: pcmData.length,
      type: Object.prototype.toString.call(pcmData),
      sampleRate: new DataView(wavBuffer.buffer).getUint32(24, true),
      channels: new DataView(wavBuffer.buffer).getUint16(22, true),
      bitsPerSample: new DataView(wavBuffer.buffer).getUint16(34, true)
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
      audioData: pcmData.buffer
    })

    console.log('Speech recognition result:', result)

    const response = createDefaultResponse(referenceText, audioUrl)

    if (result && typeof result === 'object') {
      const jsonResult = JSON.stringify(result)
      console.log('Raw recognition result:', jsonResult)
      
      const parsedResult = JSON.parse(jsonResult)
      console.log('Parsed recognition result:', parsedResult)
      
      if (parsedResult.privPronJson) {
        const pronunciationAssessment = JSON.parse(parsedResult.privPronJson)
        console.log('Pronunciation assessment:', pronunciationAssessment)
        
        // Map the pronunciation assessment scores
        if (pronunciationAssessment.NBest && pronunciationAssessment.NBest[0]) {
          const assessment = pronunciationAssessment.NBest[0].PronunciationAssessment
          response.assessment.NBest[0].PronunciationAssessment = {
            AccuracyScore: assessment.AccuracyScore || 0,
            FluencyScore: assessment.FluencyScore || 0,
            CompletenessScore: assessment.CompletenessScore || 0,
            PronScore: assessment.PronScore || 0
          }
          response.assessment.pronunciationScore = assessment.PronScore || 0
        }

        // Map the word-level assessment
        if (pronunciationAssessment.NBest && pronunciationAssessment.NBest[0].Words) {
          response.assessment.NBest[0].Words = pronunciationAssessment.NBest[0].Words.map((word: any) => ({
            Word: word.Word,
            PronunciationAssessment: {
              AccuracyScore: word.PronunciationAssessment?.AccuracyScore || 0,
              ErrorType: word.PronunciationAssessment?.ErrorType || "None"
            },
            Phonemes: word.Phonemes || []
          }))
        }
      }
    }

    console.log('Final response:', JSON.stringify(response, null, 2))

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in assess-pronunciation:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})