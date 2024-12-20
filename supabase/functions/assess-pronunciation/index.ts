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

    const audioUrl = await uploadAudioToStorage(audioFile)
    console.log('Audio uploaded successfully:', audioUrl)
    
    const audioData = await audioFile.arrayBuffer()
    console.log('Audio data details:', {
      byteLength: audioData.byteLength,
      type: Object.prototype.toString.call(audioData)
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
      audioData
    })

    const response = createDefaultResponse(referenceText, audioUrl)

    if (result && typeof result === 'object') {
      const jsonResult = JSON.stringify(result)
      console.log('Raw recognition result:', jsonResult)
      
      const parsedResult = JSON.parse(jsonResult)
      console.log('Parsed recognition result:', parsedResult)
      
      if (parsedResult.privPronJson) {
        const pronunciationAssessment = JSON.parse(parsedResult.privPronJson)
        console.log('Pronunciation assessment:', pronunciationAssessment)
        
        if (pronunciationAssessment.PronScore !== undefined) {
          response.assessment.NBest[0].PronunciationAssessment = {
            AccuracyScore: pronunciationAssessment.AccuracyScore || 0,
            FluencyScore: pronunciationAssessment.FluencyScore || 0,
            CompletenessScore: pronunciationAssessment.CompletenessScore || 0,
            PronScore: pronunciationAssessment.PronScore || 0
          }
          response.assessment.pronunciationScore = pronunciationAssessment.PronScore
        }

        if (pronunciationAssessment.Words) {
          response.assessment.NBest[0].Words = pronunciationAssessment.Words.map((word: any) => ({
            Word: word.Word,
            PronunciationAssessment: {
              AccuracyScore: word.PronunciationAssessment?.AccuracyScore || 0,
              ErrorType: word.PronunciationAssessment?.ErrorType || "Unknown"
            }
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