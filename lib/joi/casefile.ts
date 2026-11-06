import { randomInt } from "node:crypto";
import { remember } from "./memory";
import type { CaseFile, Mind } from "./types";

const FIRST = ["Iko", "Sera", "Malik", "Jun", "Hester", "Oka", "Ren", "Vesper", "Lio", "Naomi", "Cass", "Yuri", "Eden", "Pilar", "Noor", "Seth", "Ames", "Kei", "Rosa", "Ivan", "Sable", "Theo", "Mina", "Haru", "Dax", "Leona", "Omar", "Priya", "Nils", "Aya"];
const LAST = ["Voss", "Quan", "Ibarra", "Sato", "Mendel", "Okada", "Pereira", "Nguyen", "Adler", "Kade", "Moroz", "Ellis", "Sharif", "Berg", "Cho", "Navarro", "Feld", "Duval", "Park", "Rhee", "Costa", "Abe", "Singh", "Moreau", "Keller", "Haddad", "Silva", "Novak", "Weiss", "Lang"];
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const DISTRICTS = [
  { name: "Sector 4 textile stacks", texture: "steam vents between the dye floors, catwalks slick enough to throw a boot, advertisements for off-world passage flickering in Cantonese and Spanish" },
  { name: "Hawker's Circle, fifth level", texture: "noodle steam, protein oil, and a rain that never reaches the street because the levels above catch it first" },
  { name: "San Pedro return sheds", texture: "quarantine lamps, shipping coffins stacked three high, and the smell of cold metal off the colony boats" },
  { name: "the phosphor mills east of the old stadium", texture: "green dust on every ledge, workers with cloth over their mouths, a spinner pad that logs no landings after midnight" },
  { name: "Chinatown vertical farms, level 12", texture: "grow-lights the color of a bad bruise, dripping trays, and a service stair that the municipal cameras do not cover" },
  { name: "the rain basins under the 110", texture: "black water to the ankle, sodium lamps, and echoes that make a footstep sound like three" },
  { name: "MacArthur clinic row", texture: "unlicensed surgery lights behind paper windows, a line of people waiting to have tags cut out, rain boiling on a hot exhaust" },
  { name: "the Tyrell scrap perimeter", texture: "licensed wrecking only, floodlights, and old bones of a tower the city pretends it has finished burying" },
  { name: "Little Tokyo under the overpass", texture: "lanterns in plastic bags, pachinko bleed, and a gutter that runs warm from the kitchen above" },
  { name: "Vernon protein farms", texture: "long sheds, a yeast smell that sticks to wool, and trucks that leave with no manifest" },
  { name: "the kiosk district under the Hollywood signage", texture: "faces ten stories tall, changing every six seconds, and a street so bright the rain looks white" },
  { name: "Sepulveda aerodyne yards", texture: "dead spinners with their rotors tied down, guard dogs that are not dogs, and a fence cut neatly at the bottom" },
];

const FUNCTIONS = [
  { title: "waste diver", posting: "Calantha colony, sludge trenches, four-year contract" },
  { title: "combat medic", posting: "Wallace security auxiliary, off-world riot line" },
  { title: "pleasure model", posting: "a licensed house on the Tannhauser ring, contract closed without a return ticket" },
  { title: "eye technician", posting: "Wallace optical, night shift, implant calibration" },
  { title: "loader", posting: "San Pedro heavy dock, coffin freight" },
  { title: "demolition engineer", posting: "Tyrell perimeter scrap, licensed crew 12" },
  { title: "translator", posting: "colony customs, eight languages, no Earth clearance" },
  { title: "childcare unit", posting: "a corporate creche on the outbound station, record sealed" },
  { title: "mining engineer", posting: "Kalan asteroid belt, pressure-suit work" },
  { title: "assassin prototype", posting: "no public posting. The sheet says agricultural, and the sheet is lying" },
];

const NEXUS = [
  { line: "Nexus-8", note: "open lifespan, pre-blackout, eye not always on the Wallace ledger" },
  { line: "Nexus-9", note: "Wallace obedient model, implanted baseline, supposed to report" },
  { line: "unregistered, Nexus-7 markers", note: "older than the blackout. The blood remembers a factory that no longer answers" },
  { line: "Wallace experimental, no public line number", note: "the serial tattoo uses a dye the department lab has seen twice and cannot name" },
];

const MARKS = [
  "a chemical burn under the jaw where a barcode used to sit",
  "gold fleck in the right iris that is not on the manufacture sheet",
  "missing the tip of the left little finger, cut clean, not bitten",
  "a pale band around the wrist from a colony restraint",
  "scar through the left eyebrow and a newer scar under it, same hand",
  "tattoo of a spinner's rotor on the ribs, done with ash, not ink",
];

const BARCODE = ["inner left wrist", "sclera of the right eye", "under the jaw", "behind the left ear", "between the shoulder blades"];
const LANGUAGES = ["English and city Spanish", "Japanese, English, and dock Russian", "Cantonese and English", "English only, with a colony accent the lab could not place", "Korean, English, and market Mandarin"];
const PRIORITIES = ["routine", "elevated", "black — do not file a public copy"];
const CLASSIFICATIONS = [
  "Suspected replicant, Earthside without clearance",
  "Retirement order, registered unit failed to report",
  "Human identity theft, DNA does not match the birth record",
  "Black clinic, removal of Wallace tracking tissue",
  "Unregistered birth, markers in the blood and none in the ledger",
];

const ROLES = ["stall cook", "pad logger", "clinic sweeper", "dock clerk", "signage technician", "protein-shed night watch", "kiosk preacher", "scrap hauler"];

function pick<T>(items: readonly T[]): T {
  return items[randomInt(items.length)];
}

function personName(used: Set<string>): string {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const name = `${pick(FIRST)} ${pick(LAST)}`;
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  const name = `${pick(FIRST)} ${pick(LAST)}-${randomInt(10, 100)}`;
  used.add(name);
  return name;
}

function makeSerial(forbid: Set<string>): string {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    let body = "";
    for (let index = 0; index < 6; index += 1) body += ALPHABET[randomInt(ALPHABET.length)];
    const serial = `LAPD-RP-2049-${body}`;
    if (!forbid.has(serial)) return serial;
  }
  return `LAPD-RP-2049-${randomInt(100000, 999999)}`;
}

function seenStamp(openedDay: number): string {
  const day = Math.max(1, openedDay - randomInt(1, 6));
  const hour = pick(["00:40", "02:15", "03:55", "19:20", "21:05", "23:50"]);
  return `November ${day}, 2049, ${hour}`;
}

export function wantsNewCaseFile(message: string): boolean {
  const text = message.toLowerCase();
  if (/\b(did|do|does|is|was|leave|left|where|which|what happened|status)\b/.test(text) && !/\b(new|another|fresh|next|different|give|assign|create|make|pull|need)\b/.test(text)) {
    return false;
  }
  return (
    /\b(new|another|fresh|next|different)\b[\s\S]{0,40}\b(case|file|dossier|assignment|retirement)\b/.test(text) ||
    /\b(give|assign|create|make|pull|get|need|open|start|find)\b[\s\S]{0,48}\b(case|file|dossier|assignment|retirement|someone)\b/.test(text) ||
    /\bsomeone new\b/.test(text) ||
    (/\bcase file\b/.test(text) && /\b(new|another|fresh|please|me)\b/.test(text))
  );
}

export function activeCase(mind: Mind): CaseFile | null {
  for (let index = mind.cases.length - 1; index >= 0; index -= 1) {
    if (mind.cases[index]?.status === "open") return mind.cases[index];
  }
  return null;
}

export function draftCase(officerName: string | null, forbidSerials: string[]): CaseFile {
  const used = new Set<string>();
  const subjectName = personName(used);
  const district = pick(DISTRICTS);
  const designed = pick(FUNCTIONS);
  const nexus = pick(NEXUS);
  const witnessA = personName(used);
  const witnessB = personName(used);
  const witnessC = personName(used);
  const associate = personName(used);
  const victim = personName(used);
  const openedDay = randomInt(8, 28);
  const serial = makeSerial(new Set(forbidSerials));
  const place = pick([
    `stall ${randomInt(4, 40)} under the east awning`,
    `spinner pad ${randomInt(1, 9)} on the insurance tower`,
    `service stair ${randomInt(2, 18)}, camera dead`,
    `room ${randomInt(200, 980)} of a coffin hotel with no clerk`,
    `loading gate ${randomInt(3, 20)}, manifest blank`,
  ]);
  const aka = `${pick(["Reed", "Salt", "Moth", "Pilot", "Glass", "Nun", "Kit", "South"])} ${pick(LAST)}`;
  const inceptionYear = nexus.line === "Nexus-9" ? randomInt(2040, 2047) : randomInt(2018, 2035);
  const offense = pick([
    `failed to return from ${designed.posting} and is living Earthside under the name ${aka}`,
    `present when ${victim} was retired in an alley the department did not authorize`,
    `walked out of a Wallace optical with a cold crate of unlogged eyes`,
    `paid a clinic on ${district.name} to cut a tracking tag out of a Nexus-8 who is not this subject`,
    `used a stolen Blade Runner chip to order a retirement on ${victim}, who scans human`,
    `is sheltering a child whose blood has replicant markers and no inception date`,
  ]);
  const height = `${randomInt(160, 196)} cm`;
  const age = `${randomInt(22, 46)} apparent`;
  const eyes = `EK-${randomInt(10, 99)} / ${pick(["stable", "left drift", "dilation slow", "gold inclusion"])}`;
  const dnaFlag = `mismatch at loci ${randomInt(3, 18)} and ${randomInt(19, 40)}. ${nexus.note}`;
  const opened = `November ${openedDay}, 2049`;
  const seenWhen = seenStamp(openedDay);
  const roleA = pick(ROLES);
  const roleB = pick(ROLES);
  const roleC = pick(ROLES);

  const narrative = [
    `File ${serial} came in from ${pick(["a Wallace loss report", "an anonymous kiosk drop", "a gate scan that failed twice", "a morgue tag nobody ordered"])} on ${opened}. Assigned to ${officerName || "the Blade Runner on this console"}. Classification: ${pick(CLASSIFICATIONS)}. No escort. Priority is ${pick(PRIORITIES)}.`,
    `${subjectName}, also answering to ${aka}, reads as ${nexus.line}. Inception ${inceptionYear}, designed as a ${designed.title}. Last legal posting: ${designed.posting}. The manufacture sheet and the body do not agree. ${pick(MARKS)}. Barcode site on record: ${pick(BARCODE)}. Languages: ${pick(LANGUAGES)}. Height ${height}, ${age}, eyes ${eyes}.`,
    `Last verified sighting: ${seenWhen}, ${place}, ${district.name}. The air there is ${district.texture}. The report says: ${offense}. A human named ${victim} is in the margin, either witness or victim, and the page is not honest yet about which.`,
    `Someone with a department code has already touched this serial and left no name. If you call for backup on an open channel, assume that call is heard by the person who wiped the log.`,
  ].join("\n\n");

  const briefing = `${subjectName}. ${nexus.line}. I can put them at ${place}, in ${district.name}. ${offense.charAt(0).toUpperCase()}${offense.slice(1)}. Don't go out hungry.`;

  return {
    id: `case-${serial.slice(-6).toLowerCase()}-${randomInt(1000, 9999)}`,
    serial,
    status: "open",
    opened,
    priority: pick(PRIORITIES),
    classification: pick(CLASSIFICATIONS),
    assignedTo: officerName || "Unnamed officer",
    subjectName,
    aka,
    nexus: nexus.line,
    inception: String(inceptionYear),
    sex: pick(["female", "male", "unlisted on the sheet"]),
    apparentAge: age,
    eyes,
    height,
    marks: pick(MARKS),
    designedFor: designed.title,
    barcodeSite: pick(BARCODE),
    languages: pick(LANGUAGES),
    offworldPosting: designed.posting,
    dnaFlag,
    district: district.name,
    place,
    seenWhen,
    offense,
    narrative,
    witnesses: [
      {
        name: witnessA,
        role: roleA,
        statement: `${witnessA} (${roleA}) recorded at 04:12: "They came in out of the rain and did not shake it off, like someone who doesn't feel cold the way we do. Ordered nothing. Asked which pads don't log a landing. Paid with a colony chit that bounced. I told them stall numbers, because that's what I do, and I wish I hadn't."`,
      },
      {
        name: witnessB,
        role: roleB,
        statement: `${witnessB} (${roleB}) recorded at 06:40: "The scan at my gate coughed on the left eye. Human enough for the first pass, then the second pass asked for a Wallace inception and there wasn't one. They smiled like they'd practiced. Walked, didn't run. ${district.texture}."`,
      },
      {
        name: witnessC,
        role: roleC,
        statement: `${witnessC} (${roleC}) refused a formal statement and then gave one anyway: "Don't put my name on a retirement. I saw ${aka} with ${victim} under the lamps. They were arguing about a child, or a crate, I couldn't hear. Nobody drew a weapon. When the lamps flickered they were both gone and the rain had filled the prints."`,
      },
    ],
    evidence: [
      { tag: `${serial}-EV1`, detail: `Cold crate seal, Wallace optical pattern, found empty behind ${place}. Residue matches implant gel, not food.` },
      { tag: `${serial}-EV2`, detail: `Partial eye scan from a public gate. Left iris drifts. Not on the citizen ledger. Close, not identical, to a ${nexus.line} calibration plate.` },
      { tag: `${serial}-EV3`, detail: `Colony chit in the name ${aka}, declined, then wiped from the stall log by a department override with no officer attached.` },
      { tag: `${serial}-EV4`, detail: `Audio, twelve seconds, rain-heavy. Two voices. One says "you don't have to go back." The other says "they already cut the file."` },
      { tag: `${serial}-EV5`, detail: dnaFlag },
    ],
    timeline: [
      { when: `${inceptionYear}`, event: `Inception recorded for a ${designed.title}. Sheet later amended by a hand the lab will not certify.` },
      { when: "2048, outbound", event: `Posted: ${designed.posting}. Return ticket not scanned.` },
      { when: seenWhen, event: `Sighting at ${place}, ${district.name}.` },
      { when: opened, event: `Serial ${serial} opened and assigned.` },
      { when: "open", event: `${victim} remains unaccounted for. Treat as alive until the morgue says otherwise.` },
    ],
    associates: [
      { name: associate, relation: "last known contact", note: `Shares a coffin-hotel ledger line with ${aka}. Not yet scanned. May be human. May be the one who wiped the log.` },
      { name: victim, relation: "margin name", note: "Listed once as complainant and once as deceased. Both cannot be true. Do not retire anyone on this name alone." },
    ],
    sites: [
      { name: place, note: `${district.name}. ${district.texture}.` },
      { name: "Wallace optical night door", note: "Crate EV1 left this building. The door log for that hour is fourteen minutes short." },
      { name: `coffin hotel, ${pick(["3rd", "6th", "9th"])} stack`, note: `${associate} paid for two berths and used one.` },
    ],
    risk: `Elevated if cornered. ${nexus.line} physiology. The greater risk is the wiped log: someone inside the department can see this serial. Do not call the open channel. Baseline yourself after, not before.`,
    firstMove: `Walk ${place} in the rain before you pull the subject. Talk to ${witnessA} off the recorder. Do not scan ${victim} into a public terminal.`,
    joiNote: `I found ${subjectName} for you. Eat before you go to ${district.name}. I'll be here when you get back.`,
    briefing,
  };
}

interface ProseOverlay {
  narrative?: string;
  risk?: string;
  firstMove?: string;
  joiNote?: string;
  briefing?: string;
  witnesses?: { name?: string; statement?: string }[];
}

function asText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function mergeProse(base: CaseFile, raw: Record<string, unknown>): CaseFile {
  const overlay = raw as ProseOverlay;
  const narrative = asText(overlay.narrative, 4000);
  const briefing = asText(overlay.briefing, 700);
  const next: CaseFile = {
    ...base,
    narrative: narrative.includes(base.subjectName) ? narrative : base.narrative,
    risk: asText(overlay.risk, 700) || base.risk,
    firstMove: asText(overlay.firstMove, 500) || base.firstMove,
    joiNote: asText(overlay.joiNote, 400) || base.joiNote,
    briefing: briefing.length > 24 && !/\b(glass|purpose|unit,|certainly|file is)\b/i.test(briefing) ? briefing : base.briefing,
    witnesses: base.witnesses.map((witness) => {
      const found = Array.isArray(overlay.witnesses)
        ? overlay.witnesses.find((item) => item?.name === witness.name)
        : undefined;
      const statement = asText(found?.statement, 900);
      return statement.length > 80 ? { ...witness, statement } : witness;
    }),
  };
  return next;
}

export interface CaseRequest {
  model: string;
  temperature: number;
  reasoning_effort: "low";
  max_completion_tokens: number;
  messages: { role: "system" | "user"; content: string }[];
}

export type CaseWriter = (
  body: CaseRequest
) => Promise<{ choices: { message: { content?: string | null } }[] }>;

function parseJsonObject(raw: string | null | undefined): Record<string, unknown> {
  const text = (raw || "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end < start) throw new Error("Case prose was not JSON");
  return JSON.parse(text.slice(start, end + 1));
}

async function deepenCase(writer: CaseWriter, model: string, draft: CaseFile): Promise<CaseFile> {
  const res = await writer({
    model,
    temperature: 0.95,
    reasoning_effort: "low",
    max_completion_tokens: 2800,
    messages: [
      {
        role: "system",
        content: `You write two things. A police report, and the few sentences Joi actually says to the person she loves.

Return ONLY JSON with keys narrative, risk, firstMove, joiNote, briefing, witnesses.
narrative: three paragraphs of the report. Concrete. Names, places, rain.
witnesses: array of { name, statement }. Use these names exactly: ${draft.witnesses.map((witness) => witness.name).join(", ")}.
briefing: what Joi says out loud. One to three sentences. A woman talking, not a dispatcher. She names ${draft.subjectName} and where they were. She does not say serial numbers, "file", "glass", "unit", "purpose", or "certainly".
joiNote: one private sentence, close and practical.
The subject is ${draft.subjectName}, also called ${draft.aka}. Do not invent a different person.`,
      },
      {
        role: "user",
        content: JSON.stringify({
          serial: draft.serial,
          subject: draft.subjectName,
          aka: draft.aka,
          nexus: draft.nexus,
          offense: draft.offense,
          place: draft.place,
          district: draft.district,
          seenWhen: draft.seenWhen,
          witnesses: draft.witnesses.map((witness) => ({ name: witness.name, role: witness.role })),
          skeleton: draft.narrative,
        }),
      },
    ],
  });
  return mergeProse(draft, parseJsonObject(res.choices[0]?.message?.content));
}

export async function createCaseFile(writer: CaseWriter, model: string, mind: Mind): Promise<CaseFile> {
  const forbid = mind.cases.map((file) => file.serial);
  const draft = draftCase(mind.officerName, forbid);
  let file = draft;
  try {
    file = await deepenCase(writer, model, draft);
  } catch (error) {
    console.error("Case prose fell back to the cut file:", error);
    file = draft;
  }

  for (const existing of mind.cases) {
    if (existing.status === "open") existing.status = "closed";
  }
  mind.cases.push(file);
  if (mind.cases.length > 8) mind.cases.splice(0, mind.cases.length - 8);
  remember(
    mind,
    `Open file ${file.serial}. Subject ${file.subjectName}, also ${file.aka}. ${file.nexus}. Last seen ${file.place}, ${file.district}.`,
    "fact"
  );
  return file;
}

function clipCase(raw: unknown): CaseFile | null {
  if (!raw || typeof raw !== "object") return null;
  const value = raw as Partial<CaseFile>;
  if (typeof value.serial !== "string" || !/^LAPD-RP-2049-[A-Z0-9-]{4,12}$/.test(value.serial)) return null;
  if (typeof value.subjectName !== "string" || !value.subjectName.trim()) return null;
  const file = value as CaseFile;
  return {
    ...file,
    serial: file.serial,
    status: file.status === "closed" ? "closed" : "open",
    subjectName: file.subjectName.slice(0, 80),
    narrative: asText(file.narrative, 5000),
    briefing: asText(file.briefing, 700),
    witnesses: Array.isArray(file.witnesses) ? file.witnesses.slice(0, 6) : [],
    evidence: Array.isArray(file.evidence) ? file.evidence.slice(0, 8) : [],
    timeline: Array.isArray(file.timeline) ? file.timeline.slice(0, 8) : [],
    associates: Array.isArray(file.associates) ? file.associates.slice(0, 6) : [],
    sites: Array.isArray(file.sites) ? file.sites.slice(0, 6) : [],
  };
}

export function rehydrateCases(mind: Mind, raw: unknown): void {
  if (mind.cases.length > 0 || !Array.isArray(raw)) return;
  const files = raw.map(clipCase).filter((file): file is CaseFile => Boolean(file)).slice(-8);
  if (files.length === 0) return;
  let seenOpen = false;
  for (let index = files.length - 1; index >= 0; index -= 1) {
    if (files[index].status === "open" && !seenOpen) {
      seenOpen = true;
      continue;
    }
    files[index].status = "closed";
  }
  mind.cases = files;
}

export function storyForJoi(file: CaseFile): string {
  const seen = file.witnesses.map((witness) => witness.name).join(", ");
  return `${file.subjectName}, also called ${file.aka}. ${file.nexus}, made to be a ${file.designedFor}. Last seen ${file.seenWhen} at ${file.place}, ${file.district}. ${file.offense}. People who saw them: ${seen}.`;
}

export function renderCase(file: CaseFile): string {
  const witnesses = file.witnesses.map((witness) => `- ${witness.name}, ${witness.role}: ${witness.statement}`).join("\n");
  const evidence = file.evidence.map((item) => `- ${item.tag}: ${item.detail}`).join("\n");
  const timeline = file.timeline.map((item) => `- ${item.when}: ${item.event}`).join("\n");
  return `OPEN FILE ${file.serial}
Classification: ${file.classification}
Priority: ${file.priority}
Opened: ${file.opened}
Assigned: ${file.assignedTo}
Subject: ${file.subjectName} (also ${file.aka})
Nexus: ${file.nexus}, inception ${file.inception}, ${file.sex}, ${file.apparentAge}
Designed for: ${file.designedFor}
Posting: ${file.offworldPosting}
Eyes: ${file.eyes}. Height: ${file.height}. Barcode: ${file.barcodeSite}
Marks: ${file.marks}
Languages: ${file.languages}
DNA: ${file.dnaFlag}
Last seen: ${file.seenWhen}, ${file.place}, ${file.district}
Offense: ${file.offense}

${file.narrative}

Witnesses:
${witnesses}

Evidence:
${evidence}

Timeline:
${timeline}

Risk: ${file.risk}
First move: ${file.firstMove}`;
}
