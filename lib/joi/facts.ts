import type { Mind } from "./types";

function remembered(mind: Mind): string {
  return [...mind.shortTerm, ...mind.longTerm].map((item) => item.text.toLowerCase()).join("\n");
}

export function consoleFact(mind: Mind, message: string): string | null {
  const text = message.toLowerCase();
  const memory = remembered(mind);
  const asksAboutFile = /\b(case file|file|serial|dossier)\b/.test(text) && /\b(open|leave|left|where|number|which|missing)\b/.test(text);

  if (asksAboutFile && !/\b(serial|dossier|case number|file number)\b/.test(memory)) {
    return "Nothing is open in the glass. I don't have a file number until you give me one.";
  }

  return null;
}
