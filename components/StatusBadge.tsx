type Status = "authentic" | "invalid" | "unknown";

const STATUS_MAP: Record<Status, { label: string; className: string }> = {
  authentic: { label: "✓ Authentique", className: "bg-origin-green/10 text-origin-green" },
  invalid: { label: "✗ Modifié", className: "bg-origin-red/10 text-origin-red" },
  unknown: { label: "? Inconnu", className: "bg-origin-orange/10 text-origin-orange" },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { label, className } = STATUS_MAP[status];
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}>{label}</span>;
}
