export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  }
  
  export interface PasswordCheck {
    valid: boolean;
    score: 0 | 1 | 2 | 3 | 4;
    issues: string[];
  }
  
  export function checkPasswordStrength(password: string): PasswordCheck {
    const categories = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ];
    const categoriesMet = categories.filter(Boolean).length;
    const longEnough = password.length >= 8;
  
    const issues: string[] = [];
    if (!longEnough) issues.push("Au moins 8 caractères");
    if (categoriesMet < 3) issues.push("Mélange majuscules, minuscules, chiffres ou symboles");
  
    // Valide dès que la longueur est bonne ET au moins 3 des 4 catégories présentes
    // (pas besoin des 4 en même temps — trop strict en pratique)
    const valid = longEnough && categoriesMet >= 3;
  
    let score: 0 | 1 | 2 | 3 | 4 = 0;
    if (password.length > 0) {
      if (!longEnough) score = 1;
      else if (categoriesMet <= 1) score = 1;
      else if (categoriesMet === 2) score = 2;
      else if (categoriesMet === 3) score = 3;
      else score = 4;
    }
  
    return { valid, score, issues };
  }
  
  export interface SecretPhraseCheck {
    valid: boolean;
    reason?: string;
  }
  
  /**
   * Règle unique et simple : au moins 12 caractères. Au-delà, on ne bloque
   * plus sur le contenu — la longueur seule offre déjà une bonne résistance,
   * et sur-contraindre décourage l'utilisateur sans vrai gain de sécurité.
   */
  export function checkSecretPhrase(phrase: string): SecretPhraseCheck {
    const trimmed = phrase.trim();
    if (trimmed.length < 12) {
      return { valid: false, reason: "Au moins 12 caractères." };
    }
    return { valid: true };
  }