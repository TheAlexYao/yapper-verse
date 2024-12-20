export interface AssessmentResponse {
  success: boolean;
  audioUrl: string;
  assessment: {
    pronunciationScore: number;
    NBest: Array<{
      PronunciationAssessment: {
        AccuracyScore: number;
        FluencyScore: number;
        CompletenessScore: number;
        PronScore: number;
      };
      Words: Array<{
        Word: string;
        PronunciationAssessment: {
          AccuracyScore: number;
          ErrorType: string;
        };
      }>;
      AudioUrl: string;
    }>;
  };
}

export function createDefaultResponse(referenceText: string, audioUrl: string): AssessmentResponse {
  // Set a default score of 50 when no assessment is available
  // This helps distinguish between "no audio detected" (0) and "no assessment available" (50)
  const defaultScore = 50;
  
  return {
    success: true,
    audioUrl,
    assessment: {
      pronunciationScore: defaultScore,
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: defaultScore,
          FluencyScore: defaultScore,
          CompletenessScore: defaultScore,
          PronScore: defaultScore
        },
        Words: [{
          Word: referenceText,
          PronunciationAssessment: {
            AccuracyScore: defaultScore,
            ErrorType: "None"
          }
        }],
        AudioUrl: audioUrl
      }]
    }
  };
}