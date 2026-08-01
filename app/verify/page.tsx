"use client";

import { useEffect, useState, useCallback } from "react";
import { ShieldCheck, XCircle, HelpCircle, History } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import AppShell from "@/components/AppShell";
import VerifyTool from "@/components/VerifyTool";
import HistoryDetailModal from "@/components/HistoryDetailModal";

interface HistoryEntry {
  id: string;
  event_type: string;
  metadata: { hash?: string; file_name?: string; source?: string };
  created_at: string;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  verification: { icon: <ShieldCheck size={15} />, label: "Authentique", color: "text-green-600 bg-green-50" },
  verification_invalid: { icon: <XCircle size={15} />, label: "Modifié", color: "text-red-600 bg-red-50" },
  verification_unknown: { icon: <HelpCircle size={15} />, label: "Inconnu", color: "text-gold bg-yellow-50" },
};

export default function PrivateVerifyPage() {
  const [fullName, setFullName] = useState<string>();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [selected, setSelected] = useState<HistoryEntry | null>(null);

  const loadHistory = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();
    setFullName(profile?.full_name);

    const { data } = await supabase
      .from("security_log")
      .select("id, event_type, metadata, created_at")
      .eq("user_id", user.id)
      .in("event_type", ["verification", "verification_invalid", "verification_unknown"])
      .order("created_at", { ascending: false })
      .limit(30);

    setHistory((data as any) ?? []);
    setLoadingHistory(false);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <AppShell userName={fullName}>
      {/* Halo décoratif */}
      <div className="pointer-events-none absolute top-0 right-0 w-96 h-96 bg-accent/10 dark:bg-accent/20 rounded-full blur-[100px] -z-10" />

      <h1 className="text-2xl font-bold text-navy dark:text-white mb-1">Vérifications</h1>
      <p className="text-muted text-sm mb-6">
        Vérifie l'authenticité de tes documents et retrouve l'historique de tes analyses passées.
      </p>

      <div className="bg-white dark:bg-[#0F1714] border border-border dark:border-white/10 rounded-xl p-6 mb-6 shadow-sm dark:shadow-[0_0_40px_-15px_rgba(0,122,94,0.4)]">
        <VerifyTool onVerified={loadHistory} />
      </div>

      <div className="bg-white dark:bg-[#0F1714] border border-border dark:border-white/10 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border dark:border-white/10 bg-bg-soft dark:bg-white/5">
          <History size={16} className="text-muted" />
          <h2 className="text-navy dark:text-white font-semibold text-sm">Historique de mes vérifications</h2>
        </div>

        <table className="w-full text-sm">
          <tbody>
            {loadingHistory &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-border dark:border-white/10 last:border-0">
                  <td className="px-5 py-4"><div className="h-4 bg-bg-soft dark:bg-white/10 rounded animate-pulse" /></td>
                </tr>
              ))}

            {!loadingHistory &&
              history.map((entry) => {
                const config = STATUS_CONFIG[entry.event_type];
                return (
                  <tr
                    key={entry.id}
                    onClick={() => setSelected(entry)}
                    className="border-b border-border dark:border-white/10 last:border-0 hover:bg-bg-soft dark:hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 text-navy dark:text-white/90 font-medium">{entry.metadata?.file_name ?? "Vérification par lien"}</td>
                    <td className="px-5 py-3.5">
                      <span className={`flex items-center gap-1.5 w-fit text-xs font-semibold px-2.5 py-1 rounded-full ${config?.color}`}>
                        {config?.icon} {config?.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-muted font-mono text-xs">{entry.metadata?.hash?.slice(0, 16)}...</td>
                    <td className="px-5 py-3.5 text-muted text-right">
                      {new Date(entry.created_at).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                );
              })}

            {!loadingHistory && history.length === 0 && (
              <tr>
                <td className="px-5 py-12 text-center text-muted text-sm">
                  Aucune vérification effectuée pour l'instant. Utilise l'outil ci-dessus pour commencer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <HistoryDetailModal entry={selected} onClose={() => setSelected(null)} />
    </AppShell>
  );
}