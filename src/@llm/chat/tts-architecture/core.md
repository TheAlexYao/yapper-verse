# Text-to-Speech Core Architecture

## Overview
The TTS system handles audio generation for both AI and user messages:
- AI messages: Generated audio stored in `audio_url`
- User messages: Reference audio stored in `reference_audio_url`

## Key Components
1. TTS Generation Service
2. Caching System
3. Audio URL Management
4. Error Handling

## Data Flow
1. Message received/loaded
2. Check existing audio URLs
3. Generate TTS if needed
4. Update message with new URL
5. Cache results