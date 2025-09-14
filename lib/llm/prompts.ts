export function buildPrompt(code: string, language: string) {
  return `
Return STRICT JSON with the following keys exactly:
{
  "explanation": string[],            // max 8 bullets
  "annotated_b64": string,            // base64-encoded UTF-8 full annotated code
  "refactor_b64": string,             // base64-encoded UTF-8 refactored code
  "analysis": {
    "bugs": string[],
    "complexity": string[],
    "tests": string[]
  }
}

Rules:
- Output MUST be valid JSON ONLY. No markdown fences, no extra text.
- Encode any multi-line code as base64 into *_b64 fields.
- Keep explanations concise and concrete.

Language: ${language}

Code to analyze (between <code> tags):
<code>
${code}
</code>
`;
}
