"use client";
import { useMemo, useState } from "react";
import type { LLMResponse } from "@/lib/types/llm";
import CodeEditor from "@/components/CodeEditor";
import DiffView from "@/components/DiffView";
import Loader from "@/components/Loader";
import Alert from "@/components/Alert";
import DownloadMarkdown from "@/components/DownloadMarkdown";
import CopyButton from "@/components/CopyButton";
import dynamic from "next/dynamic";
const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), { ssr: false });

export default function Home() {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [level, setLevel] = useState<"junior" | "mid" | "senior">("mid");
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
        body: JSON.stringify({ code, language, level }),
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

  const explanationText = useMemo(
    () => (result ? result.explanation.map((x) => `- ${x}`).join("\n") : ""),
    [result]
  );

  const analysisText = useMemo(() => {
    if (!result) return "";
    const bugs = result.analysis.bugs.map((x) => `- ${x}`).join("\n");
    const complexity = result.analysis.complexity.map((x) => `- ${x}`).join("\n");
    const tests = result.analysis.tests.map((x) => `- ${x}`).join("\n");
    return `Potential Bugs:\n${bugs}\n\nComplexity:\n${complexity}\n\nTest Cases:\n${tests}\n`;
  }, [result]);

  return (
    <main className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">CodeXplanator 🦍</h1>
          <p className="text-muted-foreground">
            Instant Code Teacher — paste code, pick level, click Explain.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <label className="text-sm font-medium">Explanation level</label>
          <select
            className="border rounded-md p-2"
            value={level}
            onChange={(e) => setLevel(e.target.value as "junior" | "mid" | "senior")}
          >
            <option value="junior">Junior (short & simple)</option>
            <option value="mid">Mid (balanced)</option>
            <option value="senior">Senior (detailed)</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={onExplain}
            disabled={loading || code.trim().length === 0}
            className="px-4 py-2 rounded-md bg-black text-white disabled:opacity-50 w-full"
          >
            {loading ? "Explaining…" : "Explain code"}
          </button>
        </div>

        <div className="md:col-span-3 flex flex-col gap-2">
          <label className="text-sm font-medium">Code</label>
          <CodeEditor language={language} value={code} onChange={setCode} />
        </div>

        <div className="md:col-span-3 flex items-center gap-3">
          {loading && <Loader />}
          {error && <Alert message={error} />}
        </div>
      </section>

      {result && (
        <>
          <div className="flex items-center justify-between mt-8 mb-2">
            <h2 className="text-lg font-semibold">Result</h2>
            <div className="flex items-center gap-2">
              <DownloadMarkdown code={code} language={language} level={level} result={result} />
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">Explanation ({level})</h2>
                <CopyButton getText={() => explanationText} label="Copy" />
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {result.explanation.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">Annotated</h2>
                <CopyButton getText={() => result.annotated} label="Copy code" />
              </div>
              <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto text-sm">
                <code>{result.annotated}</code>
              </pre>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">Refactor</h2>
                <CopyButton getText={() => result.refactor} label="Copy code" />
              </div>
              <pre className="bg-gray-50 dark:bg-gray-900 p-3 rounded overflow-auto text-sm">
                <code>{result.refactor}</code>
              </pre>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold">Analysis</h2>
                <CopyButton getText={() => analysisText} label="Copy" />
              </div>

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

            <div className="md:col-span-2">
              <DiffView original={code} modified={result.refactor} language={language} />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
