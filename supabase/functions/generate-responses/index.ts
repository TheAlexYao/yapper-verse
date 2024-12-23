import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "./utils/cors.ts";
import { getSupabaseClient, fetchConversationData, fetchUserProfile } from "./utils/database.ts";
import { generateOpenAIPrompt, callOpenAI } from "./utils/openai.ts";
import { processOpenAIResponse } from "./utils/responseProcessor.ts";

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { conversationId, userId } = await req.json();
    console.log('Request params:', { conversationId, userId });

    const supabase = getSupabaseClient();
    const conversation = await fetchConversationData(supabase, conversationId);
    const profile = await fetchUserProfile(supabase, userId);
    
    const messages = conversation.messages;
    const isFirstMessage = messages.length === 0;

    const systemPrompt = await generateOpenAIPrompt(conversation, profile, messages, isFirstMessage);
    console.log('Sending request to OpenAI with system prompt');
    
    const aiData = await callOpenAI(systemPrompt, isFirstMessage);
    console.log('Received response from OpenAI:', aiData);

    const responses = processOpenAIResponse(aiData);
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