"use client";
import Editor from "@monaco-editor/react";

type Props = {
  language: string;
  value: string;
  onChange: (v: string) => void;
};

export default function CodeEditor({ language, value, onChange }: Props) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        height="320px"
        language={language}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          wordWrap: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
