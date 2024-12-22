import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, lastMessageContent, isInitialMessage = false } = await req.json();
    
    if (!conversationId) {
      console.error('Missing conversation ID');
      return new Response(
        JSON.stringify({ error: 'Missing conversation ID' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Processing request for conversation:', conversationId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch conversation context
    const { data: conversation, error: convError } = await supabase
      .from('guided_conversations')
      .select(`
        *,
        character:characters(*),
        scenario:scenarios(*),
        native_language:languages!guided_conversations_native_language_id_fkey(*),
        target_language:languages!guided_conversations_target_language_id_fkey(*)
      `)
      .eq('id', conversationId)
      .single();

    if (convError) {
      console.error('Error fetching conversation:', convError);
      return new Response(
        JSON.stringify({ error: 'Conversation not found', details: convError }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const openAIKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIKey) {
      console.error('Missing OpenAI API key');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Call OpenAI API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const systemPrompt = isInitialMessage 
        ? `You are ${conversation.character.name}, starting a conversation to help someone learn ${conversation.target_language.name}.
           Give a friendly greeting and introduction in ${conversation.target_language.code}.
           Cultural context: ${conversation.scenario.cultural_notes}
           Primary goal: ${conversation.scenario.primary_goal}
           Your personality: ${conversation.character.language_style?.join(', ')}
           Format: Return a JSON object with 'text', 'transliteration', and 'translation' fields.`
        : `You are ${conversation.character.name}, helping someone learn ${conversation.target_language.name}.
           Respond in ${conversation.target_language.code} and provide:
           1. Response in target language
           2. Transliteration (if applicable)
           3. English translation
           Keep responses natural and conversational.
           Cultural context: ${conversation.scenario.cultural_notes}
           Primary goal: ${conversation.scenario.primary_goal}
           Your personality: ${conversation.character.language_style?.join(', ')}
           Format: Return a JSON object with 'text', 'transliteration', and 'translation' fields.`;

      console.log('Calling OpenAI with system prompt:', systemPrompt);

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: lastMessageContent || "Start the conversation"
            }
          ],
          response_format: { type: "json_object" }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        console.error('OpenAI API error response:', errorText);
        throw new Error(`OpenAI API error: ${openAIResponse.status}\nDetails: ${errorText}`);
      }

      const aiData = await openAIResponse.json();
      console.log('OpenAI response:', aiData);

      if (!aiData.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI');
      }

      const response = JSON.parse(aiData.choices[0].message.content);

      // Insert AI message into database
      const { error: insertError } = await supabase
        .from('guided_conversation_messages')
        .insert({
          conversation_id: conversationId,
          content: response.text,
          translation: response.translation,
          transliteration: response.transliteration,
          is_user: false,
        });

      if (insertError) {
        console.error('Error inserting message:', insertError);
        throw insertError;
      }

      return new Response(
        JSON.stringify({ success: true, message: response }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('OpenAI API request timed out');
        return new Response(
          JSON.stringify({ error: 'Request timed out' }),
          { 
            status: 504,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    console.error('Error in generate-chat-response:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});