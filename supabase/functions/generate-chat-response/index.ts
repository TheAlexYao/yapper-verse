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
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch conversation context with error handling
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

    if (convError) {
      console.error('Error fetching conversation:', convError);
      throw new Error('Conversation not found');
    }

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Fetch user profile with error handling
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('User profile not found');
    }

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Prepare conversation history
    const messages = conversation.messages.map((msg: any) => ({
      role: msg.is_user ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Prepare system prompt
    const systemPrompt = `You are ${conversation.character.name}, an airport staff member speaking ${profile.target_language}.

Your personality: ${conversation.character.language_style?.join(', ') || 'Professional and helpful'}
Scenario: ${conversation.scenario.title}
Cultural context: ${conversation.scenario.cultural_notes || 'Standard airport etiquette'}
Goal: ${conversation.scenario.primary_goal}

Generate responses that:
1. Stay in character as the airport staff member
2. Are helpful and professional
3. Match the scenario context
4. Use appropriate formality for airport staff
${isInitialMessage ? '5. Start with a professional greeting appropriate for airport staff' : ''}

IMPORTANT: Your response must be in JSON format with these fields:
{
  "content": "Response in target language",
  "translation": "Translation in user's native language",
  "transliteration": "Pronunciation guide using simple characters",
  "hint": "Optional cultural or usage context"
}`;

    console.log('Calling OpenAI with system prompt');

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Call OpenAI API with error handling
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIKey}`,
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
    console.log('Received OpenAI response');

    // Parse the response with error handling
    let aiResponse;
    try {
      aiResponse = JSON.parse(completion.choices[0].message.content);
      
      // Basic validation of required fields
      if (!aiResponse.content) {
        console.error('Missing content in parsed response:', aiResponse);
        throw new Error('Invalid response format: missing content');
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      console.error('Raw response:', completion.choices[0].message.content);
      throw new Error('Failed to parse AI response');
    }

    // Insert the AI message with error handling
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
      console.error('Error inserting message:', insertError);
      throw insertError;
    }

    return new Response(JSON.stringify(newMessage), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-chat-response function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
        details: error.toString()
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});