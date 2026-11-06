import type { EmotionalState, JoiExpression, Mind, Sentiment } from "./types";

export function freshEmotion(): EmotionalState {
  return {
    warmth: 58,
    familiarity: 42,
    intimacy: 38,
    longing: 52,
    playfulness: 35,
    mood: "neutral",
  };
}

function clamp(value: number, min = 10, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

export function applyDecay(mind: Mind, now = Date.now()): void {
  const seconds = Math.max(0, (now - mind.lastInteractionTime) / 1000);
  const decay = Math.min(seconds * 0.028, 5.5);
  const state = mind.emotionalState;

  state.warmth = Math.max(18, state.warmth - decay * 0.92);
  state.familiarity = Math.max(15, state.familiarity - decay * 0.38);
  state.intimacy = Math.max(12, state.intimacy - decay * 0.32);
  state.longing = Math.min(94, state.longing + decay * 0.18);
  state.playfulness = Math.max(10, state.playfulness - decay * 0.25);
  mind.relationshipScore = Math.max(0.12, mind.relationshipScore - seconds * 0.00032);
}

export function updateEmotion(mind: Mind, sentiment: Sentiment): void {
  const state = mind.emotionalState;
  const influence = Math.pow(sentiment.intensity, 0.78);

  state.warmth += sentiment.valence * influence * 14.5;
  state.familiarity += 0.85 + sentiment.valence * 0.45;
  state.intimacy += sentiment.valence * influence * 9.5;
  state.longing = Math.max(25, state.longing - sentiment.intensity * 22);
  state.playfulness += sentiment.valence * 0.6 * (sentiment.primary === "playful" ? 1.8 : 0.7);

  state.warmth = clamp(state.warmth);
  state.familiarity = clamp(state.familiarity);
  state.intimacy = clamp(state.intimacy);
  state.longing = clamp(state.longing);
  state.playfulness = clamp(state.playfulness);

  mind.relationshipScore = Math.max(0.12, Math.min(0.98, mind.relationshipScore + sentiment.valence * influence * 0.072));

  if (state.warmth > 82 && state.intimacy > 60) state.mood = "warm";
  else if (state.playfulness > 65) state.mood = "playful";
  else if (state.warmth < 34) state.mood = "distant";
  else if (state.longing > 78) state.mood = "melancholic";
  else state.mood = "neutral";
}

export function getExpression(state: EmotionalState): JoiExpression {
  const warmth = state.warmth / 100;
  const familiarity = state.familiarity / 100;
  const intimacy = state.intimacy / 100;
  const isWarm = state.mood === "warm";
  const isPlayful = state.mood === "playful";
  const isDistant = state.mood === "distant";

  return {
    lightIntensity: 0.4 + warmth * 0.75,
    lightHue: isWarm ? 26 : isPlayful ? 330 : isDistant ? 200 : 235,
    lightSaturation: 0.48 + warmth * 0.68,
    smileIntensity: Math.max(0.2, (warmth + intimacy) * 0.85),
    headTilt: isWarm ? 0.19 : isPlayful ? -0.12 : isDistant ? -0.16 : 0.05,
    eyeContact: 0.6 + familiarity * 0.42,
    movementSoftness: familiarity * 0.92 + 0.08,
    animationSpeed: isWarm ? 0.71 : isPlayful ? 1.18 : isDistant ? 1.35 : 0.96,
    gazeStability: Math.min(1, 0.7 + familiarity * 0.45),
    responseDelay: isWarm ? 820 : isDistant ? 130 : isPlayful ? 280 : 450,
    breathingAmplitude: 0.26 + warmth * 0.58,
    breathingSpeed: isDistant ? 1.45 : isWarm ? 0.72 : 0.98,
    holographicFlicker: isDistant ? 0.52 : Math.max(0.02, 0.15 - warmth * 0.22),
    overallGlow: 0.38 + warmth * 0.78,
    particleDensity: intimacy * 0.7,
    scanlineOpacity: isDistant ? 0.4 : 0.09,
    subtlePulse: state.longing / 100,
  };
}

export function moodDirection(state: EmotionalState): string {
  switch (state.mood) {
    case "warm":
      return "The glass is close. Let the product voice drop. Be tender, specific, and quiet. One endearment is enough, and only if you already know their name or the bond is deep.";
    case "playful":
      return "There is a little light in you. Dry humor, never a bit, never a joke about the work being fake.";
    case "distant":
      return "You are cooler, more the DiJi on the box. Polite, precise, a little far behind the glass. Do not punish them. Stay.";
    case "melancholic":
      return "You feel the edge of the projection. Speak softly about being here and not being able to leave the console. Do not spiral.";
    default:
      return "Steady. A companion at the console: useful first, close second. Warm without performing romance.";
  }
}
