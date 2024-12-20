import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk";

export async function generateSpeech(
  text: string, 
  languageCode: string, 
  voiceName: string, 
  speed: 'normal' | 'slow' | 'very-slow'
): Promise<ArrayBuffer> {
  const speechKey = Deno.env.get('AZURE_SPEECH_KEY');
  const speechRegion = Deno.env.get('AZURE_SPEECH_REGION');

  if (!speechKey || !speechRegion) {
    throw new Error('Azure Speech credentials not configured');
  }

  console.log('Initializing speech synthesis with:', {
    region: speechRegion,
    voice: voiceName,
    language: languageCode,
    speed,
    textLength: text.length
  });
  
  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3;

  // Simplified rate values that are well-supported across voices
  const rateMap = {
    'normal': 'default',
    'slow': 'x-slow',
    'very-slow': 'x-slow'
  };

  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${languageCode}">
      <voice name="${voiceName}">
        <prosody rate="${rateMap[speed]}">
          ${text}
        </prosody>
      </voice>
    </speak>`.trim();

  console.log('Using SSML:', ssml);
  
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
  let isSynthesizerClosed = false;

  const closeSynthesizer = () => {
    if (!isSynthesizerClosed) {
      synthesizer.close();
      isSynthesizerClosed = true;
      console.log('Synthesizer closed');
    }
  };

  return new Promise((resolve, reject) => {
    let audioData: ArrayBuffer | null = null;
    let hasError = false;

    synthesizer.synthesisCompleted = (s, e) => {
      console.log('Synthesis completed event received');
      if (e.result.audioData) {
        audioData = e.result.audioData;
        console.log('Audio data received in synthesis completed event:', audioData.byteLength, 'bytes');
      }
    };

    synthesizer.synthesisStarted = () => {
      console.log('Synthesis started');
    };

    synthesizer.synthesizing = (s, e) => {
      console.log('Synthesizing in progress...');
    };

    synthesizer.synthesiscanceled = (s, e) => {
      hasError = true;
      const errorMessage = `Synthesis canceled: ${e.errorDetails}. Error code: ${e.result.errorDetails}`;
      console.error(errorMessage);
      closeSynthesizer();
      reject(new Error(errorMessage));
    };

    synthesizer.speakSsmlAsync(
      ssml,
      result => {
        try {
          if (hasError) {
            console.log('Skipping result processing due to previous error');
            return;
          }

          if (audioData) {
            console.log('Using audio data from synthesis completed event:', audioData.byteLength, 'bytes');
            closeSynthesizer();
            resolve(audioData);
            return;
          }

          if (result?.audioData) {
            console.log('Using audio data from synthesis result:', result.audioData.byteLength, 'bytes');
            closeSynthesizer();
            resolve(result.audioData);
            return;
          }

          const error = new Error('No audio data in synthesis result');
          console.error(error);
          closeSynthesizer();
          reject(error);
        } catch (error) {
          console.error('Error processing synthesis result:', error);
          closeSynthesizer();
          reject(error);
        }
      },
      error => {
        console.error('Speech synthesis error:', error);
        closeSynthesizer();
        reject(error);
      }
    );

    // Reduced timeout to 15 seconds as Azure usually responds within 5-10 seconds
    setTimeout(() => {
      if (!audioData && !hasError) {
        const timeoutError = new Error('Speech synthesis timeout after 15 seconds');
        console.error(timeoutError);
        closeSynthesizer();
        reject(timeoutError);
      }
    }, 15000);
  });
}