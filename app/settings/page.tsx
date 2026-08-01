import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, origin_id")
    .eq("id", user?.id)
    .maybeSingle();

  return (
    <AppShell userName={profile?.full_name}>
      <h1 className="text-2xl font-bold text-white mb-6">Paramètres</h1>

      <div className="flex flex-col gap-4 max-w-2xl">
        <Card>
          <h2 className="text-white font-semibold mb-1">Profil</h2>
          <p className="text-origin-muted text-sm">Nom, email, informations de compte.</p>
        </Card>
        <Card>
          <h2 className="text-white font-semibold mb-1">Mot de passe</h2>
          <p className="text-origin-muted text-sm">Modifier ton mot de passe de connexion.</p>
        </Card>
        <Card>
          <h2 className="text-white font-semibold mb-1">Notifications</h2>
          <p className="text-origin-muted text-sm">Alertes de connexion, nouvel appareil, signature.</p>
        </Card>
        <Card>
          <h2 className="text-white font-semibold mb-1">Sécurité</h2>
          <p className="text-origin-muted text-sm">
            2FA, appareils connus, journal de sécurité complet.
          </p>
        </Card>
        <Card>
          <h2 className="text-white font-semibold mb-1">API Keys</h2>
          <p className="text-origin-muted text-sm">
            Pour intégrer la vérification Origin dans vos propres systèmes.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
