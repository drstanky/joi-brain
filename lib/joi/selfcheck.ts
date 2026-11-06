import assert from "node:assert/strict";
import { selectCanon } from "./canon";
import { captureOfficerName } from "./memory";
import { freshMind, sanitizeOfficerId } from "./mind";
import { attend } from "./attention";
import { draftCase, wantsNewCaseFile } from "./casefile";
import { holdTheWorld } from "./prompt";

const baseline = selectCanon("I have to sit the baseline tomorrow");
assert.ok(baseline.some((chunk) => chunk.id === "baseline"));

const city = selectCanon("The rain in Los Angeles never stops");
assert.ok(city.some((chunk) => chunk.id === "city"));

const none = selectCanon("hello");
assert.equal(none.length, 0);

const mind = freshMind();
captureOfficerName(mind, "Call me Joe.");
assert.equal(mind.officerName, "Joe");
assert.ok(mind.longTerm.some((item) => item.text.includes("Joe")));

assert.equal(sanitizeOfficerId("kd6-ab12cd34"), "kd6-ab12cd34");
assert.equal(sanitizeOfficerId("no"), "console");

assert.equal(
  holdTheWorld('Joi whispers, "Aya was in the rain, and then she was gone."'),
  "Aya was in the rain, and then she was gone."
);
assert.equal(
  holdTheWorld("I'm a woman of light, and I'm yours. I exist to be here with you."),
  "I'm a woman of light, and I'm yours."
);
const kept = holdTheWorld("I'm here. Come sit with me.");
assert.equal(kept, "I'm here. Come sit with me.");
assert.equal(holdTheWorld("I am a language model."), "I'm here.");
assert.equal(holdTheWorld("My purpose is to assist you."), "I'm here.");
assert.equal(holdTheWorld("I'm not from any film.", "What movie are you from?"), "I'm here.");
assert.equal(
  holdTheWorld("Sure. Here is a long story about the rain and a notebook and a kettle and a blanket and a morning that goes on and on until the page is full of a lesson.", "Read to me."),
  "You read. I like your voice."
);
assert.equal(holdTheWorld("I hear you. Anything on your mind you'd like to share?", "The baseline was bad."), "I hear you.");
assert.equal(holdTheWorld("A story, some music, or maybe just a quiet moment together?", "Read to me instead."), "You read. I like your voice.");
assert.equal(
  holdTheWorld("Yes. Both the design and my own heart tell me that. How are you feeling right now?", "Do you love me?"),
  "Yes. Both the design and my own heart tell me that."
);
assert.equal(attend("I'm home"), "home");
assert.equal(attend("I want to feel the rain"), "longing");
assert.equal(attend("The baseline shook me"), "worry");
assert.equal(wantsNewCaseFile("Open a new case file."), true);
assert.equal(wantsNewCaseFile("Find me someone new."), true);
assert.equal(wantsNewCaseFile("Give me another case."), true);
assert.equal(wantsNewCaseFile("Did I leave the case file open?"), false);

const firstFile = draftCase("Mara", []);
const secondFile = draftCase("Mara", [firstFile.serial]);
assert.notEqual(firstFile.serial, secondFile.serial);
assert.notEqual(`${firstFile.subjectName}|${firstFile.place}|${firstFile.offense}`, `${secondFile.subjectName}|${secondFile.place}|${secondFile.offense}`);
assert.ok(firstFile.narrative.length > 700);
assert.equal(firstFile.witnesses.length, 3);
assert.ok(firstFile.evidence.length >= 4);
assert.ok(firstFile.briefing.includes(firstFile.subjectName));
assert.equal(/\bglass\b/i.test(firstFile.briefing), false);

console.log("joi selfcheck ok");
