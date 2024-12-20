import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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

    if (!audioFile || !referenceText || !languageCode) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Processing pronunciation assessment for language:', languageCode)

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

    // Call Azure Speech Services
    const speechKey = Deno.env.get('AZURE_SPEECH_KEY')
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION')

    if (!speechKey || !speechRegion) {
      throw new Error('Azure Speech Services configuration missing')
    }

    // Use the provided language code for speech recognition
    const endpoint = `https://${speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${languageCode}`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'audio/wav',
        'Accept': 'application/json',
      },
      body: audioArrayBuffer,
    })

    if (!response.ok) {
      console.error('Speech service error:', await response.text())
      throw new Error(`Speech service error: ${response.statusText}`)
    }

    const recognitionResult = await response.json()
    console.log('Recognition result:', recognitionResult)

    // Call pronunciation assessment with language code
    const assessmentEndpoint = `https://${speechRegion}.pronunciation.speech.microsoft.com/api/v1/assessment`
    
    const assessmentResponse = await fetch(assessmentEndpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referenceText,
        recognizedText: recognitionResult.DisplayText,
        audioFileUrl: publicUrl,
        locale: languageCode // Include language code in assessment request
      }),
    })

    if (!assessmentResponse.ok) {
      console.error('Assessment service error:', await assessmentResponse.text())
      throw new Error(`Assessment service error: ${assessmentResponse.statusText}`)
    }

    const assessmentResult = await assessmentResponse.json()
    console.log('Assessment result:', assessmentResult)

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: publicUrl,
        assessment: {
          pronunciationScore: assessmentResult.pronunciationScore,
          accuracyScore: assessmentResult.accuracyScore,
          fluencyScore: assessmentResult.fluencyScore,
          completenessScore: assessmentResult.completenessScore,
          words: assessmentResult.words.map((word: any) => ({
            word: word.word,
            accuracyScore: word.accuracyScore,
            errorType: word.errorType
          }))
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})