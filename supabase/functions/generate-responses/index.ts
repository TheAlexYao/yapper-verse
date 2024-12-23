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

    // Process full conversation history
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.is_user ? 'user' : 'assistant',
      content: msg.content,
      translation: msg.translation,
      pronunciationScore: msg.pronunciation_score
    }));

    const isFirstMessage = messages.length === 0;

    // Enhanced system prompt with one-sentence requirement
    const systemPrompt = `You are helping a ${profile.native_language} speaker learn ${profile.target_language} 
in a conversation with ${conversation.character.name}, an airport staff member.

IMPORTANT: Generate ONLY single-sentence responses that are natural and appropriate for the context.

Context:
- Conversation progress: ${messages.length} exchanges
- User's pronunciation level: ${averagePronunciationScore || 'Not yet assessed'}
- Learning focus: ${profile.learning_goals?.join(', ')}
- Setting: ${conversation.scenario.title}
- Cultural notes: ${conversation.scenario.cultural_notes || 'Standard airport etiquette'}

Character: ${conversation.character.name} - ${conversation.character.language_style?.join(', ') || 'Professional and helpful'}
Location: ${conversation.scenario.location_details || 'Airport setting'}
Goal: ${conversation.scenario.primary_goal}

Previous exchanges:
${conversationHistory.map((msg: any) => 
  `${msg.role}: ${msg.content} (${msg.translation})`
).join('\n')}

Generate 3 single-sentence responses that:
1. Are concise but natural for the context
2. Match the user's current level
3. Help achieve the scenario's goal
4. Use appropriate formality for an airport setting

${isFirstMessage ? "Generate three concise ways to approach and greet the airport staff member." : "Continue the conversation naturally with one-sentence responses."}

Format: Generate responses in JSON format with 'responses' array containing objects with 'text' (target language), 'translation' (native language), and 'hint' fields.`;

    // Call OpenAI API
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
            ? 'Generate three concise greetings for the airport staff member.' 
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