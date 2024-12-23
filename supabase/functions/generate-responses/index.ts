import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleCors, corsHeaders } from "./utils/cors.ts";
import { getSupabaseClient, fetchConversationData, fetchUserProfile } from "./utils/database.ts";
import { generateOpenAIPrompt, callOpenAI } from "./utils/openai.ts";
import { processOpenAIResponse } from "./utils/responseProcessor.ts";

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { conversationId, userId } = await req.json();
    console.log('Request params:', { conversationId, userId });

    if (!conversationId || !userId) {
      throw new Error('Missing required parameters: conversationId or userId');
    }

    const supabase = getSupabaseClient();
    
    // Fetch data in parallel
    const [conversation, profile] = await Promise.all([
      fetchConversationData(supabase, conversationId),
      fetchUserProfile(supabase, userId)
    ]);

    if (!conversation || !profile) {
      throw new Error('Failed to fetch required data');
    }

    const messages = conversation.messages || [];
    const isFirstMessage = messages.length === 0;

    const systemPrompt = await generateOpenAIPrompt(conversation, profile, messages, isFirstMessage);
    console.log('Generated system prompt');
    
    const aiData = await callOpenAI(systemPrompt, isFirstMessage);
    console.log('Received response from OpenAI');

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