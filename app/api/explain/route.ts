import { NextResponse } from "next/server";
import type { LLMResponse } from "@/lib/types/llm";

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Missing 'code' string" }, { status: 400 });
    }

    // MOCK odpowiedzi – do podmiany na lokalny LLM
    const demo: LLMResponse = {
      explanation: [
        "Parsuje dane wejściowe i tworzy mapę wyników.",
        "Filtruje puste wartości i normalizuje klucze.",
        "Agreguje wyniki w strukturę wyjściową.",
        "Zwraca rezultat zgodny z oczekiwanym interfejsem."
      ],
      annotated:
`// Normalizujemy klucze i pomijamy puste wartości
${code.split("\n").map(line => `//> ${line}`).join("\n")}`,
      refactor:
`${code}
// TODO: Refactor — wydziel funkcje pomocnicze, dodaj walidację wejścia.`,
      analysis: {
        bugs: ["Brak walidacji wejścia.", "Możliwy null/undefined na etapie agregacji."],
        complexity: ["Funkcja main: O(n) względem liczby elementów wejściowych."],
        tests: [
          "Zwraca pustą strukturę dla pustego wejścia.",
          "Ignoruje wartości null/undefined.",
          "Poprawnie normalizuje klucze (case-insensitive).",
          "Agreguje duplikaty.",
          "Zgłasza błąd dla nieprawidłowego typu wejścia."
        ]
      }
    };

    return NextResponse.json(demo);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal error" }, { status: 500 });
  }
}
