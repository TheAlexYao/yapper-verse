export const generateOpenAIPrompt = (conversation: any, profile: any, messages: any[], isFirstMessage: boolean) => {
  const pronunciationScores = messages
    .filter((msg: any) => msg.pronunciation_score)
    .map((msg: any) => msg.pronunciation_score);
  
  const averagePronunciationScore = pronunciationScores.length > 0
    ? pronunciationScores.reduce((a: number, b: number) => a + b, 0) / pronunciationScores.length
    : null;

  const conversationHistory = messages.map((msg: any) => ({
    role: msg.is_user ? 'user' : 'assistant',
    content: msg.content,
    translation: msg.translation,
    pronunciationScore: msg.pronunciation_score,
  }));

  return `You are helping a ${profile.native_language} speaker learn ${profile.target_language}.

Conversation Context:
- Total exchanges: ${messages.length}
- Average pronunciation score: ${averagePronunciationScore || 'N/A'}
- Learning goals: ${profile.learning_goals?.join(', ') || 'None specified'}

Current scenario: ${conversation.scenario.title}
Cultural context: ${conversation.scenario.cultural_notes || 'Standard cultural etiquette'}
Character you're talking to: ${conversation.character.name}
Character's style: ${conversation.character.language_style?.join(', ') || 'Professional and helpful'}

Previous exchanges:
${conversationHistory.map((msg: any) => 
  `${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}: ${msg.content} (${msg.translation})${
    msg.pronunciationScore ? ` [Score: ${msg.pronunciationScore}]` : ''
  }`
).join('\n')}

Generate 3 response options that:
1. Match the user's current level
2. Are culturally appropriate
3. Help achieve the scenario's primary goal: ${conversation.scenario.primary_goal}
4. Use appropriate formality
5. Build upon previous exchanges
6. Are single sentences

IMPORTANT: You must respond with valid JSON in this exact format:
{
  "responses": [
    {
      "text": "Response in target language",
      "translation": "Translation in native language",
      "transliteration": "Pronunciation guide",
      "hint": "Usage hint"
    }
  ]
}`;
};

export const callOpenAI = async (systemPrompt: string, isFirstMessage: boolean) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: isFirstMessage 
            ? 'Generate three appropriate ways to start the conversation.'
            : 'Generate three natural response options based on the conversation context.'
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('OpenAI API error:', errorData);
    throw new Error('Failed to generate responses from OpenAI');
  }

  return response.json();
};