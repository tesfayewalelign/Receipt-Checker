"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — fail silently.
    }
  };

  return (
    <div className="relative rounded-xl bg-gray-900 border border-gray-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
        <span className="text-xs font-medium text-gray-400">
          {language ?? "code"}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-300 hover:text-white transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
        <code className="text-gray-100 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}
