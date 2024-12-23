# User Context Management

## Components

1. **Language Profile**
```typescript
interface LanguageProfile {
  nativeLanguage: string;
  targetLanguage: string;
  proficiencyLevel: string;
  learningGoals: string[];
}
```

2. **Learning Progress**
```typescript
interface LearningProgress {
  completedScenarios: number;
  averageScores: {
    pronunciation: number;
    grammar: number;
    vocabulary: number;
  };
  recentTopics: string[];
}
```

## Context Integration

1. **Profile Analysis**
   - Language preferences
   - Learning objectives
   - Cultural interests

2. **Progress Tracking**
   - Historical performance
   - Improvement areas
   - Learning patterns

3. **Goal Alignment**
   - Match responses to goals
   - Adjust difficulty
   - Focus on weak areas