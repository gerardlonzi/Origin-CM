# Origin CM — Web

Plateforme professionnelle de signature et vérification cryptographique de
documents (Next.js 14, App Router, Supabase).

## Pages

| Route | Page | Accès |
|---|---|---|
| `/` | Accueil | public |
| `/login` | Connexion (+ 2FA) | public |
| `/dashboard` | Dashboard | privé |
| `/documents`, `/documents/[id]` | Documents | privé |
| `/verifications` | Origin Lens web | **public** (vérification citoyenne) |
| `/pulse` | Origin Pulse | privé |
| `/settings` | Paramètres | privé |
| `/profile` | Profil / Origin Identity Card | privé |

La protection des routes privées est gérée par `middleware.ts` (redirection
vers `/login` si non authentifié).

## Mise en route

```bash
npm install
cp .env.example .env.local
```

Renseigne dans `.env.local` les **mêmes** valeurs Supabase que le mobile —
web et mobile partagent le même backend/registre :

```
NEXT_PUBLIC_SUPABASE_URL=https://TON_PROJET.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TA_CLE_ANON
```

Si ce n'est pas déjà fait côté mobile, applique le schéma :

```bash
npx supabase link --project-ref TON_PROJECT_REF
npx supabase db push
npx supabase functions deploy derive-key
```

Lancer en local :

```bash
npm run dev
```

## Sécurité mise en place

- **Middleware d'authentification** sur toutes les routes privées
- **2FA (TOTP)** via l'API MFA native de Supabase — activable par utilisateur,
  à rendre obligatoire pour les comptes professionnels avant la mise en prod
- **Row Level Security** Postgres sur toutes les tables (`profiles`,
  `documents`, `security_log`, `known_devices`)
- **Headers de sécurité** (CSP, HSTS, X-Frame-Options...) dans `next.config.js`
- **Journal de sécurité public** pour les vérifications anonymes (alimente
  Dashboard et Origin Pulse), avec policy RLS dédiée limitant les types
  d'événements insérables sans authentification

## Ce qui reste à faire avant le concours

- [ ] Remplacer les données d'exemple d'Origin Pulse (villes, contenus
      populaires) par une vraie agrégation SQL sur `security_log`
- [ ] Rate limiting applicatif sur `/verifications` (éviter le spam du
      registre public — un simple compteur par IP suffit pour la démo)
- [ ] Rendre le 2FA obligatoire à la création de compte professionnel
- [ ] Page de gestion des versions de documents (v1, v2, v3...)
- [ ] Génération et gestion des API Keys (page Paramètres)
