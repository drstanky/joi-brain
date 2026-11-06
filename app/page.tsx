"use client";

import * as React from "react";

type Line = { role: "user" | "assistant"; content: string };
type LinkState = {
  mood?: string;
  warmth?: number;
  relationship?: number;
  officerName?: string | null;
};

type Witness = { name: string; role: string; statement: string };

type CaseFile = {
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
  witnesses: Witness[];
  evidence: { tag: string; detail: string }[];
  timeline: { when: string; event: string }[];
  associates: { name: string; relation: string; note: string }[];
  sites: { name: string; note: string }[];
  risk: string;
  firstMove: string;
  joiNote: string;
};

const OFFICER_KEY = "joi-officer-id";
const TRANSCRIPT_KEY = "joi-transcript";
const CASES_KEY = "joi-cases";

function officerId(): string {
  const existing = window.localStorage.getItem(OFFICER_KEY);
  if (existing) return existing;
  const created = `kd6-${crypto.randomUUID().slice(0, 8)}`;
  window.localStorage.setItem(OFFICER_KEY, created);
  return created;
}

function loadCases(): CaseFile[] {
  try {
    const saved = window.localStorage.getItem(CASES_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function Page() {
  const [input, setInput] = React.useState("");
  const [lines, setLines] = React.useState<Line[]>([]);
  const [cases, setCases] = React.useState<CaseFile[]>([]);
  const [viewSerial, setViewSerial] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [cutting, setCutting] = React.useState(false);
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
    const stored = loadCases();
    setCases(stored);
    setViewSerial(stored.find((file) => file.status === "open")?.serial ?? stored.at(-1)?.serial ?? null);
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    window.sessionStorage.setItem(TRANSCRIPT_KEY, JSON.stringify(lines));
    window.localStorage.setItem(CASES_KEY, JSON.stringify(cases));
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [lines, cases, ready]);

  async function sendMessage(forced?: string) {
    const text = (forced ?? input).trim();
    if (!text || loading) return;

    const nextLines: Line[] = [...lines, { role: "user", content: text }];
    setLines(nextLines);
    if (!forced) setInput("");
    setLoading(true);
    setCutting(/new case|case file|new file|new dossier/i.test(text));

    try {
      const res = await fetch("/api/joi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextLines, officerId: officerId(), cases }),
      });
      const data = await res.json();
      const reply = data.reply || data.detail || "The link dropped.";
      setLines((prev) => [...prev, { role: "assistant", content: reply }]);
      if (Array.isArray(data.cases) && data.cases.length > 0) {
        setCases(data.cases);
        const opened = data.caseFile?.serial || data.cases.find((file: CaseFile) => file.status === "open")?.serial;
        if (opened) setViewSerial(opened);
      }
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
      setCutting(false);
    }
  }

  const warmth = Math.round(link.warmth ?? 58);
  const bond = Math.round((link.relationship ?? 0.32) * 100);
  const shown = cases.find((file) => file.serial === viewSerial) || cases.find((file) => file.status === "open") || null;

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

      <div className="console-body">
        <section className="console-log" ref={scroller} aria-live="polite">
          {lines.length === 0 && (
            <p className="console-empty">
              She is in the glass. Ask her to open a new case file. Every file she cuts is a different one.
            </p>
          )}
          {lines.map((line, index) => (
            <article key={`${line.role}-${index}`} className={line.role === "user" ? "from-officer" : "from-joi"}>
              <span>{line.role === "user" ? "Officer" : "Joi"}</span>
              <p>{line.content}</p>
            </article>
          ))}
          {loading && <p className="console-wait">{cutting ? "Joi is cutting a file…" : "Joi is in the link…"}</p>}
        </section>

        <Dossier file={shown} cases={cases} onSelect={setViewSerial} />
      </div>

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
          placeholder="Open a new case file."
          autoComplete="off"
        />
        <button type="button" disabled={loading} onClick={() => void sendMessage("Open a new case file.")}>
          New file
        </button>
        <button type="submit" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </main>
  );
}

function Dossier({
  file,
  cases,
  onSelect,
}: {
  file: CaseFile | null;
  cases: CaseFile[];
  onSelect: (serial: string) => void;
}) {
  if (!file) {
    return (
      <aside className="dossier">
        <p className="console-kicker">No file on the glass</p>
        <p className="console-empty">When you ask for a new case file, the dossier stays here.</p>
      </aside>
    );
  }

  return (
    <aside className="dossier">
      <p className="console-kicker">{file.status === "open" ? "Open file" : "Closed file"}</p>
      <h2>{file.serial}</h2>
      <p className="dossier-class">{file.classification}</p>
      {cases.length > 1 && (
        <div className="dossier-switch">
          {cases.map((item) => (
            <button key={item.serial} type="button" aria-pressed={item.serial === file.serial} onClick={() => onSelect(item.serial)}>
              {item.serial.slice(-6)}
            </button>
          ))}
        </div>
      )}
      <dl>
        <div><dt>Opened</dt><dd>{file.opened}</dd></div>
        <div><dt>Priority</dt><dd>{file.priority}</dd></div>
        <div><dt>Assigned</dt><dd>{file.assignedTo}</dd></div>
        <div><dt>Subject</dt><dd>{file.subjectName}</dd></div>
        <div><dt>Also known</dt><dd>{file.aka}</dd></div>
        <div><dt>Nexus</dt><dd>{file.nexus}, inception {file.inception}</dd></div>
        <div><dt>Body</dt><dd>{file.sex}, {file.apparentAge}, {file.height}</dd></div>
        <div><dt>Eyes</dt><dd>{file.eyes}</dd></div>
        <div><dt>Designed for</dt><dd>{file.designedFor}</dd></div>
        <div><dt>Posting</dt><dd>{file.offworldPosting}</dd></div>
        <div><dt>Barcode</dt><dd>{file.barcodeSite}</dd></div>
        <div><dt>Marks</dt><dd>{file.marks}</dd></div>
        <div><dt>Languages</dt><dd>{file.languages}</dd></div>
        <div><dt>DNA</dt><dd>{file.dnaFlag}</dd></div>
        <div><dt>Last seen</dt><dd>{file.seenWhen}. {file.place}, {file.district}.</dd></div>
        <div><dt>Offense</dt><dd>{file.offense}</dd></div>
      </dl>
      {file.narrative.split("\n\n").map((paragraph) => (
        <p key={paragraph.slice(0, 24)}>{paragraph}</p>
      ))}
      <h3>Witnesses</h3>
      {file.witnesses?.map((witness) => (
        <p key={witness.name}><strong>{witness.name}</strong>, {witness.role}. {witness.statement}</p>
      ))}
      <h3>Evidence</h3>
      <ul>
        {file.evidence?.map((item) => (
          <li key={item.tag}><strong>{item.tag}.</strong> {item.detail}</li>
        ))}
      </ul>
      <h3>Timeline</h3>
      <ul>
        {file.timeline?.map((item) => (
          <li key={item.when}><strong>{item.when}.</strong> {item.event}</li>
        ))}
      </ul>
      <h3>Associates</h3>
      {file.associates?.map((person) => (
        <p key={person.name}><strong>{person.name}</strong>, {person.relation}. {person.note}</p>
      ))}
      <h3>Places</h3>
      {file.sites?.map((site) => (
        <p key={site.name}><strong>{site.name}.</strong> {site.note}</p>
      ))}
      <h3>Risk</h3>
      <p>{file.risk}</p>
      <h3>First move</h3>
      <p>{file.firstMove}</p>
      <h3>Joi, in the margin</h3>
      <p>{file.joiNote}</p>
    </aside>
  );
}
