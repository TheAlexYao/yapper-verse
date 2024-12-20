import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk"

interface SpeechConfig {
  speechKey: string
  speechRegion: string
  languageCode: string
  referenceText: string
  audioData: ArrayBuffer
}

export async function performSpeechRecognition({
  speechKey,
  speechRegion,
  languageCode,
  referenceText,
  audioData
}: SpeechConfig) {
  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)
  speechConfig.speechRecognitionLanguage = languageCode
  
  // Configure pronunciation assessment with more detailed settings
  const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
    referenceText,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Phoneme,
    true
  );

  // Set up audio format specifically for 16kHz mono PCM
  const format = sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1);
  const pushStream = sdk.AudioInputStream.createPushStream(format);
  
  // Convert audio data to proper format and write to stream
  const audioArray = new Uint8Array(audioData);
  pushStream.write(audioArray.buffer);
  pushStream.close();
  
  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream);

  // Create recognizer with pronunciation assessment
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
  pronunciationConfig.applyTo(recognizer);

  // Enable detailed recognition logging
  recognizer.recognizing = (s, e) => {
    console.log(`RECOGNIZING: Text=${e.result.text}`);
  };

  recognizer.recognized = (s, e) => {
    if (e.result.text) {
      console.log(`RECOGNIZED: Text=${e.result.text}`);
    }
  };

  recognizer.canceled = (s, e) => {
    console.log(`CANCELED: Reason=${e.reason}`);
    if (e.reason === sdk.CancellationReason.Error) {
      console.error(`CANCELED: ErrorCode=${e.errorCode}`);
      console.error(`CANCELED: ErrorDetails=${e.errorDetails}`);
    }
  };

  try {
    console.log("Starting speech recognition with format:", format);
    
    const result = await new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        result => {
          console.log("Recognition result:", result);
          recognizer.close();
          resolve(result);
        },
        error => {
          console.error("Recognition error:", error);
          recognizer.close();
          reject(error);
        }
      );
    });

    return result;
  } catch (error) {
    console.error('Speech recognition error:', error);
    throw error;
  }
}