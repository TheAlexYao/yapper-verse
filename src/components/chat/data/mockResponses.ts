export const MOCK_RESPONSES = [
  {
    id: "1",
    text: "Je voudrais un café, s'il vous plaît.",
    translation: "I would like a coffee, please.",
    transliteration: "zhuh voo-dreh uhn ka-fey seel voo pleh",
    hint: "This is a polite, formal way to order",
    pronunciationData: {
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: 92,
          FluencyScore: 88,
          CompletenessScore: 95,
          PronScore: 91,
        },
        Words: [
          {
            Word: "Je",
            PronunciationAssessment: {
              AccuracyScore: 95,
              ErrorType: "None",
            },
          },
          {
            Word: "voudrais",
            PronunciationAssessment: {
              AccuracyScore: 88,
              ErrorType: "None",
            },
          },
          {
            Word: "un",
            PronunciationAssessment: {
              AccuracyScore: 98,
              ErrorType: "None",
            },
          },
          {
            Word: "café",
            PronunciationAssessment: {
              AccuracyScore: 94,
              ErrorType: "None",
            },
          },
          {
            Word: "s'il",
            PronunciationAssessment: {
              AccuracyScore: 85,
              ErrorType: "None",
            },
          },
          {
            Word: "vous",
            PronunciationAssessment: {
              AccuracyScore: 92,
              ErrorType: "None",
            },
          },
          {
            Word: "plaît",
            PronunciationAssessment: {
              AccuracyScore: 87,
              ErrorType: "None",
            },
          },
        ],
      }],
    },
  },
  {
    id: "2",
    text: "Un café.",
    translation: "A coffee.",
    transliteration: "uhn ka-fey",
    hint: "This is more casual/informal",
    pronunciationData: {
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: 85,
          FluencyScore: 90,
          CompletenessScore: 100,
          PronScore: 92,
        },
        Words: [
          {
            Word: "Un",
            PronunciationAssessment: {
              AccuracyScore: 95,
              ErrorType: "None",
            },
          },
          {
            Word: "café",
            PronunciationAssessment: {
              AccuracyScore: 75,
              ErrorType: "None",
            },
          },
        ],
      }],
    },
  },
  {
    id: "3",
    text: "Pourriez-vous me recommander votre meilleur café?",
    translation: "Could you recommend your best coffee?",
    transliteration: "poo-ree-ay voo muh ruh-ko-mahn-day vo-truh may-yuhr ka-fey",
    hint: "This shows cultural interest and politeness",
    pronunciationData: {
      NBest: [{
        PronunciationAssessment: {
          AccuracyScore: 78,
          FluencyScore: 82,
          CompletenessScore: 90,
          PronScore: 83,
        },
        Words: [
          {
            Word: "Pourriez",
            PronunciationAssessment: {
              AccuracyScore: 72,
              ErrorType: "None",
            },
          },
          {
            Word: "vous",
            PronunciationAssessment: {
              AccuracyScore: 88,
              ErrorType: "None",
            },
          },
          {
            Word: "me",
            PronunciationAssessment: {
              AccuracyScore: 95,
              ErrorType: "None",
            },
          },
          {
            Word: "recommander",
            PronunciationAssessment: {
              AccuracyScore: 68,
              ErrorType: "None",
            },
          },
          {
            Word: "votre",
            PronunciationAssessment: {
              AccuracyScore: 85,
              ErrorType: "None",
            },
          },
          {
            Word: "meilleur",
            PronunciationAssessment: {
              AccuracyScore: 70,
              ErrorType: "None",
            },
          },
          {
            Word: "café",
            PronunciationAssessment: {
              AccuracyScore: 92,
              ErrorType: "None",
            },
          },
        ],
      }],
    },
  },
];

export const INITIAL_AI_MESSAGE = {
  id: "ai-1",
  text: "Bonjour! Je suis Pierre, votre serveur aujourd'hui. Que puis-je vous servir?",
  translation: "Hello! I'm Pierre, your waiter today. What can I get you?",
  transliteration: "bohn-zhoor, zhuh swee pyehr, voh-truh sehr-vuhr oh-zhoor-dwee. kuh pwee-zhuh voo sehr-veer?",
  isUser: false,
  audio_url: "https://example.com/audio/greeting.mp3",
  pronunciation_score: null,
  pronunciation_data: null,
};