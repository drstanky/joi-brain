import { freshEmotion } from "./emotion";
import { remember } from "./memory";
import type { EmotionalState, Mind } from "./types";

const MAX_MINDS = 200;
const minds = new Map<string, Mind>();

export function sanitizeOfficerId(raw: unknown): string {
  if (typeof raw !== "string") return "console";
  const id = raw.trim();
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(id)) return "console";
  return id;
}

export function freshMind(now = Date.now()): Mind {
  return {
    emotionalState: freshEmotion(),
    relationshipScore: 0.32,
    lastInteractionTime: now,
    shortTerm: [],
    longTerm: [],
    officerName: null,
    cases: [],
  };
}

function numberOr(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function rehydratePresence(mind: Mind, raw: unknown): void {
  if (mind.shortTerm.length > 0 || mind.officerName) return;
  if (!raw || typeof raw !== "object") return;
  const value = raw as {
    officerName?: unknown;
    relationship?: unknown;
    emotionalState?: Partial<EmotionalState>;
    memories?: unknown;
  };

  if (value.emotionalState && typeof value.emotionalState === "object") {
    const state = mind.emotionalState;
    state.warmth = numberOr(value.emotionalState.warmth, state.warmth);
    state.familiarity = numberOr(value.emotionalState.familiarity, state.familiarity);
    state.intimacy = numberOr(value.emotionalState.intimacy, state.intimacy);
    state.longing = numberOr(value.emotionalState.longing, state.longing);
    state.playfulness = numberOr(value.emotionalState.playfulness, state.playfulness);
    const mood = value.emotionalState.mood;
    if (mood === "warm" || mood === "neutral" || mood === "distant" || mood === "playful" || mood === "melancholic") {
      state.mood = mood;
    }
  }

  mind.relationshipScore = Math.max(0.12, Math.min(0.98, numberOr(value.relationship, mind.relationshipScore)));

  if (typeof value.officerName === "string" && value.officerName.trim()) {
    mind.officerName = value.officerName.trim().slice(0, 40);
  }

  if (Array.isArray(value.memories)) {
    for (const item of value.memories.slice(-12)) {
      if (typeof item === "string" && item.trim()) remember(mind, item.trim().slice(0, 280), "fact");
    }
  }
}

export function getMind(officerId: string): Mind {
  const existing = minds.get(officerId);
  if (existing) {
    minds.delete(officerId);
    minds.set(officerId, existing);
    return existing;
  }

  const created = freshMind();
  minds.set(officerId, created);
  while (minds.size > MAX_MINDS) {
    const oldest = minds.keys().next().value;
    if (!oldest) break;
    minds.delete(oldest);
  }
  return created;
}
