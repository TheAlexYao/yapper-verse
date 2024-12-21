import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import * as sdk from "https://esm.sh/microsoft-cognitiveservices-speech-sdk";

const AZURE_SPEECH_KEY = Deno.env.get('AZURE_SPEECH_KEY') || '';
const AZURE_SPEECH_REGION = Deno.env.get('AZURE_SPEECH_REGION') || '';

interface TTSRequest {
  text: string;
  languageCode: string;
  voiceGender: 'male' | 'female';
  speed?: 'normal' | 'slow';
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validate environment variables
    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) {
      console.error('Missing Azure Speech configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body first
    const requestData = await req.json();
    console.log('Received TTS request:', requestData);

    // Validate required parameters
    const missingParams = [];
    if (!requestData?.text) missingParams.push('text');
    if (!requestData?.languageCode) missingParams.push('languageCode');
    if (!requestData?.voiceGender) missingParams.push('voiceGender');

    if (missingParams.length > 0) {
      console.error('Missing required parameters:', missingParams);
      return new Response(
        JSON.stringify({ 
          error: 'Missing required parameters', 
          missingParams 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Now that we've validated the data, we can safely cast it
    const validatedData = requestData as TTSRequest;
    
    // Create speech configuration
    const speechConfig = sdk.SpeechConfig.fromSubscription(
      AZURE_SPEECH_KEY,
      AZURE_SPEECH_REGION
    );

    // Set voice based on language and gender
    const voiceName = `${validatedData.languageCode}-${validatedData.voiceGender}`;
    speechConfig.speechSynthesisVoiceName = voiceName;

    console.log('Using voice:', voiceName);

    // Create SSML with proper prosody controls
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${validatedData.languageCode}">
        <voice name="${voiceName}">
          <prosody rate="${validatedData.speed === 'slow' ? '0.7' : '1.0'}" pitch="+0%">
            ${validatedData.text}
          </prosody>
        </voice>
      </speak>
    `;

    // Generate speech
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
    
    try {
      const result = await new Promise<sdk.SpeechSynthesisResult>((resolve, reject) => {
        synthesizer.speakSsmlAsync(
          ssml,
          result => {
            synthesizer.close();
            resolve(result);
          },
          error => {
            synthesizer.close();
            reject(error);
          }
        );
      });

      if (result.errorDetails) {
        throw new Error(`Speech synthesis failed: ${result.errorDetails}`);
      }

      const audioData = result.audioData;
      
      return new Response(
        audioData,
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'audio/wav',
            'Content-Length': audioData.byteLength.toString()
          }
        }
      );

    } finally {
      synthesizer.close();
    }

  } catch (error) {
    console.error('Error in text-to-speech function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});