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

    // Get full conversation context
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

    // Get user profile and progress
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    // Calculate conversation metrics
    const messages = conversation.messages;
    const pronunciationScores = messages
      .filter((msg: any) => msg.pronunciation_score)
      .map((msg: any) => msg.pronunciation_score);
    
    const averagePronunciationScore = pronunciationScores.length > 0
      ? pronunciationScores.reduce((a: number, b: number) => a + b, 0) / pronunciationScores.length
      : null;

    // Process full conversation history
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.is_user ? 'user' : 'assistant',
      content: msg.content,
      translation: msg.translation,
      pronunciationScore: msg.pronunciation_score
    }));

    const isFirstMessage = messages.length === 0;

    function capitalize(word: string): string {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }

    // Enhanced system prompt with full context
    const systemPrompt = `You are helping a ${profile.native_language} speaker learn ${profile.target_language} 
in a conversation with ${conversation.character.name}, an airport staff member.

Conversation Context:
- Total exchanges: ${messages.length}
- Average pronunciation score: ${averagePronunciationScore || 'N/A'}
- Learning goals: ${profile.learning_goals?.join(', ')}

Current scenario: ${conversation.scenario.title}
Cultural context: ${conversation.scenario.cultural_notes || 'Standard airport etiquette'}
Character you're talking to: ${conversation.character.name} - ${conversation.character.language_style?.join(', ') || 'Professional and helpful'}
Location details: ${conversation.scenario.location_details || 'Airport setting'}

Previous exchanges:
${conversationHistory.map(msg => 
  `${capitalize(msg.role)}: ${msg.content} (${msg.translation})${msg.pronunciationScore ? ` [Score: ${msg.pronunciationScore}]` : ''}`
).join('\n')}

Generate 3 response options that:
1. Match the user's current level (based on pronunciation scores and exchange history)
2. Are culturally appropriate for the scenario
3. Help achieve the scenario's primary goal: ${conversation.scenario.primary_goal}
4. Are from the perspective of a traveler speaking to an airport staff member
5. Use appropriate formality for speaking with airport staff
6. Build upon previous exchanges and maintain conversation coherence
7. Are single sentences to ensure clarity and manageability

${isFirstMessage ? "This is the first message. Generate three ways to approach and greet the airport staff member." : "Continue the conversation naturally based on the full context provided."}

IMPORTANT: Generate responses as if you are the traveler speaking to the airport staff. Keep responses polite and appropriate for the setting.
Format: Generate responses in JSON format with 'responses' array containing objects with 'text' (target language), 'translation' (native language), 'transliteration' (pronunciation guide), and 'hint' fields.`;

    // Call OpenAI API with enhanced context
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
          { role: 'user', content: isFirstMessage 
            ? 'Generate three polite ways to approach and greet the airport staff member.' 
            : 'Generate three natural response options based on the full conversation context.' 
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

    // Transform responses while preserving existing format
    const responses = generatedContent.responses.map((response: any) => {
      if (!response.text || !response.translation || !response.transliteration || !response.hint) {
        throw new Error('Incomplete response fields from OpenAI');
      }

      // Verify single sentence
      const sentenceCount = (response.text.match(/[.!?]/g) || []).length;
      if (sentenceCount !== 1) {
        throw new Error('Response text is not a single sentence');
      }

      return {
        id: crypto.randomUUID(),
        text: response.text,
        translation: response.translation,
        transliteration: response.transliteration,
        hint: response.hint,
        characterGender: conversation.character.gender || 'female'
      };
    });

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