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
  
  // Set voice name - don't append Neural since it's already in the voice name
  speechConfig.speechSynthesisVoiceName = voiceName;
  
  // Set output format to high quality audio
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio24Khz160KBitRateMonoMp3;

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
    let audioData: ArrayBuffer | null = null;
    let hasResolved = false;

    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!hasResolved) {
        synthesizer.close();
        reject(new Error('Speech synthesis timed out'));
      }
    }, 30000); // 30 second timeout

    synthesizer.synthesisCompleted = (s, e) => {
      console.log('Synthesis completed event received');
      if (e.result.audioData) {
        audioData = e.result.audioData;
      }
    };

    synthesizer.synthesisStarted = (s, e) => {
      console.log('Synthesis started');
    };

    synthesizer.speakSsmlAsync(
      ssml,
      result => {
        clearTimeout(timeout);
        
        try {
          console.log('Synthesis result received:', result);
          
          // First try to use the audio data from the completed event
          if (audioData) {
            console.log('Using audio data from synthesis completed event');
            hasResolved = true;
            resolve(audioData);
            return;
          }

          // Fallback to the result's audio data
          if (result?.audioData) {
            console.log('Using audio data from synthesis result');
            hasResolved = true;
            resolve(result.audioData);
            return;
          }

          reject(new Error('No audio data in synthesis result'));
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

    // Additional error handler
    synthesizer.synthesisCanceled = (s, e) => {
      console.error('Synthesis canceled:', e);
      if (!hasResolved) {
        clearTimeout(timeout);
        synthesizer.close();
        reject(new Error(`Synthesis canceled: ${e.errorDetails}`));
      }
    };
  });
}