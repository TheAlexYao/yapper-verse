# Text-to-Speech Architecture Overview

This document provides a high-level overview of the TTS system. For detailed information, see the following documents:

1. [Core Architecture](./tts-architecture/core.md)
2. [Caching System](./tts-architecture/caching.md)
3. [Request Handlers](./tts-architecture/handlers.md)

## Quick Reference

### Key Components
- TTS Generation Service
- Caching System
- Audio URL Management
- Error Handling

### Data Flow
1. Message received/loaded
2. Check existing audio URLs
3. Generate TTS if needed
4. Update message with new URL
5. Cache results

For implementation details, refer to the specific documentation files.