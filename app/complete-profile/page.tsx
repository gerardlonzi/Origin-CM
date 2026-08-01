"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { generateKeyPair, bytesToHex } from "@/lib/crypto";
import { encryptPrivateKey } from "@/lib/keyVault";
import { checkSecretPhrase } from "@/lib/validation";
import { toUserMessage } from "@/lib/errorMessages";
import PasswordInput from "@/components/PasswordInput";

interface PendingProfile {
  fullName: string;
  accountType: "individual" | "business" | "institution";
  organizationName: string | null;
  organizationSector: string | null;
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [pending, setPending] = useState<PendingProfile | null>(null);
  const [secretPhrase, setSecretPhrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const phraseCheck = useMemo(() => checkSecretPhrase(secretPhrase), [secretPhrase]);

  useEffect(() => {
    (async () => {
              // getSession() lit la session locale directement, sans aller-retour
              // réseau — plus fiable juste après un verifyOtp() que getUser().
              let { data: { session } } = await supabase.auth.getSession();
        
              // Si rien trouvé immédiatement, un court re-essai avant de conclure
              // à une vraie absence de session (évite la race condition).
              if (!session) {
                await new Promise((r) => setTimeout(r, 400));
                const retry = await supabase.auth.getSession();
                session = retry.data.session;
              }
        
              if (!session) {
                router.replace("/login");
                return;
              }
              const user = session.user;

      const { data: existingProfile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
      if (existingProfile) {
        router.replace("/dashboard");
        return;
      }

      const metadata = user.user_metadata ?? {};
      setPending({
        fullName: metadata.full_name ?? "",
        accountType: metadata.account_type ?? "individual",
        organizationName: metadata.organization_name ?? null,
        organizationSector: metadata.organization_sector ?? null,
      });
      setChecking(false);

    })();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError(null);
    if (!phraseCheck.valid || !pending) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expirée, reconnecte-toi.");

      const { privateKey, publicKey } = await generateKeyPair();
      const saltBytes = crypto.getRandomValues(new Uint8Array(16));
      const saltHex = bytesToHex(saltBytes);
      const encrypted = await encryptPrivateKey(privateKey, secretPhrase, saltHex);

      const publicKeyHex = bytesToHex(publicKey);
      const originId = "ORG-" + publicKeyHex.slice(0, 8).toUpperCase();
      const fingerprint = publicKeyHex.slice(0, 12).toUpperCase().match(/.{1,2}/g)!.join(":");

      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        origin_id: originId,
        full_name: pending.fullName || user.email!.split("@")[0],
        account_type: pending.accountType,
        organization_name: pending.organizationName,
        organization_sector: pending.organizationSector,
        public_key_hex: publicKeyHex,
        encrypted_private_key_hex: encrypted.ciphertextHex,
        private_key_nonce_hex: encrypted.nonceHex,
        key_salt_hex: saltHex,
        fingerprint,
      });
      if (profileError) throw profileError;

      sessionStorage.removeItem("origin_pending_profile");
      router.push("/dashboard");
    } catch (err: any) {
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return <main className="min-h-screen flex items-center justify-center bg-white text-muted">Vérification...</main>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
      <form onSubmit={handleSubmit} noValidate className="w-full max-w-md flex flex-col gap-5">
        <div className="text-center">
          <div className="bg-accent/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-accent" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-navy">Dernière étape</h1>
          <p className="text-muted text-sm mt-1">Email confirmé ✓ — il ne reste qu'à sécuriser ta clé privée.</p>
        </div>

        {!pending?.fullName && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-navy">Nom complet</span>
            <input
              className="input"
              value={pending?.fullName ?? ""}
              onChange={(e) => setPending((p) => (p ? { ...p, fullName: e.target.value } : p))}
              placeholder="Michel Ondoa"
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-navy">Secret Origin</span>
          <PasswordInput value={secretPhrase} onChange={setSecretPhrase} placeholder="Mon premier ordinateur était un Dell en 2015" />
          {submitted && !phraseCheck.valid && <span className="text-xs text-red-600">{phraseCheck.reason}</span>}
          <span className="text-xs text-muted">Une phrase que toi seul connais — protège ta clé privée. Jamais stockée en clair.</span>
        </label>

        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" disabled={loading} className="bg-navy text-white px-5 py-3 rounded-lg font-semibold hover:bg-navy-light transition-colors disabled:opacity-50">
          {loading ? "Génération de ton identité..." : "Finaliser mon compte"}
        </button>
      </form>
    </main>
  );
}