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

    // Fetch conversation context with retry logic
    let conversation;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      const { data, error } = await supabase
        .from('guided_conversations')
        .select(`
          *,
          character:characters(*),
          scenario:scenarios(*),
          messages:guided_conversation_messages(*)
        `)
        .eq('id', conversationId)
        .single();

      if (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        if (retryCount === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        continue;
      }

      conversation = data;
      break;
    }

    if (!conversation) {
      throw new Error('Conversation not found after retries');
    }

    // Prepare conversation history with proper formatting
    const messages = conversation.messages.map((msg: any) => ({
      role: msg.is_user ? 'user' : 'assistant',
      content: msg.content,
    }));

    // Enhanced system prompt
    const systemPrompt = `You are ${conversation.character.name}, an airport staff member.
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
  "translation": "Translation in English",
  "transliteration": "Pronunciation guide using simple characters"
}`;

    console.log('Calling OpenAI with system prompt:', systemPrompt);

    // Call OpenAI API with retry logic
    let openAIResponse;
    retryCount = 0;

    while (retryCount < maxRetries) {
      try {
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
              ...messages,
              { 
                role: 'user', 
                content: lastMessageContent || 'Please start the conversation with an appropriate greeting.' 
              }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          console.error('OpenAI API error:', error);
          throw new Error(`OpenAI API error: ${error}`);
        }

        const completion = await response.json();
        openAIResponse = JSON.parse(completion.choices[0].message.content);
        console.log('Parsed OpenAI response:', openAIResponse);
        break;
      } catch (error) {
        console.error(`OpenAI attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        if (retryCount === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (!openAIResponse?.content || !openAIResponse?.translation) {
      throw new Error('Invalid response format from OpenAI');
    }

    // Insert the AI message with retry logic
    retryCount = 0;
    let newMessage;

    while (retryCount < maxRetries) {
      const { data, error } = await supabase
        .from('guided_conversation_messages')
        .insert({
          conversation_id: conversationId,
          content: openAIResponse.content,
          translation: openAIResponse.translation,
          transliteration: openAIResponse.transliteration,
          is_user: false,
        })
        .select()
        .single();

      if (error) {
        console.error(`Message insertion attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        if (retryCount === maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        continue;
      }

      newMessage = data;
      console.log('Successfully inserted AI message:', newMessage);
      break;
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