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

    // First, get speech recognition
    const recognitionEndpoint = `https://${speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1`
    
    const recognitionResponse = await fetch(recognitionEndpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'audio/wav',
        'Accept': 'application/json',
      },
      body: audioArrayBuffer,
      query: { language: languageCode }
    })

    if (!recognitionResponse.ok) {
      const errorText = await recognitionResponse.text()
      console.error('Speech recognition error:', errorText)
      throw new Error(`Speech recognition failed: ${recognitionResponse.statusText}`)
    }

    const recognitionResult = await recognitionResponse.json()
    console.log('Recognition result:', recognitionResult)

    if (recognitionResult.RecognitionStatus !== 'Success') {
      throw new Error(`Speech recognition failed: ${recognitionResult.RecognitionStatus}`)
    }

    // Then, call pronunciation assessment
    const assessmentEndpoint = `https://${speechRegion}.pronunciation.speech.microsoft.com/speech/assessment/v1.0/transcript`
    
    const assessmentPayload = {
      referenceText,
      recognizedText: recognitionResult.DisplayText,
      audioFileUrl: publicUrl,
      locale: languageCode
    }

    console.log('Calling pronunciation assessment with:', assessmentPayload)

    const assessmentResponse = await fetch(assessmentEndpoint, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assessmentPayload),
    })

    if (!assessmentResponse.ok) {
      const errorText = await assessmentResponse.text()
      console.error('Assessment service error:', errorText)
      throw new Error(`Assessment service error: ${assessmentResponse.statusText}`)
    }

    const assessmentResult = await assessmentResponse.json()
    console.log('Assessment result:', assessmentResult)

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: publicUrl,
        assessment: {
          pronunciationScore: assessmentResult.pronunciationScore || 0,
          accuracyScore: assessmentResult.accuracyScore || 0,
          fluencyScore: assessmentResult.fluencyScore || 0,
          completenessScore: assessmentResult.completenessScore || 0,
          words: (assessmentResult.words || []).map((word: any) => ({
            word: word.word,
            accuracyScore: word.accuracyScore,
            errorType: word.errorType
          }))
        }
      }),
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})