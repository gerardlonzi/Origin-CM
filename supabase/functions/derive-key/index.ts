import { argon2id } from "npm:hash-wasm@4.11.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const { secretPhrase, saltHex } = await req.json();

    if (!secretPhrase || typeof secretPhrase !== "string" || secretPhrase.length < 8) {
      return new Response(
        JSON.stringify({ error: "Phrase secrète invalide (minimum 8 caractères)" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }
    if (!saltHex || typeof saltHex !== "string") {
      return new Response(JSON.stringify({ error: "Salt manquant" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Paramètres Argon2id recommandés (OWASP) pour un usage interactif
    const derivedKeyHex = await argon2id({
      password: secretPhrase,
      salt: hexToBytes(saltHex),
      parallelism: 1,
      iterations: 2,
      memorySize: 19456, // ~19 MB
      hashLength: 32,
      outputType: "hex",
    });

    return new Response(JSON.stringify({ derivedKeyHex }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Erreur de dérivation de clé" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return bytes;
}