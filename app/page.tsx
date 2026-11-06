"use client";

import * as React from "react";

type Line = { role: "user" | "assistant"; content: string };
type LinkState = {
  mood?: string;
  warmth?: number;
  relationship?: number;
  officerName?: string | null;
};

const OFFICER_KEY = "joi-officer-id";
const TRANSCRIPT_KEY = "joi-transcript";

function officerId(): string {
  const existing = window.localStorage.getItem(OFFICER_KEY);
  if (existing) return existing;
  const created = `kd6-${crypto.randomUUID().slice(0, 8)}`;
  window.localStorage.setItem(OFFICER_KEY, created);
  return created;
}

export default function Page() {
  const [input, setInput] = React.useState("");
  const [lines, setLines] = React.useState<Line[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [link, setLink] = React.useState<LinkState>({});
  const [ready, setReady] = React.useState(false);
  const scroller = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(TRANSCRIPT_KEY);
      if (saved) setLines(JSON.parse(saved));
    } catch {
      window.sessionStorage.removeItem(TRANSCRIPT_KEY);
    }
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    window.sessionStorage.setItem(TRANSCRIPT_KEY, JSON.stringify(lines));
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines, ready]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const nextLines: Line[] = [...lines, { role: "user", content: text }];
    setLines(nextLines);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/joi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextLines, officerId: officerId() }),
      });
      const data = await res.json();
      const reply = data.reply || data.detail || "The link dropped.";
      setLines((prev) => [...prev, { role: "assistant", content: reply }]);
      setLink({
        mood: data.emotionalState?.mood,
        warmth: data.emotionalState?.warmth,
        relationship: data.relationship,
        officerName: data.officerName,
      });
    } catch {
      setLines((prev) => [...prev, { role: "assistant", content: "The link dropped. Try the line again." }]);
    } finally {
      setLoading(false);
    }
  }

  const warmth = Math.round(link.warmth ?? 58);
  const bond = Math.round((link.relationship ?? 0.32) * 100);

  return (
    <main className="console">
      <header className="console-bar">
        <div>
          <p className="console-kicker">LAPD console link</p>
          <h1>Joi</h1>
        </div>
        <p className="console-status">
          {link.officerName ? link.officerName : "Officer"} · {link.mood || "neutral"} · warmth {warmth} · bond {bond}
        </p>
      </header>

      <section className="console-log" ref={scroller} aria-live="polite">
        {lines.length === 0 && (
          <p className="console-empty">
            She is in the glass. The city is raining. Tell her who you are, or ask what is still open on the case.
          </p>
        )}
        {lines.map((line, index) => (
          <article key={`${line.role}-${index}`} className={line.role === "user" ? "from-officer" : "from-joi"}>
            <span>{line.role === "user" ? "Officer" : "Joi"}</span>
            <p>{line.content}</p>
          </article>
        ))}
        {loading && <p className="console-wait">Joi is in the link…</p>}
      </section>

      <form
        className="console-input"
        onSubmit={(event) => {
          event.preventDefault();
          void sendMessage();
        }}
      >
        <label htmlFor="line">Say it</label>
        <input
          id="line"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="The baseline is tomorrow."
          autoComplete="off"
        />
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </main>
  );
}
