"use client";
import { DiffEditor } from "@monaco-editor/react";

export default function DiffView({
  original,
  modified,
  language,
}: {
  original: string;
  modified: string;
  language: string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <h2 className="text-xl font-semibold">Diff (Original vs Refactor)</h2>
      </div>
      <DiffEditor
        original={original}
        modified={modified}
        language={language}
        height="420px"
        options={{
          readOnly: true,
          renderSideBySide: true,
          wordWrap: "off",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}
