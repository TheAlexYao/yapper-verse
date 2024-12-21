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
    const { conversationId, userId, lastMessageContent, isInitialMessage } = await req.json();
    console.log('Generating response for:', { conversationId, userId, isInitialMessage });
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch conversation context
    const { data: conversation, error: convError } = await supabase
      .from('guided_conversations')
      .select(`
        *,
        character:characters(*),
        scenario:scenarios(*),
        messages:guided_conversation_messages(*)
      `)
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      throw new Error('Conversation not found');
    }

    // Fetch user profile for language context
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    // Prepare conversation history
    const messages = conversation.messages.map((msg: any) => ({
      role: msg.is_user ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Prepare system prompt
    const systemPrompt = `You are a language learning assistant helping with ${conversation.character.name}, 
who is a native ${profile.target_language} speaker in this scenario: ${conversation.scenario.title}.

Cultural context: ${conversation.scenario.cultural_notes}
Character personality: ${conversation.character.language_style?.join(', ')}
User's native language: ${profile.native_language}
Learning goals: ${profile.learning_goals?.join(', ')}

Generate responses that:
1. Match the user's current language level
2. Are culturally appropriate
3. Help achieve the scenario's primary goal: ${conversation.scenario.primary_goal}
4. Consider the character's personality and language style
${isInitialMessage ? '5. Start with a friendly greeting appropriate for this scenario' : ''}

IMPORTANT: Your response must be in JSON format with these fields:
{
  "content": "Response in target language",
  "translation": "Translation in user's native language",
  "transliteration": "Pronunciation guide using simple characters",
  "hint": "Optional cultural or usage context"
}`;

    console.log('Calling OpenAI with system prompt:', systemPrompt);

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages,
          { 
            role: 'user', 
            content: lastMessageContent || 'Please start the conversation with an appropriate greeting.' 
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    const completion = await openAIResponse.json();
    console.log('OpenAI response:', completion);

    // Parse the response
    const aiResponse = JSON.parse(completion.choices[0].message.content);

    // Insert the AI message into the database
    const { data: newMessage, error: insertError } = await supabase
      .from('guided_conversation_messages')
      .insert({
        conversation_id: conversationId,
        content: aiResponse.content,
        translation: aiResponse.translation,
        transliteration: aiResponse.transliteration,
        is_user: false,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(JSON.stringify(newMessage), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-chat-response function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});