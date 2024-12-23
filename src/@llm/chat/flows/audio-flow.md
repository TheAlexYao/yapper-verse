# Audio Generation & Processing Flow

## TTS Generation

### Cache Strategy
1. **Memory Cache**:
   - First level cache
   - Cleared on page refresh
   - Fast access for repeated phrases

2. **Database Cache**:
   - Second level cache
   - Persistent storage
   - Shared across users

### Voice Settings
1. **User Preferences**:
   - Gender preference
   - Speed options (normal/slow)
   - Language specific voices

2. **Audio Format**:
   - WAV format
   - 16kHz sample rate
   - Single channel

## Recording Flow

### Audio Capture
1. **Setup**:
   ```typescript
   const stream = await navigator.mediaDevices.getUserMedia({ 
     audio: { 
       channelCount: 1,
       sampleRate: 16000,
       echoCancellation: true,
       noiseSuppression: true,
     } 
   });
   ```

2. **Processing**:
   - Convert to WAV
   - Ensure correct format
   - Handle browser differences

### Assessment
1. **Submission**:
   - Send to Azure Speech Services
   - Include reference text
   - Process results

2. **Results Format**:
   ```typescript
   interface AssessmentResult {
     pronunciationScore: number;
     accuracyScore: number;
     fluencyScore: number;
     completenessScore: number;
     words: WordAssessment[];
   }
   ```

## Error Handling

1. **Audio Generation**:
   - Invalid language settings
   - Network failures
   - Invalid audio format

2. **Recording**:
   - Microphone access denied
   - Low quality audio
   - Browser compatibility

3. **Assessment**:
   - Service unavailable
   - Invalid audio format
   - Timeout handling