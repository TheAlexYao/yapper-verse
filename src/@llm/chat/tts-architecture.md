# Text-to-Speech and Audio Architecture

## TTS Generation Flows

### 1. AI Message TTS
- **Trigger**: New AI message received in ChatContainer
- **Flow**:
  1. Message arrives via React Query subscription
  2. `generateTTSForMessage` triggered
  3. Checks TTS requirements (not user message, no existing audio)
  4. Calls TTS edge function (normal speed)
  5. Updates message in database with audio URL
  6. Updates UI with audio player

### 2. Recommended Response Selection
- **Trigger**: User clicks recommended response
- **Flow**:
  1. User selects response
  2. Gets voice preference from profile
  3. Generates normal speed audio
  4. Stores URL in selectedResponse
  5. Opens pronunciation modal

### 3. Pronunciation Practice
- **Normal Speed**:
  1. Uses pre-generated audio URL
  2. Plays directly on click
- **Slow Speed**:
  1. Checks cache first
  2. If not cached:
     - Gets voice preference
     - Generates slow speed audio
     - Caches URL
     - Plays audio

## Frontend Audio Component Hierarchy

### AI Message Audio
```
ChatContainer
└── MessageBubble
    └── AudioButton
        └── handlePlayAudio()
```

### User Pronunciation Flow
```
ChatResponseHandler
└── PronunciationModal
    ├── TextDisplay
    ├── AudioControls
    │   └── handlePlayAudio()
    └── AudioRecorder
        └── handleRecord()

PronunciationScoreModal
├── AudioComparison
└── Scores/Feedback
```

## Data Storage

### Database Tables
1. `guided_conversation_messages`
   - `audio_url`: AI message audio
   - `reference_audio_url`: Reference for pronunciation

2. `tts_cache`
   - `text_hash`: Unique identifier
   - `text_content`: Original text
   - `language_code`: Target language
   - `voice_gender`: Voice preference
   - `audio_url`: Normal speed
   - `audio_url_slow`: Slow speed (on demand)

### Storage Buckets
1. `audio`: User recordings
2. `tts_cache`: Generated TTS audio

## Props Flow

### AI Messages
```typescript
ChatContainer
  → messages={messages}
  → MessageBubble
    → message={message}
    → onPlayAudio={handlePlayTTS}
    → AudioButton
      → onPlay={handlePlayAudio}
```

### User Pronunciation
```typescript
ChatResponseHandler
  → response={selectedResponse}
  → PronunciationModal
    → audioUrl={response.audio_url}
    → onSubmit={handlePronunciationSubmit}
    → AudioRecorder
      → onRecordingComplete={setAudioBlob}
```

### Pronunciation Scoring
```typescript
PronunciationScoreModal
  → userAudioUrl={message.audio_url}
  → referenceAudioUrl={message.reference_audio_url}
  → AudioComparison
    → userAudioUrl={userAudioUrl}
    → referenceAudioUrl={referenceAudioUrl}
```

## Error Handling

### TTS Generation
1. Log error details
2. Show toast notification
3. Remove processing state
4. Allow retry

### Audio Playback
1. Catch playback errors
2. Show toast notification
3. Reset playing state
4. Allow retry

## Key Implementation Notes

1. **Caching Strategy**:
   - Cache both normal and slow speeds
   - Check cache before API calls
   - Generate slow speed on demand only

2. **Audio Management**:
   - No TTS for user messages
   - Efficient caching
   - Clear separation of AI/user audio
   - Persistent storage

3. **Component Design**:
   - Clear hierarchy
   - Proper prop drilling
   - State isolation
   - Error boundaries