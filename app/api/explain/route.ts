import { NextResponse } from "next/server";
import type { LLMResponse } from "@/lib/types/llm";
import { detectLanguage, type Lang } from "@/lib/detect/language";

type Level = "junior" | "mid" | "senior";

function commentPrefixFor(lang: Lang) {
  return lang === "python" ? "#" : "//";
}

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

function makeAnnotated(code: string, level: Level, lang: Lang): string {
  const lines = code.split("\n");
  const density = level === "junior" ? 0.25 : level === "mid" ? 0.5 : 0.9;
  const prefix = commentPrefixFor(lang);

  const annotated = lines
    .map((line) => {
      const trimmed = line.trim();
      let comment = "";

      if (/\bfunction\s+/.test(line) || /^\s*const\s+\w+\s*=\s*\(/.test(line)) {
        comment = "Function declaration / arrow function";
      }
      if (lang === "python" && /^\s*def\s+\w+\s*\(/.test(line)) {
        comment = "Function definition";
      }
      if (/\bfor\s*\(|\bwhile\s*\(/.test(line) || (lang === "python" && /^\s*(for|while)\b/.test(trimmed))) {
        comment = "Loop — iterating over items";
      }
      if (/\bif\s*\(/.test(line) || (lang === "python" && /^\s*if\b/.test(trimmed))) {
        comment = "Conditional branch — filtering / logic";
      }
      if (/\breturn\b/.test(line) || (lang === "python" && /^\s*return\b/.test(trimmed))) {
        comment = "Function return";
      }
      if (/\bimport\b/.test(line) || /require\(/.test(line)) {
        comment = "Import dependency";
      }
      if (/(map|reduce|filter)\s*\(/.test(line)) {
        comment = "Array operation (map/reduce/filter)";
      }

      const shouldComment = comment && Math.random() < density && trimmed.length > 0;
      return shouldComment ? `${prefix} ${comment}\n${line}` : line;
    })
    .join("\n");

  return annotated;
}

function makeRefactor(code: string, language: string, level: Level, lang: Lang): string {
  const base =
    lang === "python"
      ? [
          `Use helper functions (e.g., normalize_key).`,
          `Prefer dictionaries/collections.Counter for accumulation.`,
          `Type-check inputs and raise TypeError for invalid data.`,
        ]
      : [
          `Extract helper functions (e.g., normalizeKey).`,
          `Use Map for accumulation where appropriate.`,
          `Validate inputs and throw TypeError on invalid data.`,
        ];

  const extras =
    level === "senior"
      ? [`Add unit tests for edge cases.`, `Consider streaming/iterators for large inputs.`]
      : level === "mid"
      ? [`Prefer const over let where possible.`]
      : [`Keep naming consistent and add early returns.`];

  const prefix = commentPrefixFor(lang);
  const header = `${prefix} Refactor suggestions (${language || lang}):\n${[...base, ...extras]
    .map((s) => `${prefix} - ${s}`)
    .join("\n")}\n`;

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
      complexity: [...base.complexity, "Key normalization: O(n) (constant per element)."],
      tests: [...base.tests, "Aggregates duplicates (e.g., A/a/A ).", "Computes average correctly with mixed values."],
    };
  }

  return {
    bugs: [
      ...base.bugs,
      "Risk of big-number overflow with very large sums.",
      "Unbounded input may increase memory usage.",
    ],
    complexity: [...base.complexity, "Space complexity: O(k) for unique keys."],
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

    let effectiveLang: Lang;
    if (!language || language === "auto") {
      effectiveLang = detectLanguage(code);
    } else {
      const l = language.toLowerCase();
      if (["python", "typescript", "javascript", "java", "cpp", "c", "go"].includes(l)) {
        effectiveLang = l as Lang;
      } else {
        effectiveLang = detectLanguage(code);
      }
    }

    const response: LLMResponse & { detectedLanguage: Lang } = {
      explanation: makeExplanation(lvl),
      annotated: makeAnnotated(code, lvl, effectiveLang),
      refactor: makeRefactor(code, language, lvl, effectiveLang),
      analysis: makeAnalysis(lvl),
      detectedLanguage: effectiveLang,
    };

    return NextResponse.json(response);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
