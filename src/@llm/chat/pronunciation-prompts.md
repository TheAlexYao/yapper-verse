# Pronunciation Assessment Implementation Guide

## System Architecture Prompts

1. **Database Schema Setup**
```
Create a database schema for storing pronunciation assessment data that includes:
- Message content and translations
- Audio URLs for both user recordings and reference audio
- Pronunciation scores and detailed assessment data
- Timestamps and user associations
```

2. **Edge Function Configuration**
```
Set up an edge function for pronunciation assessment that:
- Accepts WAV audio files
- Integrates with Azure Speech Services
- Returns detailed pronunciation metrics
- Handles audio storage and URL generation
```

3. **Frontend Components**
```
Create React components for:
- A modal interface for pronunciation practice
- Audio recording with proper format settings
- Reference audio playback controls
- Visual feedback display for assessment results
```

## Implementation Steps

1. **Audio Recording Setup**
```
Implement audio recording functionality that:
- Uses the Web Audio API
- Captures high-quality mono audio at 16kHz
- Converts to WAV format
- Provides visual feedback during recording
```

2. **Azure Speech Services Integration**
```
Set up Azure Speech Services integration that:
- Configures pronunciation assessment
- Handles audio stream processing
- Returns detailed scoring metrics
- Processes results for display
```

3. **User Interface Development**
```
Create an intuitive interface that:
- Shows text and translation
- Provides audio playback controls
- Displays recording status
- Shows assessment results clearly
```

## Key Features

1. **Audio Processing**
```
Implement audio processing that:
- Validates audio quality
- Ensures correct format (WAV, 16kHz, mono)
- Handles browser compatibility
- Manages file size limits
```

2. **Assessment Display**
```
Create assessment visualization that:
- Shows overall pronunciation score
- Displays word-by-word breakdown
- Indicates areas for improvement
- Allows audio comparison
```

3. **Error Handling**
```
Implement robust error handling for:
- Microphone access issues
- Audio quality problems
- Service availability
- Network connectivity
```

## Testing Scenarios

1. **Audio Quality**
```
Test scenarios for:
- Different microphone types
- Background noise levels
- Various audio lengths
- Multiple browser environments
```

2. **User Experience**
```
Verify handling of:
- Permission requests
- Loading states
- Error messages
- Success feedback
```

## Performance Optimization

1. **Audio Processing**
```
Optimize for:
- Quick audio conversion
- Efficient file uploads
- Minimal processing delay
- Smooth playback
```

2. **Response Time**
```
Ensure fast:
- Audio recording start
- Assessment processing
- Results display
- Error recovery
```

## Security Considerations

1. **Audio Storage**
```
Implement secure:
- File upload handling
- Storage access control
- URL generation
- File cleanup
```

2. **API Security**
```
Ensure proper:
- Authentication
- Rate limiting
- Error logging
- Data validation
```

## Mobile Considerations

1. **Device Compatibility**
```
Ensure support for:
- Different audio inputs
- Various screen sizes
- Touch interactions
- Battery efficiency
```

2. **Performance**
```
Optimize for:
- Limited bandwidth
- Processing power
- Memory usage
- Battery life
```

## Documentation

1. **API Documentation**
```
Document:
- Endpoint specifications
- Request/response formats
- Error codes
- Rate limits
```

2. **User Guide**
```
Create guides for:
- Feature usage
- Best practices
- Troubleshooting
- Common issues
```

## Maintenance

1. **Monitoring**
```
Set up monitoring for:
- Service availability
- Error rates
- Performance metrics
- Usage patterns
```

2. **Updates**
```
Plan for:
- API version management
- Feature updates
- Security patches
- Performance improvements
```