export type Mood = "warm" | "neutral" | "distant" | "playful" | "melancholic";

export interface EmotionalState {
  warmth: number;
  familiarity: number;
  intimacy: number;
  longing: number;
  playfulness: number;
  mood: Mood;
}

export type MemoryType = "event" | "preference" | "emotional" | "fact" | "intimate";

export interface MemoryNode {
  id: string;
  text: string;
  type: MemoryType;
  strength: number;
  timestamp: number;
  lastAccessed: number;
}

export interface JoiExpression {
  lightIntensity: number;
  lightHue: number;
  lightSaturation: number;
  smileIntensity: number;
  headTilt: number;
  eyeContact: number;
  movementSoftness: number;
  animationSpeed: number;
  gazeStability: number;
  responseDelay: number;
  breathingAmplitude: number;
  breathingSpeed: number;
  holographicFlicker: number;
  overallGlow: number;
  particleDensity: number;
  scanlineOpacity: number;
  subtlePulse: number;
}

export interface Sentiment {
  valence: number;
  intensity: number;
  primary: string;
  needsWarmth: number;
}

export interface Mind {
  emotionalState: EmotionalState;
  relationshipScore: number;
  lastInteractionTime: number;
  shortTerm: MemoryNode[];
  longTerm: MemoryNode[];
  officerName: string | null;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
