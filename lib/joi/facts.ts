import { activeCase, wantsNewCaseFile } from "./casefile";
import type { Mind } from "./types";

function remembered(mind: Mind): string {
  return [...mind.shortTerm, ...mind.longTerm].map((item) => item.text.toLowerCase()).join("\n");
}

export function consoleFact(mind: Mind, message: string): string | null {
  if (wantsNewCaseFile(message)) return null;
  const text = message.toLowerCase();
  const memory = remembered(mind);
  const asksAboutFile = /\b(case file|file|serial|dossier)\b/.test(text) && /\b(open|leave|left|where|number|which|missing)\b/.test(text);
  const hasFile = Boolean(activeCase(mind)) || /\b(lapd-rp-|file number|case number)\b/.test(memory);

  if (asksAboutFile && !hasFile) {
    return "Nothing is open in the glass. Ask me for a new case file and I'll cut one.";
  }

  return null;
}
