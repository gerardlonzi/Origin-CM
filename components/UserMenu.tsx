"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, UserCircle } from "lucide-react";

export default function UserMenu({ userName }: { userName?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-white text-sm font-medium"
      >
        <UserCircle size={22} />
        {userName ?? "Mon compte"}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-origin-panel border border-origin-border rounded-lg shadow-lg overflow-hidden z-10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-3 text-sm text-origin-red hover:bg-white/5"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
