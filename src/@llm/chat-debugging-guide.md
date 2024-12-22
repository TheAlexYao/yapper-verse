# Chat Functionality Debugging Guide

## Current Issues

### 1. TTS Generation Failing with HTML Response
The text-to-speech generation is failing with an error: "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"

**Files to Check:**
- `supabase/functions/text-to-speech/index.ts`
  - Issue: Function returning HTML instead of JSON
  - Look for: Response headers and error handling

**Logs:**
```typescript
Cache miss, generating TTS...
TTS generation error: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
Generated audio URL: null
```

### 2. Invalid UUID in Message Fetching
Messages query failing due to null conversation ID being passed.

**Error:**
```
GET https://jgxvzzyfjpntsbhxfcjv.supabase.co/rest/v1/guided_conversation_messages?select=*&conversation_id=eq.null&order=created_at.asc 400 (Bad Request)
```

**Files to Check:**
- `src/components/chat/ChatContainer.tsx`
  - Issue: Null conversation ID being passed to query
  - Look for: Initial conversation ID handling

### 3. Audio URLs Not Being Stored
Generated audio URLs are coming back as null and not being stored in the database.

**Files to Check:**
- `src/components/chat/hooks/useTTS.ts`
  - Issue: TTS generation not returning valid URLs
  - Look for: Error handling in generateTTS function

## Data Flow Analysis

1. **TTS Generation Flow:**
   ```
   Cache miss detected
   → Edge function called
   → HTML returned instead of JSON
   → Parse error occurs
   → Null URL stored
   ```

2. **Message Fetching Flow:**
   ```
   Initial load
   → Null conversation ID
   → 400 Bad Request
   → Query fails
   ```

## Debugging Steps

1. **Check Edge Function Response:**
   ```typescript
   // Add these logs in text-to-speech function
   console.log('Request headers:', req.headers);
   console.log('Response being sent:', response);
   ```

2. **Verify Conversation ID:**
   ```typescript
   // Add these logs in ChatContainer
   console.log('Initial conversation ID:', conversationId);
   console.log('Query params:', { select: '*', conversation_id: conversationId });
   ```

3. **Monitor TTS Generation:**
   ```typescript
   // Add these logs in useTTS
   console.log('Starting TTS generation for:', text);
   console.log('Edge function response:', response);
   ```

## Next Steps

1. Fix edge function to return proper JSON responses
2. Add validation for conversation ID before queries
3. Implement proper error handling in TTS generation
4. Add response type checking in useTTS hook

## Common Issues and Solutions

1. **HTML Instead of JSON:**
   - Verify CORS headers are set correctly
   - Ensure content-type is application/json
   - Check error response formatting

2. **Null Conversation ID:**
   - Add null checks before queries
   - Provide default conversation ID
   - Handle loading states properly

## Testing Checklist

- [ ] Edge function returns valid JSON
- [ ] Conversation ID is valid before queries
- [ ] TTS generation completes successfully
- [ ] Audio URLs are stored correctly
- [ ] Error states are handled gracefully