import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * CORS headers configuration for cross-origin requests
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Maximum time to wait for OpenAI response in milliseconds
 */
const OPENAI_TIMEOUT = 30000;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract required parameters from request body
    const { conversationId, lastMessageContent } = await req.json();
    
    // Validate required parameters
    if (!conversationId || !lastMessageContent) {
      console.error('Missing required parameters');
      throw new Error('Missing required parameters');
    }

    console.log('Processing request for conversation:', conversationId);
    console.log('Last message content:', lastMessageContent);

    // Initialize Supabase client with service role for full database access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch conversation with all related data using joins
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

    // Handle conversation fetch errors
    if (convError || !conversation) {
      console.error('Error fetching conversation:', convError);
      throw new Error('Conversation not found');
    }

    // Log retrieved conversation data for debugging
    console.log('Retrieved conversation data:', {
      characterName: conversation.character?.name,
      scenarioTitle: conversation.scenario?.title,
      nativeLanguage: conversation.native_language?.code,
      targetLanguage: conversation.target_language?.code
    });

    // Get OpenAI API key from environment
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Call OpenAI API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OPENAI_TIMEOUT);

    try {
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: "system",
              content: `You are ${conversation.character.name}, a character in a language learning scenario about ${conversation.scenario.title}. 
                       You should respond in ${conversation.target_language.code} with natural, conversational language.
                       Keep responses concise and focused on the scenario.
                       Cultural context: ${conversation.scenario.cultural_notes}
                       Primary goal: ${conversation.scenario.primary_goal}
                       Your personality: ${conversation.character.language_style?.join(', ')}
                       Location: ${conversation.scenario.location_details}`
            },
            {
              role: "user",
              content: lastMessageContent
            }
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Check if response is ok before proceeding
      if (!openAIResponse.ok) {
        const errorText = await openAIResponse.text();
        console.error('OpenAI API error:', errorText);
        throw new Error(`OpenAI API error: ${openAIResponse.status}`);
      }

      // Parse OpenAI response
      const openAIData = await openAIResponse.json();
      const aiResponse = openAIData.choices?.[0]?.message?.content;

      // Validate AI response
      if (!aiResponse) {
        console.error('No response generated from OpenAI:', openAIData);
        throw new Error('Failed to generate AI response');
      }

      console.log('Generated AI response:', aiResponse);

      // Insert AI message into the database
      const { error: insertError } = await supabase
        .from('guided_conversation_messages')
        .insert({
          conversation_id: conversationId,
          content: aiResponse,
          is_user: false,
        });

      // Handle message insertion errors
      if (insertError) {
        console.error('Error inserting AI message:', insertError);
        throw insertError;
      }

      // Return success response
      return new Response(
        JSON.stringify({ success: true, message: aiResponse }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('OpenAI API request timed out');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    // Log and handle any errors that occur during processing
    console.error('Error in generate-chat-response function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.response?.data || 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});