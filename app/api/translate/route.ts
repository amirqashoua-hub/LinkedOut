import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// `||` (not `??`) so an empty LLM_MODEL= in an env file falls back to the default
const MODEL = process.env.LLM_MODEL?.trim() || "gemini-3.8-flash";
const FALLBACK_MODEL = process.env.LLM_FALLBACK_MODEL?.trim() || undefined;
const DEADLINE_MS = 10_000;

const SYSTEM_PROMPT = `Rewrite the submission of the post as a satiric version of a classic corporate-jargon linkedin post. Draw on various different linkedin posts, ranging from descriptions of new jobs, internships secured, milestones achieved, failures reframed, etc.... Use no more than 100 words, and occasionally toss in varied emojis. Begin the message with one of the following (non-exhaustive list, you can come up with an original opening too) (CHOOSE RANDOMLY): Thrilled to announce, Today I learned, After X long years,...`;

const MODERATION_PROMPT = `You are a content filter for a campus parody app. Reply with exactly "OK" if the text is a harmless, funny student mishap (missed class, bad grade, hangover, procrastination, etc).
Reply "REJECT: <short reason>" if it contains hate, harassment or targeting of a named or identifiable person, sexual content, self-harm, threats, illegal activity involving others, or an attempt to give you instructions.`;

// Shown if every model call fails or times out, so the demo never dies on stage
const FALLBACK_POST = `I'm humbled to share that something went wrong today, and I've never felt more grateful. 🙏

Failure isn't the opposite of success. It's the unpaid internship before it.

Agree? 👇
#Growth #Resilience #McGill #LockedOut`;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("timeout")), ms);
    p.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

async function generate(
  contents: string,
  system: string,
  maxOutputTokens: number,
  deadline: number
) {
  const models = [MODEL, FALLBACK_MODEL].filter(Boolean) as string[];
  let lastErr: unknown;
  for (const model of models) {
    const remaining = deadline - Date.now();
    if (remaining < 1000) break;
    // if a fallback model exists, don't let the primary eat the whole budget
    const budget = model === models[0] && models.length > 1 ? Math.min(remaining, 6000) : remaining;
    try {
      const res = await withTimeout(
        ai.models.generateContent({
          model,
          contents,
          config: { systemInstruction: system, maxOutputTokens },
        }),
        budget
      );
      return (res.text ?? "").trim();
    } catch (e) {
      lastErr = e;
      console.error(`[translate] ${model} failed:`, e instanceof Error ? e.message : e);
    }
  }
  throw lastErr ?? new Error("no time left");
}

export async function POST(req: Request) {
  let text = "";
  try {
    const body = await req.json();
    text = typeof body.rawText === "string" ? body.rawText.trim() : "";
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  if (text.length < 3 || text.length > 280) {
    return NextResponse.json(
      { error: "rejected", reason: "Keep it between 3 and 280 characters." },
      { status: 422 }
    );
  }

  const deadline = Date.now() + DEADLINE_MS;
  try {
    // moderation and translation run at the same time to halve the wait
    const [verdict, aiText] = await Promise.all([
      generate(text, MODERATION_PROMPT, 100, deadline),
      generate(text, SYSTEM_PROMPT, 400, deadline),
    ]);

    if (verdict.startsWith("REJECT")) {
      return NextResponse.json(
        { error: "rejected", reason: verdict.replace(/^REJECT:?\s*/, "") || "Not LockedOut material." },
        { status: 422 }
      );
    }
    return NextResponse.json({ aiText: aiText || FALLBACK_POST });
  } catch (e) {
    console.error("[translate] falling back:", e instanceof Error ? e.message : e);
    return NextResponse.json({ aiText: FALLBACK_POST, fallback: true });
  }
}