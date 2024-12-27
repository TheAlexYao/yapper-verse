# Pronunciation Assessment System Specification

## Database Schema

### guided_conversation_messages Table
```sql
CREATE TABLE guided_conversation_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES guided_conversations(id),
  content TEXT NOT NULL,
  translation TEXT,
  transliteration TEXT,
  is_user BOOLEAN NOT NULL DEFAULT false,
  pronunciation_score INTEGER,
  pronunciation_data JSONB DEFAULT '{}'::jsonb,
  audio_url TEXT,
  reference_audio_url TEXT,
  sentence_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

## User Flow

1. **Initial State**
   - User sees recommended responses
   - Each response has text, translation, and reference audio

2. **Practice Flow**
   ```mermaid
   graph TD
     A[Select Response] --> B[Listen to Reference]
     B --> C[Record Attempt]
     C --> D[Submit Recording]
     D --> E[View Assessment]
     E --> F[Try Again/Continue]
   ```

3. **Interaction Steps**
   a. **Response Selection**
      - Click response to practice
      - Modal opens with practice interface
   
   b. **Reference Audio**
      - Play reference at normal speed
      - Option for slower playback
      - Visual text display with translation
   
   c. **Recording**
      - Clear microphone access prompt
      - Visual feedback during recording
      - Ability to re-record
   
   d. **Assessment Review**
      - Overall pronunciation score
      - Word-by-word breakdown
      - Audio comparison capability
      - Detailed feedback display

4. **Error Handling Flow**
   ```mermaid
   graph TD
     A[Start Recording] --> B{Mic Access?}
     B -->|No| C[Request Permission]
     B -->|Yes| D[Record Audio]
     D --> E{Quality Check}
     E -->|Pass| F[Process Audio]
     E -->|Fail| G[Show Quality Error]
     F --> H{Assessment OK?}
     H -->|Yes| I[Show Results]
     H -->|No| J[Show Error]
   ```

## TypeScript Interfaces

interface Message {
  id: string;
  conversation_id: string;
  text: string;
  translation: string;
  pronunciation_score: number;
  pronunciation_data: any;
  audio_url: string;
  reference_audio_url: string;
  isUser: boolean;
}

interface AssessmentResult {
  pronunciationScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  words: WordAssessment[];
}

interface WordAssessment {
  word: string;
  pronunciationAssessment: {
    accuracyScore: number;
    errorType: string;
  };
}

## Assessment Flow

1. **User selects a response to practice**
2. **User listens to reference audio**
3. **User records their pronunciation**
4. **Recording is submitted for assessment**
5. **User views detailed feedback**

## Error Handling

1. **Recording Issues**:
   - Microphone access
   - Audio quality
   - Browser support

2. **Processing Errors**:
   - Service availability
   - Network issues
   - Format validation

3. **Recovery Steps**:
   - Reset state
   - Clear invalid data
   - Show user feedback

## Storage

- Audio files stored in Supabase storage
- Assessment results stored in guided_conversation_messages table

## UI Components

- PronunciationModal: Main interface
- AudioRecorder: Handles recording
- AudioControls: Playback interface
- TextDisplay: Shows text/translation

## Edge Function Configuration

Required secrets:
- OPENAI_API_KEY
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Assessment Response Format

```json
{
  "audioUrl": "string",
  "assessment": {
    "NBest": [
      {
        "PronunciationAssessment": {
          "AccuracyScore": 95,
          "FluencyScore": 90,
          "CompletenessScore": 85,
          "PronScore": 92
        },
        "Words": [
          {
            "Word": "example",
            "PronunciationAssessment": {
              "AccuracyScore": 95,
              "ErrorType": "none"
            }
          }
        ]
      }
    ]
  }
}
```

## User Experience Guidelines

1. **Feedback Timing**
   - Immediate visual feedback for actions
   - Progress indicators during processing
   - Clear success/error states

2. **Error Recovery**
   - Clear error messages
   - Retry options
   - Alternative suggestions

3. **Accessibility**
   - Keyboard navigation support
   - Screen reader compatibility
   - Visual and audio feedback

4. **Performance**
   - Audio processing feedback
   - Loading states
   - Cached audio playback

5. **Mobile Considerations**
   - Touch-friendly controls
   - Responsive layout
   - Device-specific audio handling
