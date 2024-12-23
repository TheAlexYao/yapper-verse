# Recommended Responses Flow Documentation

## Overview
The recommended responses system provides AI-generated response options for users during guided conversations. This document outlines the complete flow from generation to display.

## Flow Steps

1. **Trigger Points**
   - Initial conversation start
   - After each AI message
   - Manual refresh (if implemented)

2. **Data Flow**
   ```mermaid
   graph TD
      A[User Action] --> B[Query Cache Check]
      B --> C{Cache Valid?}
      C -->|Yes| D[Display Cached Responses]
      C -->|No| E[Generate New Responses]
      E --> F[Edge Function Call]
      F --> G[Update Cache]
      G --> D
   ```

3. **Key Components**
   - ChatResponseHandler: Manages response state and generation
   - RecommendedResponses: Displays response options
   - generate-responses Edge Function: Creates AI responses

4. **State Management**
   - Uses React Query for caching and invalidation
   - Tracks last AI message ID as dependency
   - Maintains loading states for UI feedback

5. **Response Generation**
   - Fetches conversation context
   - Includes user profile data
   - Generates culturally appropriate responses
   - Returns formatted response objects

6. **Error Handling**
   - Failed generations show toast notifications
   - Loading states prevent duplicate requests
   - Fallback to empty responses array if needed

## Technical Implementation

### Query Configuration
```typescript
{
  queryKey: ['responses', conversationId, userId, lastAiMessageId],
  queryFn: async () => {
    // Generate responses via edge function
    return responses;
  },
  enabled: !!conversationId && !!userId && !!lastAiMessageId
}
```

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
- Supabase Edge Functions
- React Query
- Toast notifications
- WebSocket subscriptions

## User Experience

1. User sees loading state while responses generate
2. Responses appear with text and translation
3. User can navigate between multiple options
4. Selection triggers pronunciation modal
5. Process repeats after each message

## Performance Considerations

1. **Caching Strategy**
   - Responses cached by query key
   - Cache invalidated on new AI messages
   - Prevents unnecessary regeneration

2. **Real-time Updates**
   - WebSocket subscription tracks new messages
   - Triggers cache invalidation
   - Updates UI automatically

3. **Error Recovery**
   - Failed requests show user feedback
   - Automatic retry with backoff
   - Graceful degradation to empty state