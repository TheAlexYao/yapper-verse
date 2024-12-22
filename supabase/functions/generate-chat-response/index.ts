import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Configuration, OpenAIApi } from 'https://esm.sh/openai@3.3.0';

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
    const { conversationId, lastMessageContent } = await req.json();
    
    if (!conversationId || !lastMessageContent) {
      throw new Error('Missing required parameters');
    }

    console.log('Processing request for conversation:', conversationId);
    console.log('Last message content:', lastMessageContent);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get conversation details with related data
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

    if (convError || !conversation) {
      console.error('Error fetching conversation:', convError);
      throw new Error('Conversation not found');
    }

    console.log('Retrieved conversation data:', {
      characterName: conversation.character?.name,
      scenarioTitle: conversation.scenario?.title,
      nativeLanguage: conversation.native_language?.code,
      targetLanguage: conversation.target_language?.code
    });

    // Initialize OpenAI
    const configuration = new Configuration({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });
    const openai = new OpenAIApi(configuration);

    // Generate response
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
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
    });

    const aiResponse = completion.data.choices[0]?.message?.content;
    if (!aiResponse) {
      console.error('No response generated from OpenAI');
      throw new Error('Failed to generate AI response');
    }

    console.log('Generated AI response:', aiResponse);

    // Insert AI message
    const { error: insertError } = await supabase
      .from('guided_conversation_messages')
      .insert({
        conversation_id: conversationId,
        content: aiResponse,
        is_user: false,
      });

    if (insertError) {
      console.error('Error inserting AI message:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ success: true, message: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
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