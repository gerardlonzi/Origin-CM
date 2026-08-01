import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { Flame, MapPin } from "lucide-react";

// Données d'exemple pour la démo — à remplacer par une agrégation réelle
// (security_log filtré sur event_type='verification', group by ville)
// une fois le volume d'usage suffisant.
const CITY_TRENDS = [
  { city: "Douala", count: 153 },
  { city: "Yaoundé", count: 98 },
  { city: "Garoua", count: 21 },
];

const POPULAR_CONTENT = [
  { name: "Communiqué MINPOSTEL", verifications: 412 },
  { name: "Diplôme Université de Douala", verifications: 289 },
  { name: "Arrêté ministériel n°2026-014", verifications: 176 },
];

export default async function PulsePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user?.id).maybeSingle();

  return (
    <AppShell userName={profile?.full_name}>
      <div className="flex items-center gap-2 mb-6">
        <Flame className="text-origin-orange" size={22} />
        <h1 className="text-2xl font-bold text-white">Origin Pulse</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-white font-semibold mb-4">Tendances par ville</h2>
          <div className="flex flex-col gap-3">
            {CITY_TRENDS.map((c) => (
              <div key={c.city} className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white text-sm">
                  <MapPin size={14} className="text-origin-muted" />
                  {c.city}
                </div>
                <span className="text-origin-muted text-sm">{c.count} vérifications</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-white font-semibold mb-4">Contenus populaires</h2>
          <div className="flex flex-col gap-3">
            {POPULAR_CONTENT.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-white text-sm">{item.name}</span>
                <span className="text-origin-muted text-sm">{item.verifications}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
