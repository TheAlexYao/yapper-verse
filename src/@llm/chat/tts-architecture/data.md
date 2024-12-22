# Data Storage & Error Handling

## Database Tables
1. `guided_conversation_messages`
   - `audio_url`: AI message audio
   - `reference_audio_url`: Reference for pronunciation

2. `tts_cache`
   - `text_hash`: Unique identifier
   - `text_content`: Original text
   - `audio_url`: Generated audio URL

## Error Handling
1. **TTS Generation**
   - Log error details
   - Show toast notification
   - Remove processing state
   - Allow retry

2. **Audio Playback**
   - Catch playback errors
   - Show toast notification
   - Reset playing state
   - Allow retry