import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

export async function uploadAudioToStorage(audioFile: File) {
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

  const { data: { publicUrl } } = supabase.storage
    .from('audio')
    .getPublicUrl(fileName)

  return publicUrl
}