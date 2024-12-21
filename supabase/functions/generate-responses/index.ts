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
    const { conversationId, userId } = await req.json();
    console.log('Request params:', { conversationId, userId });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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
      .single();

    if (conversationError) {
      console.error('Error fetching conversation:', conversationError);
      throw new Error('Failed to fetch conversation data');
    }

    // Get user profile for language context
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Get the last few messages for context
    const recentMessages = conversation.messages
      .slice(-5)
      .map((msg: any) => ({
        role: msg.is_user ? 'user' : 'assistant',
        content: msg.content,
        translation: msg.translation
      }));

    const isFirstMessage = conversation.messages.length === 0;

    // Prepare the system prompt
    const systemPrompt = `You are helping a ${profile.native_language} speaker learn ${profile.target_language} 
in a conversation with ${conversation.character.name}, an airport staff member.

Current scenario: ${conversation.scenario.title}
Cultural context: ${conversation.scenario.cultural_notes || 'Standard airport etiquette'}
Character you're talking to: ${conversation.character.name} - ${conversation.character.language_style?.join(', ') || 'Professional and helpful'}

Generate 3 response options that:
1. Match a beginner-intermediate level
2. Are culturally appropriate
3. Help achieve the scenario's primary goal: ${conversation.scenario.primary_goal}
4. Are from the perspective of a traveler speaking to an airport staff member
5. Use appropriate formality for speaking with airport staff

${isFirstMessage ? "This is the first message. Generate three ways to approach and greet the airport staff member." : "Continue the conversation naturally based on the context."}

IMPORTANT: Generate responses as if you are the traveler speaking to the airport staff. Keep responses polite and appropriate for the setting.
Format: Generate responses in JSON format with 'responses' array containing objects with 'text' (target language), 'translation' (native language), and 'hint' fields.`;

    // Call OpenAI API
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...recentMessages,
          { 
            role: 'user', 
            content: isFirstMessage 
              ? 'Generate three polite ways to approach and greet the airport staff member.' 
              : 'Generate three natural response options based on the conversation context.' 
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      }),
    });

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json();
      console.error('OpenAI API error:', errorData);
      throw new Error('Failed to generate responses from OpenAI');
    }

    const aiData = await openAiResponse.json();
    console.log('OpenAI response:', aiData);

    const generatedContent = JSON.parse(aiData.choices[0].message.content);
    console.log('Parsed generated content:', generatedContent);

    // Transform the responses into the expected format
    const responses = generatedContent.responses.map((response: any) => ({
      id: crypto.randomUUID(),
      text: response.text,
      translation: response.translation,
      hint: response.hint,
      characterGender: conversation.character.gender || 'female'
    }));

    return new Response(JSON.stringify({ responses }), {
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