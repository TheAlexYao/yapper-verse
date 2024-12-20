import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio')
    const text = formData.get('text')

    if (!audioFile || !text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Upload audio file to storage
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

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('audio')
      .getPublicUrl(fileName)

    // For now, return mock assessment data
    // TODO: Integrate with Azure Speech Services or similar
    const mockAssessment = {
      pronunciationScore: Math.floor(Math.random() * 30) + 70,
      accuracyScore: Math.floor(Math.random() * 20) + 80,
      fluencyScore: Math.floor(Math.random() * 15) + 85,
      completenessScore: 100,
      words: text.split(' ').map(word => ({
        word,
        accuracyScore: Math.floor(Math.random() * 20) + 80,
        errorType: 'None'
      }))
    }

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: publicUrl,
        assessment: mockAssessment
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