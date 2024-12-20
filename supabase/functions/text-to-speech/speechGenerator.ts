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

  const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

  return new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      ssml,
      result => {
        synthesizer.close();
        if (result.audioData.byteLength > 0) {
          resolve(result.audioData);
        } else {
          reject(new Error('No audio data generated'));
        }
      },
      error => {
        synthesizer.close();
        reject(error);
      }
    );
  });
}