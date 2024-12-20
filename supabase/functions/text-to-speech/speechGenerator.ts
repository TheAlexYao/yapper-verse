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

  console.log('Initializing speech config with region:', speechRegion);
  
  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  
  // Set output format to MP3
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3;

  // Set rate adjustment based on speed
  let rateValue = "0%";
  if (speed === 'slow') {
    rateValue = "-20%";
  } else if (speed === 'very-slow') {
    rateValue = "-40%";
  }

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
      console.error('Synthesis canceled:', e);
      synthesizer.close();
      reject(new Error(`Synthesis canceled: ${e.errorDetails}`));
    };

    synthesizer.speakSsmlAsync(
      ssml,
      result => {
        try {
          if (audioData) {
            console.log('Using audio data from synthesis completed event');
            synthesizer.close();
            resolve(audioData);
            return;
          }

          if (result?.audioData) {
            console.log('Using audio data from synthesis result');
            synthesizer.close();
            resolve(result.audioData);
            return;
          }

          synthesizer.close();
          reject(new Error('No audio data in synthesis result'));
        } catch (error) {
          console.error('Error processing synthesis result:', error);
          synthesizer.close();
          reject(error);
        }
      },
      error => {
        console.error('Speech synthesis error:', error);
        synthesizer.close();
        reject(error);
      }
    );

    // Set a timeout to prevent hanging
    setTimeout(() => {
      if (!audioData) {
        synthesizer.close();
        reject(new Error('Speech synthesis timeout'));
      }
    }, 30000);
  });
}