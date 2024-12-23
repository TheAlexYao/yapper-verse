# Recommended Responses Flow Documentation

## Overview
The recommended responses system automatically provides AI-generated response options for users during guided conversations. These responses are refreshed automatically whenever a new AI message is received.

## Flow Steps

1. **Trigger Points**
   - After each AI message (automatic)
   - Initial conversation start
   ```mermaid
   graph TD
      A[New AI Message] --> B[Update lastAiMessageId]
      B --> C[Invalidate Query Cache]
      C --> D[Generate New Responses]
      D --> E[Display Updated Options]
   ```

2. **Real-time Updates**
   - WebSocket subscription tracks new AI messages
   - `lastAiMessageId` state updates automatically
   - Query cache invalidation triggers new response generation
   - UI updates with new response options

3. **Key Components**
   - ChatResponseHandler: Manages response state and WebSocket subscription
   - RecommendedResponses: Displays response options
   - generate-responses Edge Function: Creates AI responses

4. **State Management**
   ```typescript
   // Query configuration
   {
     queryKey: ['responses', conversationId, userId, lastAiMessageId],
     queryFn: async () => {
       // Generate responses via edge function
       return responses;
     },
     enabled: !!conversationId && !!userId && !!lastAiMessageId
   }
   ```

5. **Response Generation**
   - Fetches latest conversation context
   - Includes user profile data
   - Generates culturally appropriate responses
   - Returns formatted response objects

6. **Error Handling**
   - Failed generations show toast notifications
   - Loading states prevent duplicate requests
   - Fallback to empty responses array if needed

## Technical Implementation

### Response Format
```typescript
interface Response {
  id: string;
  text: string;
  translation: string;
  hint?: string;
  characterGender: string;
}
```

### Dependencies
- Supabase WebSocket subscriptions
- React Query for caching
- Toast notifications

## User Experience

1. User sees AI message arrive
2. Response options automatically update
3. Loading state shows while generating
4. New options appear when ready
5. User can select from updated responses

## Performance Considerations

1. **Automatic Updates**
   - WebSocket subscription tracks new AI messages
   - `lastAiMessageId` triggers cache invalidation
   - UI updates automatically
   - No manual refresh needed

2. **Caching Strategy**
   - Responses cached by query key
   - Cache includes lastAiMessageId
   - Invalidated on new AI messages
   - Prevents unnecessary regeneration

3. **Error Recovery**
   - Failed requests show user feedback
   - Automatic retry with backoff
   - Graceful degradation to empty state