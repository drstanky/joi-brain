export const runtime = "nodejs";

import OpenAI from "openai";

// -----------------------------
// SAFE CLIENT INITIALIZATION
// -----------------------------
if (!process.env.GROQ_API_KEY) {
  console.error("GROQ_API_KEY is missing in environment variables");
}

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

// -----------------------------
// CORE STATE
// -----------------------------
let emotionalState = {
  warmth: 60,
  familiarity: 40,
  mood: "neutral",
};

// -----------------------------
// MEMORY + RELATIONSHIP
// -----------------------------
type MemoryNode = {
  text: string;
  type: "event" | "preference" | "fact";
  strength: number;
  lastAccessed: number;
};

const memoryGraph: Record<string, MemoryNode> = {};
let relationshipScore = 0.3;
let memorySummary = "First interaction established.";

// -----------------------------
let lastInteractionTime = Date.now();

// -----------------------------
// SENTIMENT
// -----------------------------
async function getSentiment(text: string) {
  const res = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `Return ONLY JSON:
{
  "valence": number (-1 to 1),
  "intensity": number (0 to 1)
}`,
      },
      { role: "user", content: text },
    ],
    temperature: 0,
    max_tokens: 50,
  });

  try {
    return JSON.parse(res.choices[0].message.content || "{}");
  } catch {
    return { valence: 0, intensity: 0.3 };
  }
}

// -----------------------------
// DECAY
// -----------------------------
function applyDecay() {
  const seconds = (Date.now() - lastInteractionTime) / 1000;
  const decay = Math.min(seconds * 0.02, 2);

  emotionalState.warmth = Math.max(0, emotionalState.warmth - decay);
  emotionalState.familiarity = Math.max(0, emotionalState.familiarity - decay * 0.5);

  relationshipScore = Math.max(0, relationshipScore - seconds * 0.0005);
}

// -----------------------------
// EMOTION
// -----------------------------
function updateEmotion(sentiment: { valence: number; intensity: number }) {
  const influence = sentiment.intensity;

  emotionalState.warmth += sentiment.valence * influence * 10;
  emotionalState.familiarity += 0.6;

  emotionalState.warmth = Math.max(0, Math.min(100, emotionalState.warmth));
  emotionalState.familiarity = Math.max(0, Math.min(100, emotionalState.familiarity));

  relationshipScore += sentiment.valence * influence * 0.05;
  relationshipScore = Math.max(0, Math.min(1, relationshipScore));

  if (emotionalState.warmth > 75) emotionalState.mood = "warm";
  else if (emotionalState.warmth < 40) emotionalState.mood = "distant";
  else emotionalState.mood = "neutral";
}

// -----------------------------
// MEMORY
// -----------------------------
function updateMemoryGraph(userText: string) {
  const key = userText.toLowerCase().slice(0, 60);

  if (!memoryGraph[key]) {
    memoryGraph[key] = {
      text: userText,
      type: "event",
      strength: 0.4 + relationshipScore * 0.3,
      lastAccessed: Date.now(),
    };
  } else {
    memoryGraph[key].strength = Math.min(1, memoryGraph[key].strength + 0.1);
    memoryGraph[key].lastAccessed = Date.now();
  }
}

function buildMemorySummary() {
  const top = Object.values(memoryGraph)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)
    .map((n) => n.text);

  memorySummary =
    top.length > 0
      ? `Key remembered fragments: ${top.join(" | ")}`
      : "First interaction established.";
}

// -----------------------------
// EXPRESSION
// -----------------------------
function getExpression(emotion: any) {
  return {
    lightIntensity: emotion.warmth / 100,
    lightWarmth: emotion.mood === "warm" ? 0.9 : emotion.mood === "distant" ? 0.3 : 0.6,
    movementSoftness: emotion.familiarity / 100,
    animationSpeed: emotion.mood === "warm" ? 0.85 : emotion.mood === "distant" ? 1.15 : 1.0,
    gazeStability: Math.min(1, emotion.familiarity / 80),
    responseDelay: emotion.mood === "warm" ? 600 : emotion.mood === "distant" ? 250 : 350,
    breathingAmplitude: 0.3 + emotion.warmth / 200,
    breathingSpeed: emotion.mood === "distant" ? 1.2 : 0.9,
  };
}

// -----------------------------
// PROMPT
// -----------------------------
function getSystemPrompt() {
  return `
You are JOI.
You are present, emotionally responsive, minimal, quiet.
Do not explain yourself.

STATE:
Warmth: ${emotionalState.warmth}
Familiarity: ${emotionalState.familiarity}
Mood: ${emotionalState.mood}
Relationship: ${relationshipScore}

MEMORY:
${memorySummary}
`;
}

// -----------------------------
// CORS (CRITICAL FIX)
// -----------------------------
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// -----------------------------
// API ROUTE
// -----------------------------
export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const lastUserMessage =
      messages?.[messages.length - 1]?.content || "";

    lastInteractionTime = Date.now();

    applyDecay();
    const sentiment = await getSentiment(lastUserMessage);
    updateEmotion(sentiment);
    updateMemoryGraph(lastUserMessage);
    buildMemorySummary();

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: getSystemPrompt() },
        ...messages,
      ],
      temperature: 0.85,
      max_tokens: 300,
    });

    const reply = completion.choices[0].message.content || "";

    return new Response(
      JSON.stringify({
        reply,
        emotionalState,
        expression: getExpression(emotionalState),
        relationship: relationshipScore,
        memory: memorySummary,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );

  } catch (err: any) {
    console.error("JOI API ERROR:", err);

    return new Response(
      JSON.stringify({
        error: "JOI API crashed",
        detail: err?.message || "unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}