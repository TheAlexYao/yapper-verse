# Chat Interface Architecture

## Component Structure

1. **ChatContainer**
   - Main orchestrator component
   - Manages message playback state
   - Handles pronunciation feedback
   - Uses memo for performance optimization

2. **ChatMessagesSection**
   - Handles message display and scrolling
   - Auto-scrolls on new messages
   - Manages audio playback UI
   - Displays pronunciation feedback

3. **ChatBottomSection**
   - Handles response selection
   - Manages message sending
   - Displays conversation metrics

## Hook Management

1. **useConversationMessages**
   ```typescript
   // Manages real-time message subscriptions and TTS generation
   const { messages } = useConversationMessages(conversationId);
   ```
   - Handles initial message loading
   - Sets up Supabase real-time subscriptions
   - Manages TTS generation queue
   - Handles subscription cleanup
   - Tracks message processing state

2. **useMessageHandling**
   ```typescript
   // Handles message sending and AI response generation
   const { handleMessageSend } = useMessageHandling(conversationId);
   ```
   - Manages message insertion
   - Triggers AI response generation
   - Handles error states

3. **useTTSHandler**
   ```typescript
   // Manages Text-to-Speech generation
   const { generateTTSForMessage } = useTTSHandler(conversationId);
   ```
   - Handles TTS generation requests
   - Manages audio URL updates
   - Handles caching logic

## Subscription Management

1. **Message Subscriptions**
   ```typescript
   // In useConversationMessages
   supabase
     .channel(`messages:${conversationId}`)
     .on('postgres_changes', {
       event: 'INSERT',
       schema: 'public',
       table: 'guided_conversation_messages',
       filter: `conversation_id=eq.${conversationId}`
     }, handleNewMessage)
     .on('postgres_changes', {
       event: 'UPDATE',
       schema: 'public',
       table: 'guided_conversation_messages',
       filter: `conversation_id=eq.${conversationId}`
     }, handleMessageUpdate)
     .subscribe()
   ```
   - Tracks new messages (INSERT)
   - Tracks message updates (UPDATE)
   - Handles subscription cleanup
   - Uses conversation-specific channels
   - Manages subscription state map

2. **Subscription Cleanup**
   - Automatically removes channels on unmount
   - Prevents memory leaks
   - Handles multiple conversation scenarios
   - Uses activeSubscriptions map for tracking

## Data Flow

1. **Message Processing**
   ```typescript
   interface Message {
     id: string;
     text: string;
     translation?: string;
     transliteration?: string;
     isUser: boolean;
     audio_url?: string;
     pronunciation_score?: number;
     pronunciation_data?: any;
     reference_audio_url?: string;
   }
   ```

2. **State Management**
   - Uses React Query for server state
   - Local state for UI elements
   - WebSocket for real-time updates
   - Manages TTS generation queue

3. **Event Handling**
   - Message selection
   - Audio playback
   - Pronunciation assessment
   - Score display

## Performance Optimizations

1. **Component Memoization**
   ```typescript
   const MemoizedChatMessagesSection = memo(ChatMessagesSection);
   const MemoizedChatBottomSection = memo(ChatBottomSection);
   ```

2. **Subscription Management**
   - Single subscription per conversation
   - Efficient cleanup on unmount
   - Prevents duplicate subscriptions
   - Uses Map for O(1) lookup

3. **Message Processing**
   - Processes TTS in queue
   - Prevents duplicate processing
   - Handles race conditions
   - Uses ref for processing state

## Error Handling

1. **Subscription Errors**
   - Toast notifications for failures
   - Automatic retry logic
   - Graceful degradation
   - User feedback

2. **Message Processing Errors**
   - Handles TTS generation failures
   - Manages audio playback errors
   - Provides user feedback
   - Maintains message state integrity