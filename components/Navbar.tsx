"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, UserCircle, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar({ userName }: { userName?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-16 border-b border-border dark:border-white/10 bg-white dark:bg-[#0A0F0D] flex items-center justify-end px-6 transition-colors">
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button className="text-muted hover:text-navy dark:hover:text-white transition-colors">
          <Bell size={20} />
        </button>
        <div className="relative">
          <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 text-navy dark:text-white text-sm font-medium">
            <UserCircle size={22} />
            {userName ?? "Mon compte"}
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#0F1714] border border-border dark:border-white/10 rounded-lg shadow-lg overflow-hidden z-10">
              <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-600 hover:bg-bg-soft dark:hover:bg-white/5">
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}