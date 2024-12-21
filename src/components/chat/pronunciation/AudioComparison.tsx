interface AudioComparisonProps {
  userAudioUrl?: string;
  referenceAudioUrl?: string;
}

export function AudioComparison({ userAudioUrl, referenceAudioUrl }: AudioComparisonProps) {
  if (!userAudioUrl && !referenceAudioUrl) return null;
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Audio Comparison</h3>
      <div className="space-y-2">
        {referenceAudioUrl && (
          <div className="p-4 rounded-lg bg-accent/50">
            <div className="space-y-2">
              <p className="text-sm font-medium">Native Speaker</p>
              <audio src={referenceAudioUrl} controls className="w-full" />
            </div>
          </div>
        )}
        {userAudioUrl && (
          <div className="p-4 rounded-lg bg-accent/50">
            <div className="space-y-2">
              <p className="text-sm font-medium">Your Recording</p>
              <audio src={userAudioUrl} controls className="w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}