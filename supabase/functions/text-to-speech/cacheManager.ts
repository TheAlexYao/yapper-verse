import { createClient } from "npm:@supabase/supabase-js@2";
import type { TTSCacheEntry } from "../_shared/tts-utils.ts";

export class CacheManager {
  private supabaseAdmin: ReturnType<typeof createClient>;

  constructor() {
    this.supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
  }

  async getCacheEntry(textHash: string, languageCode: string, voiceGender: string): Promise<TTSCacheEntry | null> {
    const { data, error } = await this.supabaseAdmin
      .from('tts_cache')
      .select('*')
      .eq('text_hash', textHash)
      .eq('language_code', languageCode)
      .eq('voice_gender', voiceGender)
      .single();

    if (error) {
      console.error('Cache lookup error:', error);
      return null;
    }

    return data;
  }

  async updateCacheEntry(
    textHash: string,
    speed: 'normal' | 'slow' | 'very-slow',
    publicUrl: string,
    existingEntry: TTSCacheEntry | null,
    textContent: string,
    languageCode: string,
    voiceGender: string
  ): Promise<void> {
    const audioUrlField = `audio_url_${speed}`;
    
    if (existingEntry) {
      const { error: updateError } = await this.supabaseAdmin
        .from('tts_cache')
        .update({ [audioUrlField]: publicUrl })
        .eq('text_hash', textHash)
        .eq('language_code', languageCode)
        .eq('voice_gender', voiceGender);

      if (updateError) {
        console.error('Cache update error:', updateError);
        throw updateError;
      }
    } else {
      const { error: insertError } = await this.supabaseAdmin
        .from('tts_cache')
        .insert([{
          text_hash: textHash,
          text_content: textContent,
          language_code: languageCode,
          voice_gender: voiceGender,
          [audioUrlField]: publicUrl
        }]);

      if (insertError) {
        console.error('Cache insert error:', insertError);
        throw insertError;
      }
    }
  }

  async uploadAudio(filename: string, audioData: ArrayBuffer): Promise<string> {
    const { data: uploadData, error: uploadError } = await this.supabaseAdmin
      .storage
      .from('tts_cache')
      .upload(filename, audioData, {
        contentType: 'audio/wav',
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = this.supabaseAdmin
      .storage
      .from('tts_cache')
      .getPublicUrl(filename);

    return publicUrl;
  }
}