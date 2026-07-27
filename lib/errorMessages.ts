/**
 * Traduit les erreurs techniques (Postgres, Supabase Auth) en messages
 * compréhensibles. Aucune erreur brute ne doit atteindre l'utilisateur —
 * ça expose des détails d'implémentation utiles à un attaquant.
 */
export function toUserMessage(err: unknown): string {
    const raw = (err instanceof Error ? err.message : String(err)).toLowerCase();
  
    if (raw.includes("row-level security")) {
      return "Impossible de créer le compte pour le moment. Réessaie dans un instant ou contacte le support.";
    }
  
    // Couvre "already registered", "already been registered", "user already exists", etc.
    if (raw.includes("already") && (raw.includes("regist") || raw.includes("exist"))) {
      return "cet email existe déjà. Essaie plutôt de te connecter.";
    }
  
    if (raw.includes("duplicate key")) {
      return "Un compte existe déjà avec cet email.";
    }
    if (raw.includes("invalid login credentials")) {
      return "Email ou mot de passe incorrect.";
    }
    if (raw.includes("password should be") || raw.includes("password is too short")) {
      return "Le mot de passe ne respecte pas les critères de sécurité.";
    }
    if (raw.includes("email not confirmed")) {
      return "Confirme d'abord ton adresse email avant de te connecter.";
    }
    if (raw.includes("network") || raw.includes("fetch")) {
      return "Problème de connexion. Vérifie ta connexion internet et réessaie.";
    }
    if (raw.includes("rate limit") || raw.includes("too many requests")) {
      return "Trop de tentatives. Patiente quelques instants avant de réessayer.";
    }
  
    // Fallback générique — jamais le message brut
    return "Une erreur est survenue. Réessaie ou contacte le support si le problème persiste.";
  }