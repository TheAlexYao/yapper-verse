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

    console.log('Speech recognition result:', JSON.stringify(result, null, 2))

    const response = createDefaultResponse(referenceText, audioUrl)

    // Handle the assessment result
    if (result && typeof result === 'object') {
      const jsonResult = JSON.stringify(result)
      console.log('Raw recognition result:', jsonResult)
      
      const parsedResult = JSON.parse(jsonResult)
      console.log('Parsed recognition result:', parsedResult)
      
      if (parsedResult.privPronJson) {
        const pronunciationAssessment = JSON.parse(parsedResult.privPronJson)
        console.log('Pronunciation assessment:', pronunciationAssessment)
        response.assessment.NBest[0].PronunciationAssessment = pronunciationAssessment
        response.assessment.pronunciationScore = pronunciationAssessment.PronScore || 0
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