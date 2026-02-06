
export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface GenerationResult {
  originalImage?: string;
  userImage?: string;
  extractedPrompt: string;
  generatedImageUrl?: string;
  status: 'idle' | 'analyzing' | 'generating' | 'completed' | 'error';
  error?: string;
  chatHistory: ChatMessage[];
}
