export enum AppMode {
  HOME = 'HOME',
  SIGN_TO_TEXT = 'SIGN_TO_TEXT',
  TEXT_TO_SIGN = 'TEXT_TO_SIGN',
  TEXT_TO_IMAGE = 'TEXT_TO_IMAGE',
  TEXT_TO_VIDEO = 'TEXT_TO_VIDEO',
  LIVE_PRACTICE = 'LIVE_PRACTICE',
  CHATBOT = 'CHATBOT'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface SignInstructionStep {
  step: number;
  instruction: string;
  detail: string;
}

export interface GeneratedVideo {
  uri: string;
  expirationTime?: string;
}

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    webkitAudioContext: typeof AudioContext;
    aistudio?: AIStudio;
  }
}