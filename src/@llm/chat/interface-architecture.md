# Chat Interface Architecture

## Component Structure

1. **ChatContainer**
   - Main orchestrator
   - State management
   - Audio handling
   - Message flow control

2. **ChatMessagesSection**
   - Message display
   - Auto-scrolling
   - Audio playback
   - Pronunciation feedback

3. **ChatBottomSection**
   - Response selection
   - Message sending
   - Metrics display

4. **ChatResponseHandler**
   - LLM integration
   - Response processing
   - Audio generation
   - Pronunciation assessment

## Data Flow

1. **Message Processing**
```typescript
interface Message {
  id: string;
  text: string;
  translation?: string;
  transliteration?: string;
  isUser: boolean;
  audio_url?: string;
  pronunciation_score?: number;
  pronunciation_data?: any;
}
```

2. **State Management**
   - React Query for server state
   - Local state for UI elements
   - WebSocket for real-time updates

3. **Event Handling**
   - Message selection
   - Audio playback
   - Pronunciation assessment
   - Score display