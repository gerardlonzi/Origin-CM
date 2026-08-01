import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { ShieldCheck } from "lucide-react";

export default async function ProfilePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, origin_id, fingerprint, public_key_hex, created_at")
    .eq("id", user?.id)
    .maybeSingle();

  return (
    <AppShell userName={profile?.full_name}>
      <h1 className="text-2xl font-bold text-white mb-6">Profil</h1>

      <Card className="max-w-lg">
        <div className="flex items-center gap-2 mb-6">
          <ShieldCheck className="text-origin-green" size={20} />
          <span className="text-origin-green text-sm font-semibold">Identité vérifiée</span>
        </div>

        <div className="flex flex-col gap-3">
          <Row label="Nom" value={profile?.full_name} />
          <Row label="Origin ID" value={profile?.origin_id} mono />
          <Row label="Depuis" value={profile?.created_at ? new Date(profile.created_at).getFullYear().toString() : "—"} />
          <Row label="Fingerprint" value={profile?.fingerprint} mono />
          <Row label="Clé publique" value={profile?.public_key_hex} mono truncate />
        </div>
      </Card>
    </AppShell>
  );
}

function Row({ label, value, mono = false, truncate = false }: { label: string; value?: string; mono?: boolean; truncate?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-origin-border last:border-0">
      <span className="text-origin-muted text-sm">{label}</span>
      <span className={`text-white text-sm ${mono ? "font-mono" : ""} ${truncate ? "max-w-[220px] truncate" : ""}`}>
        {value ?? "—"}
      </span>
    </div>
  );
}
