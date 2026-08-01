"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { checkPasswordStrength } from "@/lib/validation";
import { toUserMessage } from "@/lib/errorMessages";
import PasswordInput from "@/components/PasswordInput";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);

  const passwordCheck = useMemo(() => checkPasswordStrength(password), [password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError(null);

    if (!passwordCheck.valid) return;
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("id").eq("id", user?.id).maybeSingle();
      setDone(true);
      setTimeout(() => router.push(profile ? "/dashboard" : "/complete-profile"), 1500);
    } catch (err: any) {
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white px-4">
        <p className="text-navy font-semibold">Mot de passe mis à jour ✓ — redirection...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-sm flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy mb-1">Nouveau mot de passe</h1>
          <p className="text-muted text-sm">Choisis un mot de passe pour ton compte.</p>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-navy">Mot de passe</span>
          <PasswordInput value={password} onChange={setPassword} placeholder="••••••••••" autoComplete="new-password" />
          {password.length > 0 && (
            <div className="mt-1">
              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden flex gap-0.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className={`flex-1 rounded-full ${i < passwordCheck.score ? (passwordCheck.score <= 1 ? "bg-red-500" : passwordCheck.score <= 2 ? "bg-orange-400" : "bg-green-500") : "bg-transparent"}`} />
                ))}
              </div>
              {passwordCheck.issues.length > 0 && <p className="text-xs text-muted mt-1.5">Manque : {passwordCheck.issues.join(", ")}</p>}
            </div>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-navy">Confirmer le mot de passe</span>
          <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••••" autoComplete="new-password" />
        </label>

        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-navy text-white px-5 py-3 rounded-lg font-semibold hover:bg-navy-light transition-colors disabled:opacity-50"
        >
          {loading ? "Mise à jour..." : "Réinitialiser le mot de passe"}
        </button>
      </form>
    </main>
  );
}