# Chat Functionality Debugging Guide

## Current Issues

### 1. Duplicate TTS Generation
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

### 2. Duplicate Message Subscriptions
Multiple message subscriptions are being created for the same conversation.

**Symptoms:**
- Multiple "Setting up message subscription" logs for the same conversation ID
- Duplicate subscription setup calls
- Messages being processed multiple times

**Root Causes:**
1. useEffect dependency array not properly configured
2. Multiple component re-renders triggering subscription setup
3. Subscription cleanup not properly handled

**Debugging Steps:**
1. Add subscription tracking logs:
```typescript
console.log('Subscription setup attempt:', {
  conversationId,
  existingSubscriptions: supabase.getSubscriptions().length
});
```

2. Monitor cleanup:
```typescript
return () => {
  console.log('Cleaning up subscription for:', conversationId);
  subscription.unsubscribe();
};
```

3. Check component lifecycle:
```typescript
useEffect(() => {
  console.log('ChatContainer mounted/updated');
  return () => console.log('ChatContainer cleanup');
}, []);
```

**Solutions:**
1. Implement subscription tracking
2. Add proper cleanup
3. Review dependency array
4. Add subscription status checks

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