# TTS Caching System

## Cache Layers
1. Memory Cache (Map)
2. Database Cache (tts_cache table)
3. Storage Cache (audio files)

## Cache Operations
- Check: Before generating new TTS
- Store: After successful generation
- Invalidate: On error or manual refresh
- Cleanup: Periodic maintenance