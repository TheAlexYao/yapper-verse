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
    speed
  });
  
  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  
  // Set output format to MP3
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3;

  // Use descriptive rates instead of percentages for better compatibility
  let rateValue = "default";
  if (speed === 'slow') {
    rateValue = "slow";
  } else if (speed === 'very-slow') {
    rateValue = "x-slow";
  }

  // Construct SSML with proper language and voice settings
  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${languageCode}">
      <voice name="${voiceName}">
        <prosody rate="${rateValue}">
          ${text}
        </prosody>
      </voice>
    </speak>`;

  console.log('Generated SSML:', ssml);
  
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);
  let isSynthesizerClosed = false;

  const closeSynthesizer = () => {
    if (!isSynthesizerClosed) {
      synthesizer.close();
      isSynthesizerClosed = true;
    }
  };

  return new Promise((resolve, reject) => {
    let audioData: ArrayBuffer | null = null;

    synthesizer.synthesisCompleted = (s, e) => {
      console.log('Synthesis completed');
      if (e.result.audioData) {
        audioData = e.result.audioData;
      }
    };

    synthesizer.synthesisStarted = () => {
      console.log('Synthesis started');
    };

    synthesizer.synthesizing = (s, e) => {
      console.log('Synthesizing...');
    };

    synthesizer.synthesiscanceled = (s, e) => {
      const errorMessage = `Synthesis canceled: ${e.errorDetails}. Error code: ${e.result.errorDetails}`;
      console.error(errorMessage);
      closeSynthesizer();
      reject(new Error(errorMessage));
    };

    synthesizer.speakSsmlAsync(
      ssml,
      result => {
        try {
          if (audioData) {
            console.log('Using audio data from synthesis completed event');
            closeSynthesizer();
            resolve(audioData);
            return;
          }

          if (result?.audioData) {
            console.log('Using audio data from synthesis result');
            closeSynthesizer();
            resolve(result.audioData);
            return;
          }

          closeSynthesizer();
          reject(new Error('No audio data in synthesis result'));
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

    // Set a timeout to prevent hanging
    setTimeout(() => {
      if (!audioData) {
        const timeoutError = new Error('Speech synthesis timeout');
        console.error(timeoutError);
        closeSynthesizer();
        reject(timeoutError);
      }
    }, 30000);
  });
}