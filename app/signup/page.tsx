"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { User, Building2, Landmark, ArrowLeft, MailCheck } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { isValidEmail, checkPasswordStrength } from "@/lib/validation";
import { toUserMessage } from "@/lib/errorMessages";
import AuthIllustration from "@/components/AuthIllustration";
import PasswordInput from "@/components/PasswordInput";

type AccountType = "individual" | "business" | "institution";

const ACCOUNT_TYPES: { type: AccountType; icon: any; title: string; desc: string }[] = [
  { type: "individual", icon: User, title: "Particulier", desc: "Signer et vérifier des documents personnels." },
  { type: "business", icon: Building2, title: "Entreprise", desc: "Signature au nom de votre société." },
  { type: "institution", icon: Landmark, title: "Institution / Administration", desc: "Publication de documents officiels." },
];

const SECTOR_OPTIONS = ["Banque & Finance", "Télécommunications", "Éducation", "Santé", "Commerce", "Autre"];
const INSTITUTION_TYPE_OPTIONS = ["Ministère", "Mairie / Collectivité", "Université / École", "Agence publique", "Autre"];

export default function SignUpPage() {
  const [step, setStep] = useState<"type" | "form" | "check-email">("type");
  const [accountType, setAccountType] = useState<AccountType>("individual");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationSector, setOrganizationSector] = useState(SECTOR_OPTIONS[0]);
  const [institutionType, setInstitutionType] = useState(INSTITUTION_TYPE_OPTIONS[0]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const passwordCheck = useMemo(() => checkPasswordStrength(password), [password]);
  const emailValid = useMemo(() => isValidEmail(email), [email]);
  const isOrg = accountType === "business" || accountType === "institution";

  const fieldErrors = {
    fullName: submitted && fullName.trim().length < 2 ? "Ce champ est requis." : undefined,
    organizationName: submitted && isOrg && organizationName.trim().length < 2 ? "Le nom est requis." : undefined,
    email: submitted && !email ? "L'email est requis." : submitted && !emailValid ? "Format d'email invalide." : undefined,
    password: submitted && !password ? "Le mot de passe est requis." : submitted && !passwordCheck.valid ? "Mot de passe trop faible." : undefined,
    confirmPassword:
      submitted && !confirmPassword
        ? "Confirme ton mot de passe."
        : submitted && password !== confirmPassword
        ? "Les mots de passe ne correspondent pas."
        : undefined,
  };

  const formValid =
    (isOrg ? organizationName.trim().length >= 2 : fullName.trim().length >= 2) &&
    emailValid &&
    passwordCheck.valid &&
    password === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setError(null);
    if (!formValid) return;

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/complete-profile`,
          data: {
            full_name: fullName.trim(),
            account_type: accountType,
            organization_name: isOrg ? organizationName.trim() : null,
            organization_sector:
              accountType === "business" ? organizationSector : accountType === "institution" ? institutionType : null,
          },
        },
      });
      if (authError) throw authError;

      setStep("check-email");
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) clearInterval(interval);
          return s - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error("ERREUR BRUTE SIGNUP:", err)
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    try {
      await supabase.auth.resend({ type: "signup", email });
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((s) => {
          if (s <= 1) clearInterval(interval);
          return s - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(toUserMessage(err));
    }
  }

  return (
    <main className="min-h-screen flex">
      <AuthIllustration />

      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-white">
        {step === "type" && (
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-bold text-navy mb-1">Quel type de compte ?</h1>
            <p className="text-muted text-sm mb-6">Ce choix détermine les informations demandées ensuite.</p>
            <div className="flex flex-col gap-3">
              {ACCOUNT_TYPES.map(({ type, icon: Icon, title, desc }) => (
                <button
                  key={type}
                  onClick={() => { setAccountType(type); setStep("form"); }}
                  className="flex items-start gap-4 border border-border rounded-xl p-4 text-left hover:border-accent hover:bg-accent/5 transition-colors"
                >
                  <div className="bg-accent/10 w-11 h-11 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="text-accent" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy">{title}</p>
                    <p className="text-sm text-muted">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted text-center mt-6">
              Déjà un compte ?{" "}
              <Link href="/login" className="text-accent font-medium hover:underline">Se connecter</Link>
            </p>
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmit} noValidate className="w-full max-w-md flex flex-col gap-5">
            <div>
              <button type="button" onClick={() => setStep("type")} className="flex items-center gap-1.5 text-muted text-sm hover:text-navy mb-3">
                <ArrowLeft size={14} /> Changer de type de compte
              </button>
              <h1 className="text-2xl font-bold text-navy">
                {accountType === "individual" && "Créer ton identité Tosign"}
                {accountType === "business" && "Enregistrer votre entreprise"}
                {accountType === "institution" && "Enregistrer votre institution"}
              </h1>
              <p className="text-muted text-sm mt-1">Signature cryptographique de documents officiels.</p>
            </div>

            {isOrg ? (
              <Field label={accountType === "business" ? "Nom de l'entreprise" : "Nom de l'institution"} error={fieldErrors.organizationName}>
                <input value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} className="input" placeholder="Nelmark SARL" />
              </Field>
            ) : (
              <Field label="Nom complet" error={fieldErrors.fullName}>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Michel Ondoa" />
              </Field>
            )}

            {accountType === "business" && (
              <Field label="Secteur d'activité">
                <select value={organizationSector} onChange={(e) => setOrganizationSector(e.target.value)} className="input">
                  {SECTOR_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            )}

            {accountType === "institution" && (
              <Field label="Type d'institution">
                <select value={institutionType} onChange={(e) => setInstitutionType(e.target.value)} className="input">
                  {INSTITUTION_TYPE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            )}

            {isOrg && (
              <Field label="Nom du responsable" error={fieldErrors.fullName}>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Michel Ondoa" />
              </Field>
            )}

            <Field label={isOrg ? "Email professionnel" : "Email"} error={fieldErrors.email}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="michel@administration.cm" />
            </Field>

            <Field label="Mot de passe" error={fieldErrors.password}>
              <PasswordInput value={password} onChange={setPassword} placeholder="••••••••••" autoComplete="new-password" />
              {password.length > 0 && !fieldErrors.password && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-border rounded-full overflow-hidden flex gap-0.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`flex-1 rounded-full ${i < passwordCheck.score ? (passwordCheck.score <= 1 ? "bg-red-500" : passwordCheck.score <= 2 ? "bg-orange-400" : "bg-green-500") : "bg-transparent"}`} />
                    ))}
                  </div>
                  {passwordCheck.issues.length > 0 && <p className="text-xs text-muted mt-1.5">Manque : {passwordCheck.issues.join(", ")}</p>}
                </div>
              )}
            </Field>

            <Field label="Confirmer le mot de passe" error={fieldErrors.confirmPassword}>
              <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••••" autoComplete="new-password" />
            </Field>
            {submitted && !formValid && !error && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                Vérifie les champs signalés en rouge ci-dessus avant de continuer.
              </p>
)}
            {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}

            <button type="submit" disabled={loading} className="bg-navy text-white px-5 py-3 rounded-lg font-semibold hover:bg-navy-light transition-colors disabled:opacity-50 mt-1">
              {loading ? "Création en cours..." : "Continuer"}
            </button>
          </form>
        )}

        {step === "check-email" && (
          <div className="w-full max-w-md text-center">
            <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
              <MailCheck className="text-accent" size={28} />
            </div>
            <h1 className="text-2xl font-bold text-navy mb-2">Vérifie ta boîte mail</h1>
            <p className="text-muted">
              Un email de confirmation a été envoyé à <span className="font-semibold text-navy">{email}</span>.
              Clique sur le lien pour activer ton compte et finaliser ton identité Tosign.
            </p>
            <p className="text-muted text-sm mt-4">
              Pense à vérifier tes courriers indésirables (spam) si tu ne le vois pas sous quelques minutes.
            </p>

            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="mt-6 text-accent font-medium hover:underline disabled:text-muted disabled:no-underline disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Renvoyer l'email (${resendCooldown}s)` : "Renvoyer l'email"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-navy">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}