"use client";
import { useState } from "react";
import { Wand2, Check, AlertTriangle } from "lucide-react";
import prettier from "prettier/standalone";
import babel from "prettier/plugins/babel";
import estree from "prettier/plugins/estree";
import typescript from "prettier/plugins/typescript";

export default function FormatButton({
  code,
  language,
  onFormatted,
}: {
  code: string;
  language: string;
  onFormatted: (newCode: string) => void;
}) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");
  const [hint, setHint] = useState<string | null>(null);

  async function onClick() {
    setHint(null);
    setState("idle");

    const lang = (language || "").toLowerCase();
    if (lang !== "javascript" && lang !== "typescript") {
      setHint("Formatting is available for JS/TS only.");
      setState("err");
      return;
    }

    try {
      const parser = lang === "typescript" ? "typescript" : "babel";
      const formatted = await prettier.format(code, {
        parser,
        plugins: [babel as any, estree as any, typescript as any],
        semi: true,
        singleQuote: false,
        tabWidth: 2,
        trailingComma: "es5",
        bracketSpacing: true,
      });
      onFormatted(formatted.trimEnd());
      setState("ok");
    } catch (e: any) {
      setHint(e?.message ?? "Formatting failed.");
      setState("err");
    } finally {
      setTimeout(() => setState("idle"), 1600);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onClick}
        className="px-3 py-2 border rounded-md flex items-center gap-2 text-sm"
        title="Format code with Prettier (JS/TS)"
      >
        <Wand2 className="h-4 w-4" />
        Format
      </button>
      {state === "ok" && (
        <span className="flex items-center gap-1 text-xs text-green-600">
          <Check className="h-3.5 w-3.5" /> Formatted
        </span>
      )}
      {state === "err" && (
        <span className="flex items-center gap-1 text-xs text-red-600">
          <AlertTriangle className="h-3.5 w-3.5" /> {hint}
        </span>
      )}
    </div>
  );
}
