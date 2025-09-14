import { NextResponse } from "next/server";
import type { LLMResponse } from "@/lib/types/llm";

type Level = "junior" | "mid" | "senior";

function makeExplanation(level: Level): string[] {
  if (level === "junior")
    return [
      "The function processes a list of items.",
      "It ignores empty values.",
      "It sums numbers and computes an average.",
      "It returns a sorted result.",
    ];
  if (level === "mid")
    return [
      "Normalizes keys and filters out null/undefined entries.",
      "Aggregates counts and numeric values per key.",
      "Computes sum, count, and average per normalized key.",
      "Returns an array sorted by total sum (descending).",
      "Basic input validation prevents runtime errors.",
    ];
  return [
    "Validates input type early to prevent runtime failures.",
    "Normalizes keys (trim + lower-case) to avoid duplicated categories.",
    "Skips entries without a key and non-numeric values; missing values default to 1.",
    "Uses an accumulator (map) to compute sum, count, and average in O(n).",
    "Returns a sorted array of results (O(k log k), k = number of unique keys).",
    "Potential risks: unbounded input size, no value limits, risk of large-number overflow.",
    "Optimizations: use Map instead of plain object; extract normalization helper.",
    "Unit tests should cover edge cases and invalid data types.",
  ];
}

function makeAnnotated(code: string, level: Level): string {
  const lines = code.split("\n");
  const density = level === "junior" ? 0.25 : level === "mid" ? 0.5 : 1.0;

  const annotated = lines
    .map((line) => {
      const trimmed = line.trim();
      let comment = "";

      if (/function\s+/.test(line) || /^\s*const\s+\w+\s*=\s*\(/.test(line)) {
        comment = "Function declaration / arrow function";
      } else if (/for\s*\(|while\s*\(/.test(line)) {
        comment = "Loop — iterating over items";
      } else if (/if\s*\(/.test(line)) {
        comment = "Conditional branch — filtering / logic";
      } else if (/return\b/.test(line)) {
        comment = "Function return";
      } else if (/import\b|require\(/.test(line)) {
        comment = "Import dependency";
      } else if (/map|reduce|filter/.test(line)) {
        comment = "Array operation (map/reduce/filter)";
      }

      const shouldComment = comment && Math.random() < density && trimmed.length > 0;
      return shouldComment ? `// ${comment}\n${line}` : line;
    })
    .join("\n");

  return annotated;
}

function makeRefactor(code: string, language: string, level: Level): string {
  const header =
    level === "senior"
      ? `// Refactor suggestions (${language}):\n// - Extract helper: normalizeKey\n// - Use Map for accumulation\n// - Validate inputs and throw TypeError\n// - Add unit tests for edge cases\n`
      : level === "mid"
      ? `// Refactor suggestions (${language}):\n// - Extract helper functions\n// - Add input validation\n// - Prefer const over let where possible\n`
      : `// Minor cleanup (${language}):\n// - Improve naming\n// - Early returns for invalid input\n`;

  return `${header}\n${code}`;
}

function makeAnalysis(level: Level) {
  const base = {
    bugs: ["Missing input validation can cause runtime exceptions."],
    complexity: ["Main pass: O(n); sorting results: O(k log k)."],
    tests: ["Empty input returns an empty array."],
  };

  if (level === "junior") {
    return {
      ...base,
      tests: [...base.tests, "Ignores null/undefined without throwing."],
    };
  }

  if (level === "mid") {
    return {
      bugs: [
        ...base.bugs,
        "Potential duplicate categories if keys are not normalized (case differences).",
      ],
      complexity: [
        ...base.complexity,
        "Key normalization: O(n) (constant per element).",
      ],
      tests: [
        ...base.tests,
        "Aggregates duplicates (e.g., A/a/A ).",
        "Computes average correctly with mixed values.",
      ],
    };
  }

  // senior
  return {
    bugs: [
      ...base.bugs,
      "Risk of big-number overflow with very large sums.",
      "Unbounded input may increase memory usage.",
    ],
    complexity: [
      ...base.complexity,
      "Space complexity: O(k) for unique keys.",
    ],
    tests: [
      ...base.tests,
      "Key normalization trims spaces and lowercases values.",
      "Mixed values: numbers vs missing values (default to 1).",
      "Invalid input type throws a TypeError.",
      "Large dataset does not time out.",
    ],
  };
}

export async function POST(req: Request) {
  try {
    const { code, language, level } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Missing 'code' string" }, { status: 400 });
    }
    const lvl: Level = level === "junior" || level === "senior" ? level : "mid";
    const lang = typeof language === "string" && language ? language : "unknown";

    const response: LLMResponse = {
      explanation: makeExplanation(lvl),
      annotated: makeAnnotated(code, lvl),
      refactor: makeRefactor(code, lang, lvl),
      analysis: makeAnalysis(lvl),
    };

    return NextResponse.json(response);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
