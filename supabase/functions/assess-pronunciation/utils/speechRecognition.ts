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
  
  // Configure speech recognition with more permissive settings
  speechConfig.setProperty("SpeechServiceConnection_InitialSilenceTimeoutMs", "10000")
  speechConfig.setProperty("SpeechServiceConnection_EndSilenceTimeoutMs", "10000")
  speechConfig.setProperty("SpeechServiceConnection_NoSignalTimeoutMs", "10000")
  speechConfig.setProfanity(sdk.ProfanityOption.Raw)
  speechConfig.enableAudioLogging()

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
    console.log("Starting speech recognition with config:", {
      language: languageCode,
      referenceText,
      silenceTimeouts: {
        initial: speechConfig.getProperty("SpeechServiceConnection_InitialSilenceTimeoutMs"),
        end: speechConfig.getProperty("SpeechServiceConnection_EndSilenceTimeoutMs"),
        noSignal: speechConfig.getProperty("SpeechServiceConnection_NoSignalTimeoutMs")
      }
    })

    const result = await new Promise((resolve, reject) => {
      recognizer.recognizing = (s, e) => {
        console.log(`RECOGNIZING: Text=${e.result.text}`)
      }

      recognizer.recognized = (s, e) => {
        console.log(`RECOGNIZED: Text=${e.result.text}`)
      }

      recognizer.canceled = (s, e) => {
        console.log(`CANCELED: Reason=${e.reason}`)
        if (e.reason === sdk.CancellationReason.Error) {
          console.error(`CANCELED: ErrorCode=${e.errorCode}`)
          console.error(`CANCELED: ErrorDetails=${e.errorDetails}`)
        }
      }

      recognizer.recognizeOnceAsync(
        result => {
          console.log("Recognition completed with status:", result.privJson)
          recognizer.close()
          resolve(result)
        },
        error => {
          console.error("Speech recognition error:", error)
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