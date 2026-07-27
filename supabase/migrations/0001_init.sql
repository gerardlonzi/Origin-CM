-- Origin — Schéma initial

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  origin_id text unique not null,            -- ex: ORG-4F9A82CD
  full_name text not null,
  public_key_hex text not null,               -- clé publique Ed25519
  encrypted_private_key_hex text not null,    -- clé privée chiffrée (XChaCha20-Poly1305)
  private_key_nonce_hex text not null,
  key_salt_hex text not null,                 -- salt propre à l'utilisateur pour Argon2id
  fingerprint text not null,                  -- ex: 6A:F4:91:8C:22:AE
  created_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  origin_doc_id text unique not null,         -- ex: ORG-DOC-2026-000981
  document_hash_hex text unique not null,     -- SHA-256 du fichier
  signature_hex text not null,                -- signature Ed25519
  signer_id uuid not null references profiles(id),
  file_name text,
  signed_at timestamptz not null default now()
);

create table if not exists known_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  device_fingerprint text not null,
  platform text,
  created_at timestamptz not null default now(),
  unique (user_id, device_fingerprint)
);

alter table known_devices enable row level security;

create policy "Users manage their own devices"
  on known_devices for all using (auth.uid() = user_id);

create table if not exists security_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),          -- nullable : une vérification publique n'a pas d'utilisateur connecté
  event_type text not null,                   -- 'login' | 'new_device' | 'document_signed' | 'verification' | 'verification_invalid' | 'verification_unknown'
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Index de recherche rapide pour Origin Lens (vérification par hash)
create index if not exists idx_documents_hash on documents(document_hash_hex);

-- Row Level Security
alter table profiles enable row level security;
alter table documents enable row level security;
alter table security_log enable row level security;

create policy "Public keys are readable by everyone"
  on profiles for select using (true);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create policy "Signed documents are publicly verifiable"
  on documents for select using (true);

create policy "Users can sign as themselves"
  on documents for insert with check (auth.uid() = signer_id);

create policy "Users see their own security log"
  on security_log for select using (auth.uid() = user_id);

create policy "Authenticated users can read aggregate verification stats"
  on security_log for select
  to authenticated
  using (event_type in ('verification', 'verification_invalid', 'verification_unknown'));

create policy "Anyone can log a public verification event"
  on security_log for insert
  with check (event_type in ('verification', 'verification_invalid', 'verification_unknown'));

create policy "Users can log their own account events"
  on security_log for insert
  with check (auth.uid() = user_id);