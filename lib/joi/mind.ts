import { freshEmotion } from "./emotion";
import type { Mind } from "./types";

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
