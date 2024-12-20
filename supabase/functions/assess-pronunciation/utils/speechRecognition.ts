import * as sdk from "npm:microsoft-cognitiveservices-speech-sdk"

interface SpeechConfig {
  speechKey: string
  speechRegion: string
  languageCode: string
  referenceText: string
  audioData: ArrayBuffer
  sampleRate: number
  channels: number
  bitsPerSample: number
}

export async function performSpeechRecognition({
  speechKey,
  speechRegion,
  languageCode,
  referenceText,
  audioData,
  sampleRate,
  channels,
  bitsPerSample
}: SpeechConfig) {
  console.log('Configuring speech recognition with:', {
    languageCode,
    sampleRate,
    channels,
    bitsPerSample,
    audioDataSize: audioData.byteLength
  })

  const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion)
  speechConfig.speechRecognitionLanguage = languageCode
  
  // Configure pronunciation assessment with detailed settings
  const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
    referenceText,
    sdk.PronunciationAssessmentGradingSystem.HundredMark,
    sdk.PronunciationAssessmentGranularity.Phoneme,
    true
  )
  
  // Enable prosody assessment for more detailed feedback
  pronunciationConfig.enableProsodyAssessment = true

  // Set up audio format for PCM
  const format = sdk.AudioStreamFormat.getWaveFormatPCM(sampleRate, bitsPerSample, channels)
  console.log('Configured audio format:', {
    sampleRate: format.samplesPerSec,
    bitsPerSample: format.bitsPerSample,
    channels: format.channels
  })

  const pushStream = sdk.AudioInputStream.createPushStream(format)
  
  // Write PCM data to stream
  pushStream.write(audioData)
  pushStream.close()
  
  const audioConfig = sdk.AudioConfig.fromStreamInput(pushStream)
  const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig)
  
  // Apply pronunciation assessment configuration
  pronunciationConfig.applyTo(recognizer)

  try {
    console.log("Starting speech recognition")
    
    const result = await new Promise((resolve, reject) => {
      recognizer.recognizing = (s, e) => {
        console.log(`RECOGNIZING: Text=${e.result.text}`)
      }

      recognizer.recognized = (s, e) => {
        if (e.result.text) {
          console.log(`RECOGNIZED: Text=${e.result.text}`)
          try {
            const pronResult = sdk.PronunciationAssessmentResult.fromResult(e.result)
            console.log("Pronunciation scores:", {
              accuracyScore: pronResult.accuracyScore,
              fluencyScore: pronResult.fluencyScore,
              completenessScore: pronResult.completenessScore,
              pronunciationScore: pronResult.pronunciationScore
            })
          } catch (error) {
            console.error("Error getting pronunciation result:", error)
          }
        }
      }

      recognizer.canceled = (s, e) => {
        console.log(`CANCELED: Reason=${e.reason}`)
        if (e.reason === sdk.CancellationReason.Error) {
          console.error(`CANCELED: ErrorCode=${e.errorCode}`)
          console.error(`CANCELED: ErrorDetails=${e.errorDetails}`)
          reject(new Error(`Recognition canceled: ${e.errorDetails}`))
        } else {
          reject(new Error(`Recognition canceled: ${e.reason}`))
        }
      }

      recognizer.recognizeOnceAsync(
        result => {
          console.log("Recognition completed:", result)
          recognizer.close()
          resolve(result)
        },
        error => {
          console.error("Recognition error:", error)
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