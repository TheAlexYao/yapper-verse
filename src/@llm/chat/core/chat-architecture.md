# Chat Interface Architecture

## Key Components

1. **ChatContainer.tsx**
   - Main container managing chat interface
   - Handles TTS generation for AI messages
   - Manages pronunciation scoring modal
   - Props:
     - messages: Message[]
     - onMessageSend: (message: Message) => void
     - onPlayTTS: (text: string) => void
     - conversationId: string

2. **ChatMessagesSection.tsx**
   - Handles message display and auto-scrolling
   - Props:
     - messages: Message[]
     - onPlayAudio: (audioUrl: string) => void
     - onShowScore: (message: Message) => void

3. **ChatBottomSection.tsx**
   - Manages chat metrics and response handling
   - Props:
     - messages: Message[]
     - conversationId: string
     - onMessageSend: (message: Message) => void

4. **ChatResponseHandler.tsx**
   - Handles response generation and processing
   - Props:
     - onMessageSend: (message: Message) => void
     - conversationId: string