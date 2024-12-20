import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk"

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { text, languageCode, voiceGender } = await req.json()

    console.log('Received TTS request:', { text, languageCode, voiceGender })

    if (!text || !languageCode || !voiceGender) {
      throw new Error('Missing required fields: text, languageCode, or voiceGender')
    }

    // Get Azure credentials
    const speechKey = Deno.env.get('AZURE_SPEECH_KEY')
    const speechRegion = Deno.env.get('AZURE_SPEECH_REGION')

    if (!speechKey || !speechRegion) {
      throw new Error('Azure Speech credentials not configured')
    }

    // Configure speech service
    const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)
    
    // Get voice configuration for the language
    const { data: languageData, error: languageError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/rest/v1/languages?code=eq.${languageCode}&select=male_voice,female_voice`,
      {
        headers: {
          'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        }
      }
    ).then(res => res.json())

    if (languageError) {
      console.error('Language lookup error:', languageError)
      throw new Error(`Failed to get voice configuration: ${languageError.message}`)
    }

    if (!languageData || languageData.length === 0) {
      throw new Error(`No voice configuration found for language: ${languageCode}`)
    }

    // Set voice based on gender preference
    const voiceName = voiceGender === 'male' ? 
      languageData[0].male_voice : 
      languageData[0].female_voice

    if (!voiceName) {
      throw new Error(`No ${voiceGender} voice available for language: ${languageCode}`)
    }

    console.log('Using voice:', voiceName)
    speechConfig.speechSynthesisVoiceName = voiceName

    // Set output format to MP3
    speechConfig.speechSynthesisOutputFormat = 
      sdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3

    // Create synthesizer
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig)

    // Generate speech
    console.log('Generating speech...')
    const result = await new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        result => {
          synthesizer.close()
          resolve(result)
        },
        error => {
          synthesizer.close()
          reject(error)
        }
      )
    })

    // Check if we got audio data
    if (!result.audioData || result.audioData.length === 0) {
      throw new Error('No audio data generated')
    }

    console.log('Generated audio data length:', result.audioData.length)

    // Generate unique filename
    const filename = `${crypto.randomUUID()}.mp3`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/tts_cache/${filename}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'audio/mpeg',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
        },
        body: result.audioData
      }
    ).then(res => res.json())

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error(`Failed to upload audio: ${uploadError.message}`)
    }

    // Get public URL
    const publicUrl = `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/tts_cache/${filename}`

    return new Response(
      JSON.stringify({ audioUrl: publicUrl }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error in text-to-speech function:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})