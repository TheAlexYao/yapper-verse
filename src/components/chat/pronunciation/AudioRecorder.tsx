import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
  isProcessing: boolean;
}

export function AudioRecorder({ onRecordingComplete, isProcessing }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const createWavHeader = (sampleRate: number, bitsPerSample: number, channels: number, dataLength: number) => {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);

    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // audio format (1 for PCM)
    view.setUint16(22, channels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * channels * (bitsPerSample / 8), true); // byte rate
    view.setUint16(32, channels * (bitsPerSample / 8), true); // block align
    view.setUint16(34, bitsPerSample, true);

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);

    return buffer;
  };

  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to WAV format
        const audioContext = new AudioContext({ sampleRate: 16000 });
        const audioBuffer = await audioContext.decodeAudioData(await audioBlob.arrayBuffer());
        
        // Get the audio data
        const channelData = audioBuffer.getChannelData(0);
        const samples = new Int16Array(channelData.length);
        
        // Convert Float32 to Int16
        for (let i = 0; i < channelData.length; i++) {
          const s = Math.max(-1, Math.min(1, channelData[i]));
          samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Create WAV header
        const wavHeader = createWavHeader(16000, 16, 1, samples.byteLength);
        
        // Combine header and audio data
        const wavBytes = new Uint8Array(wavHeader.byteLength + samples.byteLength);
        wavBytes.set(new Uint8Array(wavHeader), 0);
        wavBytes.set(new Uint8Array(samples.buffer), wavHeader.byteLength);
        
        // Create final WAV blob
        const wavBlob = new Blob([wavBytes], { type: 'audio/wav' });
        
        setAudioUrl(URL.createObjectURL(wavBlob));
        setHasRecording(true);
        setIsRecording(false);
        onRecordingComplete(wavBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Error",
        description: "Could not access microphone. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleRecord = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setHasRecording(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-4">
        <Button
          variant={isRecording ? "destructive" : "default"}
          onClick={handleRecord}
          disabled={isProcessing}
          className={`min-w-[140px] ${!isRecording ? "bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90" : ""}`}
        >
          <Mic className="mr-2 h-4 w-4" />
          {isRecording ? "Stop" : "Record"}
        </Button>
        {hasRecording && (
          <Button 
            variant="outline" 
            onClick={resetRecording}
            disabled={isProcessing}
            className="min-w-[140px]"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {audioUrl && (
        <div className="p-4 rounded-lg bg-accent/50">
          <audio src={audioUrl} controls className="w-full" />
        </div>
      )}
    </div>
  );
}