# Recommended Responses Flow Documentation

## Overview
The recommended responses system provides AI-generated response options for users during guided conversations. These responses are generated at specific trigger points to avoid infinite loops.

## Flow Steps

1. **Trigger Points**
   - Initial conversation start
   - After user selects a response
   - Manual refresh (if needed)
   ```mermaid
   graph TD
      A[Conversation Start] --> B[Generate Initial Responses]
      C[User Selects Response] --> D[Send Message]
      D --> E[Wait for AI Reply]
      E --> F[Generate New Responses]
   ```

2. **State Management**
   - Responses cached by conversation ID
   - Cache invalidated only on explicit triggers
   - No automatic refetching on AI messages
   ```typescript
   // Query configuration
   {
     queryKey: ['responses', conversationId],
     queryFn: async () => {
       // Generate responses via edge function
       return responses;
     },
     enabled: !!conversationId,
     staleTime: Infinity // Prevent automatic refetching
   }
   ```

3. **Key Components**
   - ChatResponseHandler: Manages response state
   - RecommendedResponses: Displays response options
   - generate-responses Edge Function: Creates AI responses

4. **Response Generation**
   - Fetches latest conversation context
   - Includes user profile data
   - Generates culturally appropriate responses
   - Returns formatted response objects

5. **Error Handling**
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
- Supabase for real-time updates
- React Query for caching
- Toast notifications for user feedback

## User Experience

1. User starts conversation
2. Initial responses generated
3. User selects response
4. Message sent to AI
5. AI replies
6. New responses generated
7. Process repeats

## Performance Considerations

1. **Controlled Updates**
   - No automatic refetching
   - Manual cache invalidation
   - Explicit trigger points
   - Prevents infinite loops

2. **Caching Strategy**
   - Responses cached by conversation
   - Cache cleared on specific actions
   - No automatic invalidation
   - Manual refresh if needed

3. **Error Recovery**
   - Failed requests show user feedback
   - Automatic retry with backoff
   - Graceful degradation to empty state