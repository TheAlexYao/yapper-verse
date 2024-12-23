# Chat Functionality Debugging Guide

## Current State (Last Updated)

### Message Flow ✅
1. Initial load works correctly:
   ```typescript
   Found existing conversation: [conversation_id]
   Loading initial messages for conversation: [conversation_id]
   Setting up message subscription for conversation: [conversation_id]
   ```

2. Subscription management works:
   ```typescript
   Subscription already exists for: [conversation_id]
   Setting initial messages: [count]
   Subscription status: SUBSCRIBED
   ```

### Audio Generation Flow ✅
1. TTS Generation works:
   ```typescript
   Generating TTS for: {text: "...", voicePreference: 'male', speed: 'normal'}
   Cache miss, generating TTS...
   Successfully generated audio URL: https://...
   ```

2. Message Updates work:
   ```typescript
   Updating message with audio URL: {messageId: '...'}
   Successfully updated message with audio URL
   ```

### Real-time Updates ✅
1. Database Configuration:
   - REPLICA IDENTITY FULL enabled on guided_conversation_messages
   - Real-time subscriptions properly configured
   - Message updates trigger UI refresh

2. Component Chain works:
   ```
   ChatContainer
   └─ ChatMessagesSection
      └─ ChatMessages
         └─ MessageBubble
            └─ AudioButton
   ```

## Testing Checklist
- [x] Initial message load works
- [x] Subscription setup works
- [x] TTS generation works
- [x] Database updates work
- [x] UI updates with audio button
- [x] Audio playback works

## Component Dependencies
- useConversationMessages (manages subscription)
- MessageBubble (handles audio button display)
- AudioButton (actual play button)

## Key Fixes Applied
1. Added REPLICA IDENTITY FULL to guided_conversation_messages table
2. Implemented proper UPDATE subscription handling
3. Fixed state management for real-time updates
4. Added proper error handling and logging

## Current Architecture
1. Message Flow:
   - User sends message
   - Message stored in database
   - TTS generated and cached
   - Audio URL updated in message
   - Real-time update triggers UI refresh

2. Audio Management:
   - TTS generation handled by edge function
   - Audio files stored in Supabase storage
   - URLs cached for reuse
   - Playback managed by AudioButton component

3. State Management:
   - React Query for server state
   - Real-time subscriptions for updates
   - Local state for UI interactions