import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as sdk from "https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk@latest/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle.js"

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

    // Create the speech config and audio config
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)
    speechConfig.speechRecognitionLanguage = languageCode

    // Create the audio config from the array buffer
    const pushStream = sdk.AudioInputStream.createPushStream()
    pushStream.write(audioArrayBuffer)
    pushStream.close()
    const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)

    // Create the speech recognizer
    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)

    // Start recognition
    const recognitionResult = await new Promise((resolve, reject) => {
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

    console.log('Recognition result:', recognitionResult)

    if (recognitionResult.reason !== sdk.ResultReason.RecognizedSpeech) {
      throw new Error(`Speech recognition failed: ${recognitionResult.reason}`)
    }

    // Create pronunciation assessment config
    const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
      referenceText,
      sdk.PronunciationAssessmentGradingSystem.HundredMark,
      sdk.PronunciationAssessmentGranularity.Word,
      true
    )

    // Create pronunciation assessment
    const pronunciationAssessment = sdk.PronunciationAssessment.fromConfig(pronunciationConfig)

    // Attach the pronunciation assessment to the recognizer
    pronunciationAssessment.attachTo(recognizer)

    // Get pronunciation assessment
    const assessmentResult = await new Promise((resolve, reject) => {
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

    console.log('Assessment result:', assessmentResult)

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: publicUrl,
        assessment: {
          pronunciationScore: assessmentResult.pronunciationAssessment?.pronunciationScore || 0,
          accuracyScore: assessmentResult.pronunciationAssessment?.accuracyScore || 0,
          fluencyScore: assessmentResult.pronunciationAssessment?.fluencyScore || 0,
          completenessScore: assessmentResult.pronunciationAssessment?.completenessScore || 0,
          words: (assessmentResult.pronunciationAssessment?.words || []).map((word: any) => ({
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