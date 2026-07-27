"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyableValue({ label, value }: { label: string; value?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <p className="text-xs text-muted mb-1">{label}</p>
      <div className="flex items-center gap-2 bg-bg-soft border border-border rounded-lg px-3 py-2.5">
        <span className="font-mono text-xs text-navy truncate flex-1">{value ?? "—"}</span>
        {value && (
          <button onClick={handleCopy} className="text-muted hover:text-accent shrink-0" title="Copier">
            {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}