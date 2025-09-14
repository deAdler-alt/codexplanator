import type { LLMResponse } from "@/lib/types/llm";

function b64decode(b64: string): string {
  try { return Buffer.from(b64, "base64").toString("utf-8"); } catch { return ""; }
}

function stripMarkdown(s: string) {
  return s.replace(/```json/gi, "").replace(/```/g, "").trim();
}

function extractFirstJsonObject(s: string): string | null {
  let i = s.indexOf("{");
  if (i === -1) return null;
  let depth = 0;
  for (; i < s.length; i++) {
    const ch = s[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return s.slice(s.indexOf("{"), i + 1);
    }
  }
  return null;
}

export function tryParseLLM(raw: string): LLMResponse | null {
  if (!raw) return null;
  let clean = stripMarkdown(raw);

  if (clean.startsWith('"')) {
    try { clean = JSON.parse(clean); } catch {}
  }

  const objText = extractFirstJsonObject(clean);
  if (!objText) return null;

  try {
    const data: any = JSON.parse(objText);

    const explanation: string[] = Array.isArray(data.explanation) ? data.explanation : [];
    let annotated = typeof data.annotated === "string" ? data.annotated : "";
    let refactor  = typeof data.refactor  === "string" ? data.refactor  : "";

    if (typeof data.annotated_b64 === "string") annotated = b64decode(data.annotated_b64);
    if (typeof data.refactor_b64  === "string") refactor  = b64decode(data.refactor_b64);

    const analysis = {
      bugs: Array.isArray(data?.analysis?.bugs) ? data.analysis.bugs : [],
      complexity: Array.isArray(data?.analysis?.complexity) ? data.analysis.complexity : [],
      tests: Array.isArray(data?.analysis?.tests) ? data.analysis.tests : [],
    };

    if (!explanation.length || !annotated || !refactor) return null;

    return { explanation, annotated, refactor, analysis };
  } catch {
    return null;
  }
}
