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

## TypeScript Interfaces

### Assessment Data Structure
```typescript
interface PronunciationAssessment {
  AccuracyScore: number;
  FluencyScore: number;
  CompletenessScore: number;
  PronScore: number;
}

interface WordAssessment {
  Word: string;
  PronunciationAssessment: {
    AccuracyScore: number;
    ErrorType: "None" | "Mispronunciation" | "Omission" | "Insertion" | "NoAudioDetected";
  };
  Syllables?: Array<{
    Syllable: string;
    PronunciationAssessment?: {
      AccuracyScore: number;
    };
  }>;
  Phonemes?: Array<{
    Phoneme: string;
    PronunciationAssessment?: {
      AccuracyScore: number;
    };
  }>;
}

interface AssessmentResult {
  NBest: Array<{
    PronunciationAssessment: PronunciationAssessment;
    Words: WordAssessment[];
    AudioUrl?: string;
    OriginalAudioUrl?: string;
  }>;
  pronunciationScore: number;
}
```

## Assessment Flow

1. **Audio Recording**
   - Format: WAV
   - Sample Rate: 16kHz
   - Channels: Mono
   - Bit Depth: 16-bit

2. **Assessment Process**
   ```typescript
   interface AssessmentRequest {
     audio: Blob;           // WAV audio file
     text: string;          // Reference text
     languageCode: string;  // e.g., "en-US"
   }

   interface AssessmentResponse {
     success: boolean;
     audioUrl: string;      // Stored audio URL
     assessment: AssessmentResult;
   }
   ```

3. **Scoring Metrics**
   - Accuracy Score (0-100): Pronunciation accuracy
   - Fluency Score (0-100): Speech fluency
   - Completeness Score (0-100): Text coverage
   - Overall Score (0-100): Combined assessment

## Error Handling

1. **Audio Quality Issues**
   ```typescript
   interface AudioQualityError {
     type: "QUALITY_ERROR";
     message: string;
     details?: {
       signalToNoise?: number;
       clarity?: number;
     };
   }
   ```

2. **Recognition Errors**
   ```typescript
   interface RecognitionError {
     type: "RECOGNITION_ERROR";
     message: string;
     errorCode: string;
   }
   ```

## Storage

1. **Audio Files**
   - Location: Supabase Storage 'audio' bucket
   - Format: WAV files
   - Naming: `{conversation_id}/{message_id}.wav`

2. **Assessment Data**
   - Stored in `pronunciation_data` JSONB column
   - Includes full assessment result
   - Cached for future reference

## UI Components

1. **Recording Interface**
   ```typescript
   interface AudioRecorderProps {
     onRecordingComplete: (blob: Blob) => void;
     isProcessing: boolean;
   }
   ```

2. **Results Display**
   ```typescript
   interface PronunciationModalProps {
     isOpen: boolean;
     onClose: () => void;
     response: {
       text: string;
       translation: string;
       audio_url?: string;
     };
     onSubmit: (score: number, audioBlob?: Blob) => void;
     isProcessing: boolean;
   }
   ```

## Edge Function Configuration

```typescript
interface EdgeFunctionConfig {
  speechKey: string;      // Azure Speech Services API key
  speechRegion: string;   // Azure region
  languageCode: string;   // Target language
  referenceText: string;  // Text to assess against
  audioData: ArrayBuffer; // Raw audio data
  sampleRate: number;     // Audio sample rate
  channels: number;       // Number of channels
  bitsPerSample: number; // Bit depth
}
```

## Assessment Response Format

```typescript
interface DetailedAssessmentResponse {
  audioUrl: string;
  assessment: {
    pronunciationScore: number;
    NBest: Array<{
      PronunciationAssessment: {
        AccuracyScore: number;
        FluencyScore: number;
        CompletenessScore: number;
        PronScore: number;
      };
      Words: Array<{
        Word: string;
        PronunciationAssessment: {
          AccuracyScore: number;
          ErrorType: string;
        };
      }>;
      AudioUrl: string;
    }>;
  };
}
```