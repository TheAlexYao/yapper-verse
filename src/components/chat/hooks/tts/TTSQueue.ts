import type { Message } from "@/hooks/useConversation";

export class TTSQueue {
  private queue: Message[] = [];
  private processing = false;
  private processingMessages = new Set<string>();

  constructor(private generateTTS: (msg: Message) => Promise<void>) {}

  add(message: Message) {
    if (this.processingMessages.has(message.id)) {
      console.log('Message already in processing queue:', message.id);
      return;
    }
    
    this.processingMessages.add(message.id);
    this.queue.push(message);
    this.processNext();
  }

  private async processNext() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const message = this.queue.shift()!;

    try {
      await this.generateTTS(message);
    } catch (error) {
      console.error('Error generating TTS:', error);
    } finally {
      this.processingMessages.delete(message.id);
      this.processing = false;
      this.processNext();
    }
  }

  clear() {
    this.queue = [];
    this.processingMessages.clear();
    this.processing = false;
  }
}