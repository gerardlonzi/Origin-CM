import { LucideIcon } from "lucide-react";

const ACCENT_MAP = {
  blue: "text-accent bg-accent/10",
  green: "text-green-600 bg-green-50",
  orange: "text-orange-500 bg-orange-50",
  red: "text-red-600 bg-red-50",
};

export default function StatsCard({
  label,
  value,
  icon: Icon,
  accent = "blue",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: keyof typeof ACCENT_MAP;
}) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg ${ACCENT_MAP[accent]}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-navy">{value}</p>
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  );
}