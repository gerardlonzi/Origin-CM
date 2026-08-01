import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ShieldCheck, User, Building2, Calendar, Hash } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import CopyableValue from "@/components/CopyableValue";

export default async function DocumentDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user?.id).maybeSingle();

  const { data: doc } = await supabase
    .from("documents")
    .select("origin_doc_id, file_name, document_hash_hex, signature_hex, signed_at, profiles(full_name, origin_id, fingerprint, public_key_hex)")
    .eq("id", params.id)
    .maybeSingle();

  if (!doc) notFound();

  const signer = (doc as any).profiles;
  const signedDate = new Date(doc.signed_at);

  return (
    <AppShell userName={profile?.full_name}>
      <Link href="/documents" className="flex items-center gap-1.5 text-muted text-sm hover:text-navy mb-6 w-fit">
        <ArrowLeft size={14} /> Retour aux documents
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">{doc.file_name ?? "Document sans nom"}</h1>
          <p className="text-muted font-mono text-sm mt-1">{doc.origin_doc_id}</p>
        </div>
        <span className="flex items-center gap-1.5 bg-accent/10 text-accent text-sm font-semibold px-3 py-1.5 rounded-full shrink-0">
          <ShieldCheck size={15} /> Authentique
        </span>
      </div>

      <div className="bg-white border border-border rounded-xl p-5 mb-4">
        <p className="text-navy text-sm leading-relaxed">
          Ce document a été signé numériquement et son intégrité est vérifiable à tout moment.
          Toute modification, même mineure, invaliderait la signature ci-dessous. Le hash et la
          signature peuvent être partagés publiquement sans compromettre la sécurité du signataire.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-border rounded-xl p-5">
          <h2 className="text-navy font-semibold mb-4 flex items-center gap-2">
            <User size={16} className="text-muted" /> Signataire
          </h2>
          <InfoRow label="Nom" value={signer?.full_name} />
          <InfoRow label="Origin ID" value={signer?.origin_id} mono />
          <InfoRow label="Fingerprint" value={signer?.fingerprint} mono />
        </div>

        <div className="bg-white border border-border rounded-xl p-5">
          <h2 className="text-navy font-semibold mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-muted" /> Métadonnées
          </h2>
          <InfoRow label="Date de signature" value={signedDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} />
          <InfoRow label="Heure" value={signedDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} />
          <InfoRow label="Origin ID document" value={doc.origin_doc_id} mono />
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-5 mt-4">
        <h2 className="text-navy font-semibold mb-4 flex items-center gap-2">
          <Hash size={16} className="text-muted" /> Preuve cryptographique
        </h2>
        <div className="flex flex-col gap-3">
          <CopyableValue label="Empreinte SHA-256" value={doc.document_hash_hex} />
          <CopyableValue label="Signature Ed25519" value={doc.signature_hex} />
          <CopyableValue label="Clé publique du signataire" value={signer?.public_key_hex} />
        </div>
        <p className="text-xs text-muted mt-4">
          N'importe qui peut vérifier indépendamment ces valeurs à l'aide de la clé publique
          ci-dessus et de l'algorithme Ed25519, sans avoir besoin d'un compte ToSign.
        </p>
      </div>

      <div className="bg-white border border-border rounded-xl p-5 mt-4">
        <h2 className="text-navy font-semibold mb-3">Historique des versions</h2>
        <p className="text-muted text-sm">
          Ce document n'a qu'une seule version enregistrée à ce jour. Le suivi des révisions
          successives (v1, v2, v3...) sera disponible dans une prochaine mise à jour.
        </p>
      </div>
    </AppShell>
  );
}

function InfoRow({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-muted text-sm">{label}</span>
      <span className={`text-navy text-sm ${mono ? "font-mono" : ""}`}>{value ?? "—"}</span>
    </div>
  );
}