# Chat LLM Integration Documentation

## Current Chat Interface Architecture

### Key Components

1. **ChatContainer.tsx**
   - Main container component managing the chat interface
   - Handles TTS generation for AI messages
   - Manages pronunciation scoring modal
   - Props:
     - messages: Message[]
     - onMessageSend: (message: Message) => void
     - onPlayTTS: (text: string) => void
     - conversationId: string

2. **ChatMessagesSection.tsx**
   - Handles message display and auto-scrolling
   - Props:
     - messages: Message[]
     - onPlayAudio: (audioUrl: string) => void
     - onShowScore: (message: Message) => void

3. **ChatBottomSection.tsx**
   - Manages chat metrics and response handling
   - Props:
     - messages: Message[]
     - conversationId: string
     - onMessageSend: (message: Message) => void

4. **ChatResponseHandler.tsx**
   - Currently uses mock responses from MOCK_RESPONSES
   - Handles pronunciation modal and TTS generation
   - Props:
     - onMessageSend: (message: Message) => void
     - conversationId: string

### Current Data Flow

1. Messages are stored in the guided_conversation_messages table
2. Each message is linked to a conversation in guided_conversations
3. Messages contain:
   - Content (text)
   - Translation
   - Transliteration
   - Audio URL
   - Pronunciation data
   - User flag
   - Scores

## LLM Integration Plan

### 1. New Edge Function: generate-responses

#### Input Context Required
1. User Context (from profiles table):
   - Native language
   - Target language
   - Voice preference
   - Learning goals
   - Custom goals

2. Conversation Context:
   - Previous messages
   - Current scenario
   - Character information
   - Language proficiency metrics

3. Scenario Context:
   - Cultural notes
   - Primary goals
   - Location details
   - Useful phrases

#### Database Interactions

1. **Tables Used:**
   - profiles
   - guided_conversations
   - guided_conversation_messages
   - scenarios
   - characters
   - languages

2. **Required Queries:**
```typescript
// Get user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Get conversation with related data
const { data: conversation } = await supabase
  .from('guided_conversations')
  .select(`
    *,
    character:characters(*),
    scenario:scenarios(*),
    messages:guided_conversation_messages(*)
  `)
  .eq('id', conversationId)
  .single();
```

### Implementation Steps

1. Create Edge Function:
```typescript
// supabase/functions/generate-responses/index.ts
interface GenerateResponsesPayload {
  conversationId: string;
  userId: string;
  lastMessageContent: string;
}

interface ResponseOption {
  text: string;
  translation: string;
  transliteration?: string;
  hint?: string;
}
```

2. Update ChatResponseHandler:
```typescript
interface RecommendedResponse {
  id: string;
  text: string;
  translation: string;
  transliteration?: string;
  hint?: string;
  pronunciationData?: any;
}
```

3. Replace Mock Data:
   - Remove MOCK_RESPONSES from data/mockResponses.ts
   - Integrate real-time response generation
   - Cache responses in local state

### Required Types

```typescript
interface ConversationContext {
  messages: Message[];
  scenario: {
    title: string;
    description: string;
    culturalNotes: string;
    primaryGoal: string;
    usefulPhrases: string[];
  };
  character: {
    name: string;
    bio: string;
    languageStyle: string[];
  };
}

interface UserContext {
  nativeLanguage: string;
  targetLanguage: string;
  voicePreference: string;
  learningGoals: string[];
  customGoals: string[];
}

interface GeneratedResponse {
  text: string;
  translation: string;
  transliteration?: string;
  hint?: string;
  pronunciationData?: {
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
    }>;
  };
}
```

### OpenAI Integration Notes

1. System Prompt Structure:
```typescript
const systemPrompt = `You are a language learning assistant helping with ${targetLanguage}.
Current scenario: ${scenario.title}
Cultural context: ${scenario.culturalNotes}
Character personality: ${character.languageStyle.join(', ')}
User's native language: ${nativeLanguage}
Learning goals: ${learningGoals.join(', ')}

Generate 3 response options that:
1. Match the user's current language level
2. Are culturally appropriate
3. Help achieve the scenario's primary goal: ${scenario.primaryGoal}
4. Consider the character's personality and language style
`;
```

2. Response Format:
```json
{
  "responses": [
    {
      "text": "Native language text",
      "translation": "English translation",
      "transliteration": "Pronunciation guide",
      "hint": "Cultural or usage context",
      "difficulty": "beginner|intermediate|advanced"
    }
  ]
}
```

### Edge Function Configuration

Required secrets:
- OPENAI_API_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Future Considerations

1. Response Caching:
   - Cache common responses in tts_cache table
   - Implement similarity matching for frequently used phrases

2. Performance Optimization:
   - Implement rate limiting
   - Add response generation timeout
   - Cache OpenAI responses

3. Error Handling:
   - Handle OpenAI API failures
   - Implement fallback responses
   - Add retry logic for failed generations