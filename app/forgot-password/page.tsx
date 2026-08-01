"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { isValidEmail } from "@/lib/validation";
import { toUserMessage } from "@/lib/errorMessages";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Format d'email invalide.");
      return;
    }

    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/confirm?type=recovery&next=/reset-password`,
      });
      if (resetError) throw resetError;
      setSent(true);
    } catch (err: any) {
      // Ne jamais révéler si l'email existe ou non — évite l'énumération de comptes
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm">
        {!sent ? (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl font-bold text-navy mb-1">Mot de passe oublié</h1>
              <p className="text-muted text-sm">
                Entre ton email, on t'envoie un lien pour créer un nouveau mot de passe.
              </p>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-navy">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="michel@administration.cm"
              />
            </label>

            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="bg-navy text-white px-5 py-3 rounded-lg font-semibold hover:bg-navy-light transition-colors disabled:opacity-50"
            >
              {loading ? "Envoi..." : "Envoyer le lien"}
            </button>

            <Link href="/login" className="flex items-center justify-center gap-1.5 text-sm text-muted hover:text-navy">
              <ArrowLeft size={14} /> Retour à la connexion
            </Link>
          </form>
        ) : (
          <div className="text-center">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <MailCheck className="text-accent" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-navy mb-2">Vérifie ta boîte mail</h1>
            <p className="text-muted">
              Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.
            </p>
            <Link href="/login" className="inline-block mt-6 text-accent font-medium hover:underline">
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}