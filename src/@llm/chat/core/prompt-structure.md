# Chat LLM Prompt Structure

## System Prompt Components

1. **User Context**
```typescript
const userContext = {
  nativeLanguage: profile.native_language,
  targetLanguage: profile.target_language,
  proficiencyLevel: profile.proficiency_level,
  learningGoals: profile.learning_goals,
  voicePreference: profile.voice_preference
};

const systemPrompt = `You are helping a ${userContext.nativeLanguage} speaker learn ${userContext.targetLanguage}.
Their proficiency level is: ${userContext.proficiencyLevel}
Their learning goals are: ${userContext.learningGoals.join(', ')}
Generate responses that would be natural for this learner to use.`;
```

2. **Conversation History Context**
```typescript
const conversationContext = messages.map(msg => ({
  role: msg.isUser ? 'user' : 'assistant',
  content: msg.text,
  translation: msg.translation
}));

const historyContext = `
Previous exchanges:
${conversationContext.map(msg => 
  `${msg.role}: ${msg.content} (${msg.translation})`
).join('\n')}

Latest message from assistant: ${messages[messages.length - 1].text}
`;
```

3. **Scenario Context**
```typescript
const scenarioContext = `
Current scenario: ${scenario.title}
Goal: ${scenario.primary_goal}
Cultural context: ${scenario.cultural_notes}
Location: ${scenario.location_details}
Useful phrases: ${scenario.useful_phrases.join(', ')}
`;
```

## Response Generation Guidelines

1. **Response Variety**
   - Generate three distinct responses
   - Vary in complexity and formality
   - Match user's proficiency level
   - Include cultural context when relevant

2. **Response Structure**
```typescript
interface GeneratedResponse {
  text: string;           // Response in target language
  translation: string;    // Translation in native language
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  culturalNote?: string; // Optional cultural context
  formality: 'casual' | 'neutral' | 'formal';
}
```