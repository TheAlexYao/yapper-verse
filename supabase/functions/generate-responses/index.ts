import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    console.log('Received request to generate responses');
    const { conversationId, userId } = await req.json();
    console.log('Request params:', { conversationId, userId });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    if (!profile) {
      throw new Error('User profile not found');
    }

    console.log('Retrieved profile:', profile);

    // Get conversation with related data
    const { data: conversation, error: conversationError } = await supabase
      .from('guided_conversations')
      .select(`
        *,
        character:characters(*),
        scenario:scenarios(*),
        messages:guided_conversation_messages(*)
      `)
      .eq('id', conversationId)
      .maybeSingle();

    if (conversationError) {
      console.error('Error fetching conversation:', conversationError);
      throw new Error('Failed to fetch conversation data');
    }

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    console.log('Retrieved conversation data');

    // Get the last message from the AI
    const lastMessage = conversation.messages
      .filter((msg: any) => !msg.is_user)
      .pop();

    if (!lastMessage) {
      throw new Error('No previous AI message found');
    }

    // Mock responses for now (we'll integrate OpenAI later)
    const mockResponses = [
      {
        id: crypto.randomUUID(),
        text: "Je voudrais un café, s'il vous plaît.",
        translation: "I would like a coffee, please.",
        transliteration: "zhuh voo-DREH uh kah-FEH, seel voo PLEH.",
        hint: "Polite way to order coffee"
      },
      {
        id: crypto.randomUUID(),
        text: "Un thé pour moi, merci.",
        translation: "A tea for me, thank you.",
        transliteration: "uh teh poor MWAH, mair-SEE.",
        hint: "Simple tea order"
      },
      {
        id: crypto.randomUUID(),
        text: "Qu'est-ce que vous recommandez?",
        translation: "What do you recommend?",
        transliteration: "kess kuh voo ruh-koh-mahn-DEH?",
        hint: "Asking for recommendations"
      }
    ];

    console.log('Generated responses');

    return new Response(JSON.stringify({ responses: mockResponses }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-responses function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});