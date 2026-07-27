import { xchacha20poly1305 } from "@noble/ciphers/chacha.js";
import { randomBytes } from "@noble/ciphers/utils.js";
import { supabase } from "./supabase/client";
import { bytesToHex, hexToBytes } from "./crypto";

export interface EncryptedPrivateKey {
  ciphertextHex: string;
  nonceHex: string;
}

async function deriveKeyFromSecretPhrase(secretPhrase: string, saltHex: string): Promise<Uint8Array> {
  const { data, error } = await supabase.functions.invoke("derive-key", {
    body: { secretPhrase, saltHex },
  });
  if (error || !data?.derivedKeyHex) {
    throw new Error("Échec de la dérivation de clé (Argon2id) — vérifie que l'Edge Function derive-key est bien déployée.");
  }
  return hexToBytes(data.derivedKeyHex);
}

export async function encryptPrivateKey(
  privateKey: Uint8Array,
  secretPhrase: string,
  userSaltHex: string
): Promise<EncryptedPrivateKey> {
  const derivedKey = await deriveKeyFromSecretPhrase(secretPhrase, userSaltHex);
  const nonce = randomBytes(24);
  const cipher = xchacha20poly1305(derivedKey, nonce);
  const ciphertext = cipher.encrypt(privateKey);
  return { ciphertextHex: bytesToHex(ciphertext), nonceHex: bytesToHex(nonce) };
}