import { createServerSupabase } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import StatsCard from "@/components/StatsCard";
import { FileText, ShieldCheck, AlertTriangle, Building2 } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user?.id)
    .maybeSingle();

  const [{ count: documentsCount }, { count: verificationsCount }, { count: fakeCount }] = await Promise.all([
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase.from("security_log").select("*", { count: "exact", head: true }).eq("event_type", "verification"),
    supabase.from("security_log").select("*", { count: "exact", head: true }).eq("event_type", "verification_invalid"),
  ]);

  const { data: recentActivity } = await supabase
    .from("security_log")
    .select("event_type, created_at")
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <AppShell userName={profile?.full_name}>
      <h1 className="text-2xl font-bold text-navy">Bonjour {profile?.full_name?.split(" ")[0] ?? ""} 👋</h1>
      <p className="text-muted mb-6">Bienvenue sur Tosign</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Documents" value={documentsCount ?? 0} icon={FileText} accent="blue" />
        <StatsCard label="Vérifications" value={verificationsCount ?? 0} icon={ShieldCheck} accent="green" />
        <StatsCard label="Fake News" value={fakeCount ?? 0} icon={AlertTriangle} accent="red" />
        <StatsCard label="Entreprises" value={0} icon={Building2} accent="orange" />
      </div>

      <div className="bg-white border border-border rounded-xl p-5">
        <h2 className="text-navy font-semibold mb-4">Activité récente</h2>
        <div className="flex flex-col divide-y divide-border">
          {(recentActivity ?? []).map((entry, i) => (
            <div key={i} className="py-3 flex items-center justify-between">
              <span className="text-navy text-sm">{activityLabel(entry.event_type)}</span>
              <span className="text-muted text-xs">
                {new Date(entry.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
          {(!recentActivity || recentActivity.length === 0) && (
            <p className="text-muted text-sm py-4">Aucune activité récente.</p>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function activityLabel(type: string): string {
  switch (type) {
    case "document_signed": return "Document signé";
    case "verification": return "Document vérifié";
    case "login": return "Connexion";
    case "new_device": return "Nouvel appareil détecté";
    default: return type;
  }
}