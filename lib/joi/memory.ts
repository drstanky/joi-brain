import type { MemoryNode, MemoryType, Mind } from "./types";

const NAME_PATTERN =
  /\b(?:my name is|call me|i am officer|i'm officer|this is officer|it's officer|name's)\s+([A-Za-z][A-Za-z'-]{0,24}(?:\s+[A-Za-z][A-Za-z'-]{0,24}){0,2})/i;

function memoryId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function remember(mind: Mind, text: string, type: MemoryType = "event"): void {
  const trimmed = text.trim();
  if (!trimmed) return;

  const node: MemoryNode = {
    id: memoryId(),
    text: trimmed,
    type,
    strength: 0.45 + mind.relationshipScore * 0.55,
    timestamp: Date.now(),
    lastAccessed: Date.now(),
  };

  mind.shortTerm.push(node);
  if (mind.shortTerm.length > 22) mind.shortTerm.shift();

  const worthKeeping = node.strength > 0.7 || type === "emotional" || type === "fact" || type === "intimate";
  if (worthKeeping) {
    mind.longTerm.push({ ...node });
    if (mind.longTerm.length > 14) mind.longTerm.shift();
  }
}

export function captureOfficerName(mind: Mind, text: string): void {
  const match = text.match(NAME_PATTERN);
  if (!match) return;
  const name = match[1].replace(/\s+/g, " ").replace(/[.,!?].*$/, "").trim();
  if (!name || name.length < 2) return;
  mind.officerName = name;
  remember(mind, `Their name is ${name}.`, "fact");
}

export function memoryContext(mind: Mind): string {
  const recent = mind.shortTerm.slice(-8).map((item) => `• ${item.text}`).join("\n");
  const deep = [...mind.longTerm]
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5)
    .map((item) => item.text)
    .join(" | ");

  const name = mind.officerName ? `Their name is ${mind.officerName}.` : "You do not know their name yet.";
  return `${name}\nWhat just happened:\n${recent || "Nothing yet."}\nWhat has stayed:\n${deep || "Nothing yet."}`;
}

export function presenceSnapshot(mind: Mind) {
  const memories = [...mind.longTerm, ...mind.shortTerm].slice(-12).map((item) => item.text);
  return {
    officerName: mind.officerName,
    relationship: mind.relationshipScore,
    emotionalState: mind.emotionalState,
    memories,
  };
}
