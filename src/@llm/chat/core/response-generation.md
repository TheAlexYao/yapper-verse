# Response Generation Process

## Edge Function: generate-responses

### Required Context
1. User Context:
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

### Implementation Types

```typescript
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
```