const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL || "qwen2.5:3b";

export async function generateLLM(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      format: "json",          
      options: { temperature: 0.2, num_predict: 1024 },
      messages: [
        { role: "system", content: "Reply with STRICT JSON only. No markdown, no commentary." },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) throw new Error(`LLM error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data?.message?.content ?? "";
}
