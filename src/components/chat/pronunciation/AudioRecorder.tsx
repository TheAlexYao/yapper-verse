import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob | null) => void;
  isProcessing: boolean;
}

export function AudioRecorder({ onRecordingComplete, isProcessing }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      // Step 1: Configure audio stream with specific requirements for Azure
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          channelCount: 1, // Mono audio required
          sampleRate: 16000, // 16kHz required by Azure
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      
      // Step 2: Initialize MediaRecorder with PCM format
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=pcm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Step 3: Handle incoming audio data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Step 4: Process recorded audio when stopped
      mediaRecorder.onstop = async () => {
        // Convert WebM to WAV format required by Azure
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioContext = new AudioContext({ sampleRate: 16000 });
        
        try {
          // Convert to proper format for assessment
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Create WAV file with correct specifications
          const wavBuffer = audioBufferToWav(audioBuffer);
          const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
          
          setAudioUrl(URL.createObjectURL(wavBlob));
          setHasRecording(true);
          setIsRecording(false);
          onRecordingComplete(wavBlob);
        } catch (error) {
          console.error('Error converting audio:', error);
          toast({
            title: "Error",
            description: "Failed to process audio recording. Please try again.",
            variant: "destructive",
          });
        } finally {
          audioContext.close();
        }

        // Cleanup: Stop all tracks
        stream.getTracks().forEach(track => track.stop());
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      // The onstop handler will handle the rest
    }
  };

  const handleRecord = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
  };

  // Helper function to convert AudioBuffer to WAV format
  function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const numChannels = 1;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const dataLength = buffer.length * numChannels * (bitDepth / 8);
    const bufferLength = 44 + dataLength;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Write audio data
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < channelData.length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return arrayBuffer;
  }

  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

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
      </div>

      {audioUrl && (
        <div className="p-4 rounded-lg bg-accent/50">
          <audio src={audioUrl} controls className="w-full" />
        </div>
      )}
    </div>
  );
}