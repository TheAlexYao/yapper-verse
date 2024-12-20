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

  const pushStream = sdk.AudioInputStream.createPushStream()
  pushStream.write(new Uint8Array(audioData))
  pushStream.close()
  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)

  const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
    referenceText,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Word,
    true
  )

  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)
  pronunciationConfig.applyTo(recognizer)

  try {
    const result = await new Promise((resolve, reject) => {
      recognizer.recognizeOnceAsync(
        result => {
          recognizer.close()
          resolve(result)
        },
        error => {
          recognizer.close()
          reject(error)
        }
      )
    })

    return result
  } catch (error) {
    console.error('Speech recognition error:', error)
    throw error
  }
}