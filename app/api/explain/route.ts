import { NextResponse } from "next/server";
import type { LLMResponse } from "@/lib/types/llm";

type Level = "junior" | "mid" | "senior";

function makeExplanation(level: Level): string[] {
  if (level === "junior")
    return [
      "Funkcja przetwarza listę elementów.",
      "Ignoruje puste wartości.",
      "Sumuje liczby i liczy średnią.",
      "Zwraca wynik w posortowanej formie."
    ];
  if (level === "mid")
    return [
      "Normalizuje klucze i filtruje wartości null/undefined.",
      "Agreguje liczności i wartości liczbowe.",
      "Oblicza sumę, liczbę wystąpień oraz średnią na klucz.",
      "Zwraca tablicę obiektów posortowaną malejąco po sumie.",
      "Zabezpiecza się przed nieprawidłowym typem wejścia (w przykładzie)."
    ];
  return [
    "Waliduje typ wejścia i wczesnym zwrotem unika błędów wykonania.",
    "Normalizuje klucze (trim + lower-case), co zapobiega dublowaniu kategorii.",
    "Ignoruje wpisy bez klucza oraz wartości nienumeryczne; brakujące wartości traktuje jako 1.",
    "Używa akumulatora (mapy) do obliczania sumy, liczby wystąpień i średniej w O(n).",
    "Zwraca posortowaną tablicę wyników (O(k log k), k – liczba unikalnych kluczy).",
    "Potencjalne ryzyka: brak limitu rozmiaru wejścia, brak ograniczeń wartości, brak obsługi bardzo dużych liczb.",
    "Możliwe optymalizacje: Map zamiast plain object, wyciągnięcie normalizacji do funkcji pomocniczej.",
    "Testy jednostkowe powinny pokrywać przypadki brzegowe oraz błędne typy danych."
  ];
}

function makeAnnotated(code: string, level: Level): string {
  const lines = code.split("\n");
  // gęstość komentarzy zależna od poziomu
  const density = level === "junior" ? 0.25 : level === "mid" ? 0.5 : 1.0;

  const annotated = lines
    .map((line, idx) => {
      const trimmed = line.trim();
      let comment = "";

      // Proste heurystyki komentarzy (dla efektu WOW)
      if (/function\s+/.test(line) || /^\s*const\s+\w+\s*=\s*\(/.test(line)) {
        comment = "Deklaracja funkcji / funkcji strzałkowej";
      } else if (/for\s*\(|while\s*\(/.test(line)) {
        comment = "Pętla — iteracja po elementach";
      } else if (/if\s*\(/.test(line)) {
        comment = "Warunek — filtracja/gałęzie logiki";
      } else if (/return\b/.test(line)) {
        comment = "Zwracanie wyniku funkcji";
      } else if (/import\b|require\(/.test(line)) {
        comment = "Import zależności";
      } else if (/map|reduce|filter/.test(line)) {
        comment = "Operacja tablicowa (map/reduce/filter)";
      }

      const shouldComment =
        comment && Math.random() < density && trimmed.length > 0; // prosta losowa gęstość

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
      : `// Minor cleanup (${language}):\n// - Naming improvements\n// - Early returns for invalid input\n`;

  return `${header}\n${code}`;
}

function makeAnalysis(level: Level) {
  const base = {
    bugs: ["Brak walidacji wejścia może skutkować wyjątkiem w czasie wykonania."],
    complexity: ["Główna ścieżka: O(n); sortowanie wyników: O(k log k)."],
    tests: ["Puste wejście zwraca pustą tablicę."],
  };

  if (level === "junior") {
    base.tests.push("Ignoruje null/undefined bez błędu.");
    return base;
  }

  if (level === "mid") {
    return {
      bugs: [
        ...base.bugs,
        "Możliwa nadpisana kategoria przy różnej wielkości liter, jeśli brak normalizacji.",
      ],
      complexity: [
        ...base.complexity,
        "Normalizacja kluczy: O(n) – stały koszt per element.",
      ],
      tests: [
        ...base.tests,
        "Agreguje duplikaty (A/a/A ).",
        "Poprawnie liczy średnią przy mieszanych wartościach.",
      ],
    };
  }

  return {
    bugs: [
      ...base.bugs,
      "Ryzyko przepełnienia liczb przy bardzo dużych sumach.",
      "Brak limitów rozmiaru wejścia (możliwy wzrost pamięci).",
    ],
    complexity: [
      ...base.complexity,
      "Złożoność pamięciowa: O(k) dla liczby unikalnych kluczy.",
    ],
    tests: [
      ...base.tests,
      "Normalizacja kluczy usuwa spacje i ustala lower-case.",
      "Mieszane wartości: liczby vs brak liczby (domyślnie 1).",
      "Błędny typ wejścia rzuca TypeError.",
      "Duży zestaw danych nie powoduje timeoutu.",
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
