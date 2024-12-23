# Chat Data Flow

## Database Structure

1. Messages stored in guided_conversation_messages table
2. Each message linked to conversation in guided_conversations
3. Message data includes:
   - Content (text)
   - Translation
   - Transliteration
   - Audio URL
   - Pronunciation data
   - User flag
   - Scores

## Database Interactions

```typescript
// Get user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

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
  .single();
```