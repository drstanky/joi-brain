import assert from "node:assert/strict";
import { selectCanon } from "./canon";
import { captureOfficerName } from "./memory";
import { freshMind, sanitizeOfficerId } from "./mind";
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
assert.match(holdTheWorld("I am a language model from a movie."), /link shivered/);

console.log("joi selfcheck ok");
