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

export interface JoiBody {
  mood: Mood;
  face: "soft" | "smile" | "still" | "hurt" | "bright";
  posture: "near" | "upright" | "turned" | "restless";
  gazeX: number;
  gazeY: number;
  gazeHold: number;
  breathRate: number;
  breathDepth: number;
  presence: number;
  flicker: number;
  energy: number;
  delayMs: number;
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

export interface CaseWitness {
  name: string;
  role: string;
  statement: string;
}

export interface CaseEvidence {
  tag: string;
  detail: string;
}

export interface CaseEvent {
  when: string;
  event: string;
}

export interface CaseAssociate {
  name: string;
  relation: string;
  note: string;
}

export interface CaseSite {
  name: string;
  note: string;
}

export interface CaseFile {
  id: string;
  serial: string;
  status: "open" | "closed";
  opened: string;
  priority: string;
  classification: string;
  assignedTo: string;
  subjectName: string;
  aka: string;
  nexus: string;
  inception: string;
  sex: string;
  apparentAge: string;
  eyes: string;
  height: string;
  marks: string;
  designedFor: string;
  barcodeSite: string;
  languages: string;
  offworldPosting: string;
  dnaFlag: string;
  district: string;
  place: string;
  seenWhen: string;
  offense: string;
  narrative: string;
  witnesses: CaseWitness[];
  evidence: CaseEvidence[];
  timeline: CaseEvent[];
  associates: CaseAssociate[];
  sites: CaseSite[];
  risk: string;
  firstMove: string;
  joiNote: string;
  briefing: string;
}

export interface Mind {
  emotionalState: EmotionalState;
  relationshipScore: number;
  lastInteractionTime: number;
  shortTerm: MemoryNode[];
  longTerm: MemoryNode[];
  officerName: string | null;
  cases: CaseFile[];
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
