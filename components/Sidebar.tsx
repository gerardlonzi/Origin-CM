"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, ShieldCheck, Flame, Settings, User, ChevronLeft, ChevronRight } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/verify", label: "Vérifications", icon: ShieldCheck },
  { href: "/pulse", label: "Origin Pulse", icon: Flame },
  { href: "/settings", label: "Paramètres", icon: Settings },
  { href: "/profile", label: "Profil", icon: User },
];

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={`shrink-0 border-r border-border dark:border-white/10 bg-white dark:bg-[#0A0F0D] min-h-screen p-4 transition-all duration-200 relative ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className={`flex items-center gap-2 px-2 py-4 ${collapsed ? "justify-center" : ""}`}>
        <ShieldCheck
          className="text-navy dark:text-accent shrink-0"
          size={22}
          style={{ filter: "drop-shadow(0 0 8px rgba(0,122,94,0.5))" }}
        />
        {!collapsed && <span className="text-navy dark:text-white font-bold text-lg whitespace-nowrap">ToSign</span>}
      </div>

      <nav className="mt-4 flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-accent/10 dark:bg-accent/20 text-accent font-semibold shadow-[0_0_16px_-4px_rgba(0,122,94,0.5)]"
                  : "text-muted hover:bg-bg-soft dark:hover:bg-white/5 hover:text-navy dark:hover:text-white"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 bg-white dark:bg-[#0F1714] border border-border dark:border-white/10 rounded-full p-1 text-muted hover:text-accent hover:border-accent shadow-md transition-colors"
        title={collapsed ? "Déplier le menu" : "Replier le menu"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}