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

**Database Context:**
```sql
-- Messages Table Structure
guided_conversation_messages
  - audio_url (for AI messages)
  - reference_audio_url (for user messages)
```

**Relevant Tables:**
1. `guided_conversation_messages`: Stores message content and audio URLs
2. `tts_cache`: Caches generated audio files
3. `profiles`: Contains user voice preferences

### 2. Audio URL Storage Issues
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

## Debugging Steps

1. **Check Message Processing Flow:**
```typescript
// Add these logs in ChatContainer
console.log('Message state:', {
  id: message.id,
  hasAudioUrl: !!message.audio_url,
  hasReferenceAudio: !!message.reference_audio_url,
  isUser: message.isUser
});
```

2. **Monitor Cache Operations:**
```typescript
// Add to useTTS hook
console.log('Cache check:', {
  text: text,
  existingUrl: cacheEntry?.audio_url,
  cacheHit: !!cacheEntry
});
```

3. **Track Database Updates:**
```typescript
// Add to message update function
console.log('Update attempt:', {
  messageId: message.id,
  updateData: updateData,
  currentAudioUrl: message.audio_url
});
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

3. **Improve Caching:**
   - Add memory cache layer
   - Implement proper cache invalidation
   - Add cache status tracking

## Testing Checklist

- [ ] Audio URLs are generated only once per message
- [ ] Cache hits prevent regeneration
- [ ] Database updates succeed
- [ ] User messages have reference_audio_url
- [ ] AI messages have audio_url
- [ ] No 400 errors on PATCH requests

## Next Steps

1. Add proper column for reference_audio_url if missing
2. Implement proper cache checking
3. Add error handling for database updates
4. Fix RLS policies if needed