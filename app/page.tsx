"use client";
import { useState } from "react";
import type { LLMResponse } from "@/lib/types/llm";
import CodeEditor from "@/components/CodeEditor";
import DiffView from "@/components/DiffView";

export default function Home() {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LLMResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onExplain() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");
      setResult(data as LLMResponse);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">CodeXplanator 🦍</h1>
        <p className="text-muted-foreground">
          Instant Code Teacher — wklej kod, kliknij Explain.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Language</label>
          <select
            className="border rounded-md p-2"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="c">C</option>
            <option value="cpp">C++</option>
            <option value="go">Go</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Code</label>
          <CodeEditor
            language={language}
            value={code}
            onChange={setCode}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onExplain}
            disabled={loading || code.trim().length === 0}
            className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50"
          >
            {loading ? "Explaining…" : "Explain code"}
          </button>
          {error && <span className="text-red-600 text-sm">{error}</span>}
        </div>
      </section>

      {result && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Explanation</h2>
            <ul className="list-disc pl-5 space-y-1">
              {result.explanation.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <DiffView original={code} modified={result.refactor} language={language} />
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Annotated</h2>
            <pre className="bg-gray-50 p-3 rounded overflow-auto text-sm">
              <code>{result.annotated}</code>
            </pre>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Refactor</h2>
            <pre className="bg-gray-50 p-3 rounded overflow-auto text-sm">
              <code>{result.refactor}</code>
            </pre>
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Analysis</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium">Potential bugs</h3>
                <ul className="list-disc pl-5">
                  {result.analysis.bugs.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium">Complexity</h3>
                <ul className="list-disc pl-5">
                  {result.analysis.complexity.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium">Test cases</h3>
                <ul className="list-disc pl-5">
                  {result.analysis.tests.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
