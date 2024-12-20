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
  // Split reference text into words
  const words = referenceText.split(/[\s,.'!?]+/).filter(word => word.length > 0);
  
  return {
    success: true,
    audioUrl,
    assessment: {
      pronunciationScore: 0,
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: 0,
          FluencyScore: 0,
          CompletenessScore: 0,
          PronScore: 0
        },
        Words: words.map(word => ({
          Word: word,
          PronunciationAssessment: {
            AccuracyScore: 0,
            ErrorType: "NoAudioDetected"
          }
        })),
        AudioUrl: audioUrl
      }]
    }
  };
}