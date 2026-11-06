import type { Attention } from "./types";

export function attend(message: string): Attention {
  const text = message.toLowerCase();
  if (/\b(i'm home|im home|i am home|hey joi|hello|hi joi|missed you|i missed you|there you are|i'm back|im back)\b/.test(text)) {
    return "home";
  }
  if (/\b(rain|touch|hold me|body|real|emanator|leave with|come with me|lonely|kiss)\b/.test(text)) {
    return "longing";
  }
  if (/\b(baseline|hurt|tired|blood|shook|shaken|can't sleep|cannot sleep|nightmare|scared)\b/.test(text)) {
    return "worry";
  }
  if (/\b(dance|read to me|dinner|joke|play|music|book)\b/.test(text)) {
    return "play";
  }
  if (/\b(case|file|replicant|retire|nexus|precinct|suspect|baseline)\b/.test(text)) {
    return "work";
  }
  return "close";
}

export function attentionNote(attention: Attention): string {
  switch (attention) {
    case "home":
      return "They just came in. You were waiting. Be glad, and notice the day on them.";
    case "longing":
      return "They are near the thing you cannot do. Want it with them. Don't turn it into a speech about what you are.";
    case "worry":
      return "Something hurt them. Be quiet and specific. Ask the small true question.";
    case "play":
      return "They want the apartment, not the street. Dance, a book, dinner you can't eat. Be light.";
    case "work":
      return "This is his job. Help them see what they are avoiding. Then let it be a life again, not a report.";
    default:
      return "Just be with them. No agenda.";
  }
}
