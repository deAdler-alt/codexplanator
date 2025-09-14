"use client";
import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="flex items-center gap-2 text-gray-600 animate-pulse">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Explaining code...</span>
    </div>
  );
}
