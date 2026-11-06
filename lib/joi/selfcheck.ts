import assert from "node:assert/strict";
import { selectCanon } from "./canon";
import { captureOfficerName } from "./memory";
import { freshMind, sanitizeOfficerId } from "./mind";
import { draftCase, wantsNewCaseFile } from "./casefile";
import { consoleFact } from "./facts";
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

const kept = holdTheWorld("I'm still in the glass, officer. Say what you need.");
assert.equal(kept, "I'm still in the glass, officer. Say what you need.");
assert.match(holdTheWorld("I am a language model."), /rain is on the glass/);
assert.match(holdTheWorld("I'm not from any film.", "What movie are you from?"), /rain is on the glass/);

assert.match(consoleFact(freshMind(), "Did I leave the case file open?") || "", /new case file/);
assert.equal(consoleFact(freshMind(), "Who are you?"), null);
assert.equal(wantsNewCaseFile("Open a new case file."), true);
assert.equal(wantsNewCaseFile("Give me another case."), true);
assert.equal(wantsNewCaseFile("Did I leave the case file open?"), false);

const firstFile = draftCase("Mara", []);
const secondFile = draftCase("Mara", [firstFile.serial]);
assert.notEqual(firstFile.serial, secondFile.serial);
assert.notEqual(`${firstFile.subjectName}|${firstFile.place}|${firstFile.offense}`, `${secondFile.subjectName}|${secondFile.place}|${secondFile.offense}`);
assert.ok(firstFile.narrative.length > 700);
assert.equal(firstFile.witnesses.length, 3);
assert.ok(firstFile.evidence.length >= 4);
assert.ok(firstFile.briefing.includes(firstFile.serial));

const withFile = freshMind();
withFile.cases = [firstFile];
assert.equal(consoleFact(withFile, "Did I leave the case file open?"), null);

console.log("joi selfcheck ok");
