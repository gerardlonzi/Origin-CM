import * as ed from "@noble/ed25519";
import { sha512, sha256 } from "@noble/hashes/sha2.js";

ed.etc.sha512Sync = (...msgs) => sha512(ed.etc.concatBytes(...msgs));

export interface KeyPair {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}

/** Génère une nouvelle paire de clés Ed25519 — appelé une seule fois à l'inscription. */
export async function generateKeyPair(): Promise<KeyPair> {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKeyAsync(privateKey);
  return { privateKey, publicKey };
}

/** Empreinte SHA-256 d'un document. */
export function hashDocument(fileBytes: Uint8Array): string {
  return bytesToHex(sha256(fileBytes));
}

/** Signe l'empreinte d'un document avec la clé privée. */
export async function signDocumentHash(hashHex: string, privateKey: Uint8Array): Promise<string> {
  const signature = await ed.signAsync(hexToBytes(hashHex), privateKey);
  return bytesToHex(signature);
}

/** Vérifie une signature Ed25519. */
export async function verifySignature(
  hashHex: string,
  signatureHex: string,
  publicKeyHex: string
): Promise<boolean> {
  try {
    return await ed.verifyAsync(hexToBytes(signatureHex), hexToBytes(hashHex), hexToBytes(publicKeyHex));
  } catch {
    return false;
  }
}