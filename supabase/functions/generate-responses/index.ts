import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, userId } = await req.json();
    console.log('Request params:', { conversationId, userId });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch conversation with related data
    const { data: conversation, error: conversationError } = await supabase
      .from('guided_conversations')
      .select(`
        *,
        character:characters(*),
        scenario:scenarios(*),
        messages:guided_conversation_messages(*)
      `)
      .eq('id', conversationId)
      .single();

    if (conversationError) {
      console.error('Error fetching conversation:', conversationError);
      throw new Error('Failed to fetch conversation data');
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      throw new Error('User profile not found');
    }

    // Calculate average pronunciation score
    const messages = conversation.messages;
    const pronunciationScores = messages
      .filter((msg: any) => msg.pronunciation_score)
      .map((msg: any) => msg.pronunciation_score);
    
    const averagePronunciationScore = pronunciationScores.length > 0
      ? pronunciationScores.reduce((a: number, b: number) => a + b, 0) / pronunciationScores.length
      : null;

    // Prepare conversation history
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.is_user ? 'user' : 'assistant',
      content: msg.content,
      translation: msg.translation,
      pronunciationScore: msg.pronunciation_score,
    }));

    const isFirstMessage = messages.length === 0;

    function capitalize(word: string): string {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }

    // Construct system prompt with explicit response format instructions
    const systemPrompt = `You are helping a ${profile.native_language} speaker learn ${profile.target_language}.

Conversation Context:
- Total exchanges: ${messages.length}
- Average pronunciation score: ${averagePronunciationScore || 'N/A'}
- Learning goals: ${profile.learning_goals?.join(', ') || 'None specified'}

Current scenario: ${conversation.scenario.title}
Cultural context: ${conversation.scenario.cultural_notes || 'Standard cultural etiquette'}
Character you're talking to: ${conversation.character.name}
Character's style: ${conversation.character.language_style?.join(', ') || 'Professional and helpful'}

Previous exchanges:
${conversationHistory.map(msg => 
  `${capitalize(msg.role)}: ${msg.content} (${msg.translation})${msg.pronunciationScore ? ` [Score: ${msg.pronunciationScore}]` : ''}`
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

    console.log('Sending request to OpenAI with system prompt');
    
    // Call OpenAI API with explicit response format
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
              ? `Generate three appropriate ways to start the conversation with ${conversation.character.name}.` 
              : 'Generate three natural response options based on the conversation context.' 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to generate responses from OpenAI');
    }

    const aiData = await openAiResponse.json();
    console.log('Received response from OpenAI:', aiData);

    let generatedContent;
    try {
      // Ensure we're parsing the content field from the response
      const content = aiData.choices[0].message.content;
      console.log('Parsing content:', content);
      generatedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Raw response content:', aiData.choices[0].message.content);
      throw new Error('Invalid response format from OpenAI');
    }

    // Validate response structure
    if (!generatedContent?.responses || !Array.isArray(generatedContent.responses)) {
      console.error('Invalid response structure:', generatedContent);
      throw new Error('Invalid response structure from OpenAI');
    }

    // Transform and validate responses
    const responses = generatedContent.responses.map((response: any, index: number) => {
      if (!response.text || !response.translation || !response.transliteration || !response.hint) {
        console.error(`Invalid response at index ${index}:`, response);
        throw new Error(`Response at index ${index} is missing required fields`);
      }

      // Verify single sentence
      const sentenceCount = (response.text.match(/[.!?]/g) || []).length;
      if (sentenceCount !== 1) {
        console.error(`Response at index ${index} has ${sentenceCount} sentences:`, response.text);
        throw new Error(`Response at index ${index} must be a single sentence`);
      }

      return {
        id: crypto.randomUUID(),
        text: response.text.trim(),
        translation: response.translation.trim(),
        transliteration: response.transliteration.trim(),
        hint: response.hint.trim(),
        characterGender: conversation.character.gender || 'unspecified'
      };
    });

    console.log('Successfully processed responses:', responses);

    return new Response(JSON.stringify({ responses }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-responses function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});