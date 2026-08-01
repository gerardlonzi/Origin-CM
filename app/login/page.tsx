"use client";
import PasswordInput from "@/components/PasswordInput";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { isValidEmail } from "@/lib/validation";
import AuthIllustration from "@/components/AuthIllustration";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

 function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");
  const [factorId, setFactorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const confirmError = searchParams.get("error");
    if (confirmError === "missing_token") {
      setError("Lien de confirmation invalide.");
    } else if (confirmError) {
      setError(`Confirmation échouée : ${confirmError}`);
    }
  }, [searchParams]);

  const fieldErrors = {
    email: submitted && !email ? "L'email est requis." : submitted && !isValidEmail(email) ? "Format d'email invalide." : undefined,
    password: submitted && !password ? "Le mot de passe est requis." : undefined,
  };

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    if (!email || !password || !isValidEmail(email)) return;

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const totpFactor = factorsData?.totp?.[0];

      if (totpFactor && totpFactor.status === "verified") {
        setFactorId(totpFactor.id);
        setStep("mfa");
      } else {
        await redirectAfterAuth();
      }
    } catch {
      setError("Email ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMfaSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setError(null);

    if (!/^\d{6}$/.test(otp)) {
      setError("Le code doit contenir 6 chiffres.");
      return;
    }

    setLoading(true);
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
      if (challengeError) throw challengeError;

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code: otp,
      });
      if (verifyError) throw verifyError;

      await redirectAfterAuth();
    } catch {
      setError("Code invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  }

  async function redirectAfterAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();

    if (!profile) {
      router.push("/complete-profile");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  return (
    <main className="min-h-screen flex">
      <AuthIllustration />

      <div className="flex-1 flex items-center justify-center px-4 bg-white">
        <div className="w-full max-w-md">
          <h1 className="text-2xl font-bold text-navy mb-1">Connexion</h1>
          <p className="text-muted text-sm mb-6">Accède à ton espace Tosign CM.</p>

          {step === "credentials" ? (
            <form onSubmit={handleCredentialsSubmit} noValidate className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-navy">Email professionnel</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="michel@administration.cm" autoComplete="email" />
                {fieldErrors.email && <span className="text-xs text-red-600">{fieldErrors.email}</span>}
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-navy">Mot de passe</span>
                <PasswordInput value={password} onChange={setPassword} placeholder="••••••••••" autoComplete="current-password" />
                {fieldErrors.password && <span className="text-xs text-red-600">{fieldErrors.password}</span>}
              </label>

              {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <Link href="/forgot-password" className="text-sm text-accent hover:underline self-end -mt-2">
  Mot de passe oublié ?
</Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-navy text-white px-5 py-3 rounded-lg font-semibold hover:bg-navy-light transition-colors disabled:opacity-50"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>

              <p className="text-sm text-muted text-center">
                Pas encore de compte ?{" "}
                <Link href="/signup" className="text-accent font-medium hover:underline">
                  Créer une identité Tosign
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleMfaSubmit} className="flex flex-col gap-4">
              <p className="text-sm text-muted">Saisis le code à 6 chiffres généré par ton application d'authentification.</p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="input text-center tracking-[0.5em] text-lg"
                placeholder="000000"
                autoFocus
              />
              {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="bg-navy text-white px-5 py-3 rounded-lg font-semibold hover:bg-navy-light transition-colors disabled:opacity-50"
              >
                {loading ? "Vérification..." : "Valider"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-white" />}>
      <LoginForm />
    </Suspense>
  );
}