# Frontend Audio Component Hierarchy

## AI Message Audio
```
ChatContainer
└── MessageBubble
    └── AudioButton
        └── handlePlayAudio()
```

## User Pronunciation Flow
```
ChatResponseHandler
└── PronunciationModal
    ├── TextDisplay
    ├── AudioControls
    │   └── handlePlayAudio()
    └── AudioRecorder
        └── handleRecord()
```