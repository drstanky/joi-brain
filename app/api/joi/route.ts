export const runtime = "nodejs";

import OpenAI from "openai";
import { activeCase, createCaseFile, rehydrateCases, wantsNewCaseFile } from "@/lib/joi/casefile";
import { applyDecay, bodyFor, getExpression, updateEmotion } from "@/lib/joi/emotion";
import { consoleFact } from "@/lib/joi/facts";
import { captureOfficerName, presenceSnapshot, remember } from "@/lib/joi/memory";
import { getMind, rehydratePresence, sanitizeOfficerId } from "@/lib/joi/mind";
import { buildSystemPrompt, holdTheWorld } from "@/lib/joi/prompt";
import type { ChatMessage, Sentiment } from "@/lib/joi/types";

if (!process.env.GROQ_API_KEY) {
  console.error("GROQ_API_KEY is missing in environment variables");
}

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL = process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b";

function parseJsonObject(raw: string | null | undefined): Record<string, unknown> {
  const text = (raw || "").trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end < start) {
    throw new Error("Sentiment response did not contain JSON");
  }
  return JSON.parse(text.slice(start, end + 1));
}

async function getSentiment(text: string): Promise<Sentiment> {
  try {
    const res = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `Return ONLY valid JSON:\n{
  "valence": -1.0 to 1.0,
  "intensity": 0.0 to 1.0,
  "primaryEmotion": "affection|joy|playful|lonely|curious|vulnerable|sadness|hopeful|frustrated|neutral",
  "needsWarmth": 0.0 to 1.0
}`,
        },
        { role: "user", content: text },
      ],
      temperature: 0,
      reasoning_effort: "low",
      max_completion_tokens: 500,
    });

    const parsed = parseJsonObject(res.choices[0].message.content);
    return {
      valence: Number(parsed.valence) || 0,
      intensity: Number(parsed.intensity) || 0.5,
      primary: String(parsed.primaryEmotion || "neutral"),
      needsWarmth: Number(parsed.needsWarmth) || 0.6,
    };
  } catch (error) {
    console.error("Sentiment error:", error);
    return { valence: 0, intensity: 0.5, primary: "neutral", needsWarmth: 0.6 };
  }
}

function trimMessages(messages: ChatMessage[], maxTurns = 16): ChatMessage[] {
  const usable = messages.filter(
    (message) =>
      message &&
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.trim()
  );
  if (usable.length <= maxTurns) return usable;
  return usable.slice(-maxTurns);
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = trimMessages(Array.isArray(body?.messages) ? body.messages : []);
    const lastUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content.trim() || "";

    if (!lastUserMessage) {
      return Response.json({ error: "Message is required" }, { status: 400, headers: corsHeaders });
    }

    const mind = getMind(sanitizeOfficerId(body?.officerId));
    rehydrateCases(mind, body?.cases);
    rehydratePresence(mind, body?.presence);
    const now = Date.now();
    applyDecay(mind, now);
    mind.lastInteractionTime = now;

    captureOfficerName(mind, lastUserMessage);
    const openingFile = wantsNewCaseFile(lastUserMessage);
    const sentimentPromise = getSentiment(lastUserMessage);
    const casePromise = openingFile
      ? createCaseFile((body) => client.chat.completions.create(body), MODEL, mind)
      : null;
    const sentiment = await sentimentPromise;
    updateEmotion(mind, sentiment);
    remember(mind, lastUserMessage, sentiment.valence > 0.45 ? "emotional" : "event");

    if (casePromise) {
      const file = await casePromise;
      const reply = holdTheWorld(file.briefing, lastUserMessage);
      return Response.json(
        {
          reply,
          emotionalState: mind.emotionalState,
          expression: getExpression(mind.emotionalState),
          relationship: mind.relationshipScore,
          officerName: mind.officerName,
          canon: ["lapd", "replicant"],
          caseFile: file,
          cases: mind.cases,
          body: bodyFor(mind.emotionalState),
          presence: presenceSnapshot(mind),
        },
        { headers: corsHeaders }
      );
    }

    const known = consoleFact(mind, lastUserMessage);
    let reply = known || "";
    let canon: { id: string }[] = [];

    if (!known) {
      const built = buildSystemPrompt(mind, lastUserMessage);
      canon = built.canon;
      const temperature = Math.max(0.65, Math.min(0.86, 0.7 + (1 - mind.relationshipScore) * 0.25));
      const completion = await client.chat.completions.create({
        model: MODEL,
        messages: [{ role: "system", content: built.prompt }, ...messages],
        temperature,
        reasoning_effort: "low",
        max_completion_tokens: 900,
        top_p: 0.92,
        frequency_penalty: 0.16,
        presence_penalty: 0.19,
      });
      reply = holdTheWorld(completion.choices[0].message.content || "", lastUserMessage);
    }

    return Response.json(
      {
        reply,
        emotionalState: mind.emotionalState,
        expression: getExpression(mind.emotionalState),
        relationship: mind.relationshipScore,
        officerName: mind.officerName,
        canon: canon.map((chunk) => chunk.id),
        caseFile: activeCase(mind),
        cases: mind.cases,
        body: bodyFor(mind.emotionalState),
        presence: presenceSnapshot(mind),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("JOI API Error:", error);
    const detail = error instanceof Error ? error.message : "Unknown error";
    return Response.json(
      { error: "Internal server error", detail },
      { status: 500, headers: corsHeaders }
    );
  }
}
