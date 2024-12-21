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
    const { conversationId, userId } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Get conversation with related data
    const { data: conversation } = await supabase
      .from('guided_conversations')
      .select(`
        *,
        character:characters(*),
        scenario:scenarios(*),
        messages:guided_conversation_messages(*)
      `)
      .eq('id', conversationId)
      .maybeSingle();

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Get the last message from the AI
    const lastMessage = conversation.messages
      .filter((msg: any) => !msg.is_user)
      .pop();

    if (!lastMessage) {
      throw new Error('No previous AI message found');
    }

    // Construct the system prompt
    const systemPrompt = `You are helping a ${profile.native_language} speaker learn ${profile.target_language}.
Their proficiency level is: ${profile.proficiency_level || 'beginner'}
Their learning goals are: ${profile.learning_goals?.join(', ') || 'general conversation'}

Current scenario: ${conversation.scenario.title}
Goal: ${conversation.scenario.primary_goal}
Cultural context: ${conversation.scenario.cultural_notes}

You are the student responding to a teacher/conversation partner.
The last message you received was: "${lastMessage.content}"
Generate 3 natural responses that:
1. Match the student's current language level
2. Are culturally appropriate
3. Help achieve the conversation goal
4. Consider the cultural context

Format each response in JSON with:
- text (in target language)
- translation (in native language)
- difficulty (beginner/intermediate/advanced)
- culturalNote (optional context)
- formality (casual/neutral/formal)`;

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'Generate 3 appropriate responses.' }
        ],
        temperature: 0.7,
      }),
    });

    const openAIData = await openAIResponse.json();
    console.log('OpenAI Response:', openAIData);

    const generatedResponses = JSON.parse(openAIData.choices[0].message.content);

    // Add unique IDs to responses
    const responsesWithIds = generatedResponses.map((response: any) => ({
      ...response,
      id: crypto.randomUUID(),
    }));

    return new Response(JSON.stringify({ responses: responsesWithIds }), {
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