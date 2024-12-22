# Pronunciation Check Flow Documentation

## Overview
The pronunciation check system allows users to:
1. Select a response to practice
2. Listen to reference audio (normal/slow speed)
3. Record their pronunciation
4. Submit for assessment
5. View detailed feedback

## Flow Steps

### 1. Response Selection & Audio Preparation
- User selects a response from `RecommendedResponses`
- System generates reference audio using Azure TTS
- Audio URLs are stored with the message

### 2. Recording Interface
- Modal opens with text display and audio controls
- User can play reference audio at normal/slow speeds
- User records their pronunciation attempt
- Audio is captured in WAV format (16kHz, mono)

### 3. Assessment Process
- Audio recording is sent to Azure Speech Services
- Detailed pronunciation metrics are calculated
- Results include word-by-word analysis

### 4. Data Storage
- Assessment results stored in guided_conversation_messages table
- Audio files stored in Supabase storage
- Metrics tracked for user progress

## Key Components

### Frontend Components
- PronunciationModal: Main interface
- AudioRecorder: Handles recording
- AudioControls: Playback interface
- TextDisplay: Shows text/translation

### Backend Services
- assess-pronunciation: Azure Speech Services integration
- TTS generation: Azure TTS integration
- Supabase storage: Audio file management

## Data Flow
1. Frontend -> Edge Function -> Azure -> Storage
2. Results -> Database -> Frontend Display