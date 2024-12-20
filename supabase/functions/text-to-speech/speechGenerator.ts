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

  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);
  speechConfig.speechSynthesisVoiceName = voiceName;

  // Set rate adjustment based on speed
  let rateAdjustment = '';
  if (speed === 'slow') {
    rateAdjustment = ' rate="-20%"';
  } else if (speed === 'very-slow') {
    rateAdjustment = ' rate="-50%"';
  }

  const ssml = `
    <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${languageCode}">
      <voice name="${voiceName}">
        <prosody${rateAdjustment}>
          ${text}
        </prosody>
      </voice>
    </speak>`;

  console.log('Generating speech with SSML:', ssml);
  
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

  return new Promise((resolve, reject) => {
    let hasResolved = false;

    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!hasResolved) {
        synthesizer.close();
        reject(new Error('Speech synthesis timed out'));
      }
    }, 30000); // 30 second timeout

    synthesizer.speakSsmlAsync(
      ssml,
      result => {
        clearTimeout(timeout);
        
        try {
          if (!result) {
            throw new Error('No synthesis result received');
          }

          const { audioData } = result;
          
          if (!audioData) {
            throw new Error('No audio data in synthesis result');
          }

          if (audioData.byteLength === 0) {
            throw new Error('Audio data is empty');
          }

          hasResolved = true;
          resolve(audioData);
        } catch (error) {
          console.error('Error processing synthesis result:', error);
          reject(error);
        } finally {
          synthesizer.close();
        }
      },
      error => {
        clearTimeout(timeout);
        console.error('Speech synthesis error:', error);
        synthesizer.close();
        reject(error);
      }
    );
  });
}