export interface AssessmentResponse {
  success: boolean
  audioUrl: string
  assessment: {
    NBest: Array<{
      PronunciationAssessment: {
        AccuracyScore: number
        FluencyScore: number
        CompletenessScore: number
        PronScore: number
      }
      Words: Array<{
        Word: string
        PronunciationAssessment: {
          AccuracyScore: number
          ErrorType: string
        }
      }>
      AudioUrl: string
    }>
  }
}

export function createDefaultResponse(referenceText: string, audioUrl: string): AssessmentResponse {
  return {
    success: true,
    audioUrl,
    assessment: {
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: 0,
          FluencyScore: 0,
          CompletenessScore: 0,
          PronScore: 0
        },
        Words: [{
          Word: referenceText,
          PronunciationAssessment: {
            AccuracyScore: 0,
            ErrorType: "None"
          }
        }],
        AudioUrl: audioUrl
      }]
    }
  }
}