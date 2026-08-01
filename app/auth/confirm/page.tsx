"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { toUserMessage } from "@/lib/errorMessages";

function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as "signup" | "recovery" | null;
  const next = searchParams.get("next") ?? "/dashboard";

  useEffect(() => {
    // Si une session valide existe déjà (ex: retour en arrière après un token
    // déjà consommé), on ne montre pas d'erreur — on redirige directement.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace(next);
      } else {
        setChecking(false);
      }
    });
  }, [router, next]);

  async function handleConfirm() {
    if (!token_hash || !type) {
      setError("Lien invalide ou incomplet.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({ type, token_hash });
      if (verifyError) throw verifyError;
      router.push(next);
      router.refresh();
    } catch (err: any) {
      // Le token a peut-être déjà été consommé — on vérifie s'il existe
      // malgré tout une session active avant d'afficher une vraie erreur.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push(next);
        router.refresh();
        return;
      }
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (checking) return <div className="text-muted">Vérification...</div>;

  if (!token_hash || !type) {
    return (
      <div className="text-center">
        <p className="text-red-600 font-semibold">Ce lien de confirmation est invalide ou incomplet.</p>
        <p className="text-muted text-sm mt-2">Demande un nouveau lien depuis la page de connexion.</p>
      </div>
    );
  }

  return (
    <div className="text-center max-w-sm">
      <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldCheck className="text-accent" size={28} />
      </div>
      <h1 className="text-2xl font-bold text-navy mb-2">
        {type === "recovery" ? "Réinitialiser mon mot de passe" : "Confirmer mon compte"}
      </h1>
      <p className="text-muted mb-6">Clique sur le bouton ci-dessous pour finaliser cette action.</p>

      {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{error}</p>}

      <button
        onClick={handleConfirm}
        disabled={loading}
        className="bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-light transition-colors disabled:opacity-50"
      >
        {loading ? "Confirmation..." : type === "recovery" ? "Continuer" : "Confirmer mon email"}
      </button>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <Suspense fallback={<div className="text-muted">Chargement...</div>}>
        <ConfirmForm />
      </Suspense>
    </main>
  );
}