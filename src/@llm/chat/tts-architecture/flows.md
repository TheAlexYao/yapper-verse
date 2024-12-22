# Text-to-Speech Generation Flows

## 1. AI Message TTS
- **Trigger**: New AI message received
- **Flow**:
  1. Message arrives via React Query subscription
  2. `generateTTSForMessage` triggered
  3. Checks TTS requirements (not user message, no existing audio)
  4. Calls TTS edge function (normal speed)
  5. Updates message in database with audio URL
  6. Updates UI with audio player

## 2. User Message Reference Audio
- **Trigger**: User message needs reference audio
- **Flow**:
  1. Message checked for reference audio
  2. Gets voice preference from profile
  3. Generates normal speed audio
  4. Stores URL as reference_audio_url
  5. Updates UI with audio player