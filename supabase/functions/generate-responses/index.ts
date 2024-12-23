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

    // Get full conversation context
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

    // Get user profile and progress
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Calculate conversation metrics
    const messages = conversation.messages;
    const pronunciationScores = messages
      .filter((msg: any) => msg.pronunciation_score)
      .map((msg: any) => msg.pronunciation_score);
    
    const averagePronunciationScore = pronunciationScores.length > 0
      ? pronunciationScores.reduce((a: number, b: number) => a + b, 0) / pronunciationScores.length
      : null;

    // Process conversation history
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.is_user ? 'user' : 'assistant',
      content: msg.content,
      translation: msg.translation,
      pronunciationScore: msg.pronunciation_score
    }));

    const isFirstMessage = messages.length === 0;

    // Enhanced system prompt focused on one-sentence responses
    const systemPrompt = `You are helping a ${profile.native_language} speaker learn ${profile.target_language} 
in a conversation with ${conversation.character.name}.

Conversation Context:
- Total exchanges: ${messages.length}
- Average pronunciation score: ${averagePronunciationScore || 'N/A'}
- Learning goals: ${profile.learning_goals?.join(', ')}

Current scenario: ${conversation.scenario.title}
Cultural context: ${conversation.scenario.cultural_notes || 'Standard etiquette'}
Character you're talking to: ${conversation.character.name} - ${conversation.character.language_style?.join(', ') || 'Professional and helpful'}
Location details: ${conversation.scenario.location_details || 'General setting'}

Previous exchanges:
${conversationHistory.map((msg: any) => 
  `${msg.role}: ${msg.content} (${msg.translation})${msg.pronunciationScore ? ` [Score: ${msg.pronunciationScore}]` : ''}`
).join('\n')}

Generate 3 response options that:
1. Are EXACTLY ONE SENTENCE each - no compound or complex sentences
2. Are natural and contextually appropriate
3. Match the user's current level (based on pronunciation scores)
4. Use appropriate formality for the context
5. Build upon previous exchanges naturally

${isFirstMessage ? "This is the first message. Generate three simple one-sentence greetings." : "Continue the conversation naturally with one-sentence responses."}

IMPORTANT: Generate responses as if you are the learner speaking. Keep responses concise and natural.
Format: Generate responses in JSON format with 'responses' array containing objects with 'text' (target language), 'translation' (native language), and 'hint' fields.`;

    // Call OpenAI API with enhanced context
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: isFirstMessage 
            ? 'Generate three simple one-sentence greetings.' 
            : 'Generate three natural one-sentence responses based on the conversation context.' 
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
    console.log('OpenAI response:', aiData);

    const generatedContent = JSON.parse(aiData.choices[0].message.content);
    console.log('Parsed generated content:', generatedContent);

    // Transform responses while preserving existing format
    const responses = generatedContent.responses.map((response: any) => ({
      id: crypto.randomUUID(),
      text: response.text,
      translation: response.translation,
      hint: response.hint,
      characterGender: conversation.character.gender || 'female'
    }));

    return new Response(JSON.stringify({ responses }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-responses function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});