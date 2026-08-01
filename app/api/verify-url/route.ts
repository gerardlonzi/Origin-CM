import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashDocument, verifySignature } from "@/lib/crypto";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8000;

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  const validation = validateUrl(url);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "manual",
      headers: { "User-Agent": "ToSignLens/1.0" },
    });
    clearTimeout(timeout);

    if (response.status >= 300 && response.status < 400) {
      return NextResponse.json({ error: "Les redirections ne sont pas autorisées." }, { status: 400 });
    }
    if (!response.ok) {
      return NextResponse.json({ error: "Impossible de récupérer ce fichier." }, { status: 400 });
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 20 Mo)." }, { status: 400 });
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Fichier trop volumineux (max 20 Mo)." }, { status: 400 });
    }

    const hash = hashDocument(new Uint8Array(buffer));
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: doc } = await supabase
      .from("documents")
      .select("signature_hex, signed_at, profiles(full_name, public_key_hex)")
      .eq("document_hash_hex", hash)
      .maybeSingle();

    if (!doc) {
      await supabase.from("security_log").insert({ event_type: "verification_unknown", metadata: { hash, source: "url" } });
      return NextResponse.json({ status: "unknown", hash });
    }

    const signer = (doc as any).profiles;
    const isValid = await verifySignature(hash, doc.signature_hex, signer.public_key_hex);

    if (isValid) {
      await supabase.from("security_log").insert({ event_type: "verification", metadata: { hash, source: "url" } });
      return NextResponse.json({
        status: "authentic",
        signer: signer.full_name,
        date: new Date(doc.signed_at).toLocaleDateString("fr-FR"),
        hash,
      });
    }
    await supabase.from("security_log").insert({ event_type: "verification_invalid", metadata: { hash, source: "url" } });
    return NextResponse.json({ status: "invalid", hash });
  } catch (err: any) {
    if (err.name === "AbortError") {
      return NextResponse.json({ error: "Le fichier a mis trop de temps à répondre." }, { status: 408 });
    }
    return NextResponse.json({ error: "Erreur lors de la récupération du fichier." }, { status: 500 });
  }
}

function validateUrl(raw: string): { ok: true } | { ok: false; reason: string } {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { ok: false, reason: "URL invalide." };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, reason: "Seuls les liens http/https sont acceptés." };
  }
  const hostname = parsed.hostname.toLowerCase();
  const blockedHosts = ["localhost", "127.0.0.1", "0.0.0.0", "::1"];
  if (blockedHosts.includes(hostname)) {
    return { ok: false, reason: "Cette adresse n'est pas autorisée." };
  }
  const privatePatterns = [/^10\./, /^172\.(1[6-9]|2\d|3[0-1])\./, /^192\.168\./, /^169\.254\./];
  if (privatePatterns.some((p) => p.test(hostname))) {
    return { ok: false, reason: "Cette adresse n'est pas autorisée." };
  }
  return { ok: true };
}