"use client";

export default function Alert({ message }: { message: string }) {
  return (
    <div className="px-4 py-2 rounded-md bg-red-100 text-red-800 border border-red-200 text-sm">
      ⚠️ {message}
    </div>
  );
}
