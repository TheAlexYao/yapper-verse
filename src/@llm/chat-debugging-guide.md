# Chat Functionality Debugging Guide

## Current Issues

### 1. Duplicate Message Subscriptions
Multiple message subscriptions are being created for the same conversation.

**Symptoms:**
- Multiple "Setting up message subscription for conversation:" logs for the same conversation ID
- Same conversation ID being subscribed to repeatedly
- Initial messages load correctly but subscription setup happens multiple times
- Multiple "Successfully subscribed to conversation:" logs for identical conversation IDs

**Root Causes:**
1. Component re-renders triggering subscription setup multiple times
2. Multiple subscription points in the codebase
3. Subscription cleanup not properly synchronized with component lifecycle

**Observable Behavior:**
```typescript
// Console output shows multiple identical subscription attempts:
Setting up message subscription for conversation: 6fc47841-1d19-4a17-94df-e4b118e1b806
Setting up message subscription for conversation: 6fc47841-1d19-4a17-94df-e4b118e1b806
Setting initial messages: (22) [{...}]
Subscription status: SUBSCRIBED
Successfully subscribed to conversation: 6fc47841-1d19-4a17-94df-e4b118e1b806
```

**Impact:**
- Memory leaks from multiple active subscriptions
- Duplicate message processing
- Unnecessary server connections
- Potential performance degradation
- Increased network traffic

### 2. Duplicate TTS Generation
The system is repeatedly generating new audio for the same messages, even when audio URLs already exist.

**Symptoms:**
- Multiple "Cache miss, generating TTS..." logs for the same message
- Repeated PATCH requests to update message audio URLs
- 400 Bad Request errors on some PATCH requests

**Root Causes:**
1. Multiple triggers for TTS generation:
   - Initial message load
   - Message subscription updates
   - Query refetch intervals
2. Missing reference_audio_url column in database schema
3. Race conditions in audio URL updates

### 3. Audio URL Storage Issues
Messages are failing to update with new audio URLs.

**Error Pattern:**
```
PATCH https://[project].supabase.co/rest/v1/guided_conversation_messages 
400 (Bad Request)
```

**Database Checks:**
1. Verify RLS policies:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'guided_conversation_messages';
```

2. Check message permissions:
```sql
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'guided_conversation_messages';
```

## Solutions

1. **Prevent Duplicate Generation:**
   - Implement proper audio URL checking
   - Add processing state tracking
   - Use optimistic updates

2. **Fix Database Updates:**
   - Verify column existence
   - Check RLS policies
   - Implement proper error handling

3. **Improve Subscription Management:**
   - Track active subscriptions
   - Implement proper cleanup
   - Add subscription status checks

## Testing Checklist

- [ ] Audio URLs are generated only once per message
- [ ] Cache hits prevent regeneration
- [ ] Database updates succeed
- [ ] User messages have reference_audio_url
- [ ] AI messages have audio_url
- [ ] No 400 errors on PATCH requests
- [ ] Single subscription per conversation
- [ ] Clean subscription cleanup on unmount

## Next Steps

1. Add proper column for reference_audio_url if missing
2. Implement proper cache checking
3. Add error handling for database updates
4. Fix RLS policies if needed
5. Implement subscription tracking
6. Add proper cleanup handlers
