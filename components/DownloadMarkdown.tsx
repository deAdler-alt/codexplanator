"use client";
import { buildMarkdown } from "@/lib/export/buildMarkdown";
import type { LLMResponse } from "@/lib/types/llm";
import { Download } from "lucide-react";

export default function DownloadMarkdown({
  code,
  language,
  level,
  result,
}: {
  code: string;
  language: string;
  level: "junior" | "mid" | "senior";
  result: LLMResponse;
}) {
  function onDownload() {
    const md = buildMarkdown({ code, language, level, result });
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const ts = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    a.href = url;
    a.download = `codexplanator-report-${ts}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={onDownload}
      className="px-3 py-2 border rounded-md flex items-center gap-2 text-sm"
      title="Download Markdown report"
    >
      <Download className="h-4 w-4" />
      Export .md
    </button>
  );
}
