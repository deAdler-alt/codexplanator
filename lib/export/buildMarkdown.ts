// lib/export/buildMarkdown.ts
import type { LLMResponse } from "@/lib/types/llm";

function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function buildMarkdown(opts: {
  code: string;
  language: string;
  level: "junior" | "mid" | "senior";
  result: LLMResponse;
}) {
  const { code, language, level, result } = opts;

  const explanation = result.explanation.map((x) => `- ${x}`).join("\n");
  const bugs = result.analysis.bugs.map((x) => `- ${x}`).join("\n");
  const complexity = result.analysis.complexity.map((x) => `- ${x}`).join("\n");
  const tests = result.analysis.tests.map((x) => `- ${x}`).join("\n");

  return `# CodeXplanator Report

**Generated:** ${nowStamp()}
**Language:** \`${language}\`
**Explanation level:** \`${level}\`

---

## 🔍 Explanation
${explanation}

---

## 📝 Annotated Code
\`\`\`${language}
${result.annotated}
\`\`\`

---

## 🔧 Refactor (Proposed)
\`\`\`${language}
${result.refactor}
\`\`\`

---

## 🧪 Analysis

### Potential Bugs
${bugs}

### Complexity
${complexity}

### Suggested Test Cases
${tests}

---

## 📄 Original Input
\`\`\`${language}
${code}
\`\`\`
`;
}
