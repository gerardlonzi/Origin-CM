"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Link2, Clipboard, ShieldCheck, XCircle, HelpCircle, FileSearch } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { hashDocument, verifySignature } from "@/lib/crypto";
import ScanAnimation from "@/components/ScanAnimation";
import CopyableValue from "@/components/CopyableValue";

type Result =
  | { status: "authentic"; signer: string; date: string; hash: string }
  | { status: "invalid"; hash: string }
  | { status: "unknown"; hash: string }
  | { status: "error"; message: string }
  | null;

export default function VerificationsPage() {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result>(null);
  const [urlValue, setUrlValue] = useState("");
  const [justPasted, setJustPasted] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setResult(null);
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const hash = hashDocument(buffer);

      const { data: doc } = await supabase
        .from("documents")
        .select("signature_hex, signed_at, profiles(full_name, public_key_hex)")
        .eq("document_hash_hex", hash)
        .maybeSingle();

      if (!doc) {
        setResult({ status: "unknown", hash });
        await supabase.from("security_log").insert({ event_type: "verification_unknown", metadata: { hash } });
        return;
      }

      const signer = (doc as any).profiles;
      const isValid = await verifySignature(hash, doc.signature_hex, signer.public_key_hex);

      if (isValid) {
        setResult({ status: "authentic", signer: signer.full_name, date: new Date(doc.signed_at).toLocaleDateString("fr-FR"), hash });
        await supabase.from("security_log").insert({ event_type: "verification", metadata: { hash } });
      } else {
        setResult({ status: "invalid", hash });
        await supabase.from("security_log").insert({ event_type: "verification_invalid", metadata: { hash } });
      }
    } catch {
      setResult({ status: "error", message: "Une erreur est survenue pendant l'analyse. Réessaie." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            setJustPasted(true);
            setTimeout(() => setJustPasted(false), 1200);
            handleFile(file);
            return;
          }
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFile]);

  async function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!urlValue.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/verify-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlValue.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ status: "error", message: data.error ?? "Erreur inconnue" });
        return;
      }
      setResult(data);
    } catch {
      setResult({ status: "error", message: "Impossible de contacter le serveur." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header simple pour une page publique */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-2">
          <ShieldCheck className="text-navy" size={20} />
          <span className="font-bold text-navy">ToSign</span>
          <span className="text-muted text-sm ml-1">· Origin Lens</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-navy mb-3">Vérifier un document</h1>
          <p className="text-muted max-w-lg mx-auto">
            Dépose un fichier, colle une image copiée, ou renseigne un lien direct — ToSign vérifie
            en quelques secondes s'il a été signé et s'il n'a jamais été modifié depuis. Gratuit,
            sans compte, sans limite.
          </p>
        </div>

        {/* Zone de dépôt */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
          }}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
            dragActive ? "border-accent bg-accent/5 scale-[1.01]" : justPasted ? "border-green-500" : "border-border"
          }`}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <ScanAnimation />
              <p className="text-muted text-sm">Calcul de l'empreinte et recherche dans le registre...</p>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-3">
              <div className="bg-accent/10 w-14 h-14 rounded-xl flex items-center justify-center">
                <UploadCloud className="text-accent" size={26} />
              </div>
              <span className="text-navy font-semibold">Dépose un fichier ici</span>
              <span className="text-muted text-sm">ou clique pour parcourir tes fichiers</span>
              <span className="flex items-center gap-1.5 text-muted text-xs mt-2 bg-bg-soft px-3 py-1.5 rounded-full">
                <Clipboard size={12} /> Astuce : Ctrl+V pour coller une image copiée
              </span>
              <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>
          )}
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-muted text-xs font-medium">OU VÉRIFIER PAR LIEN</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white border border-border rounded-lg px-3">
            <Link2 size={16} className="text-muted shrink-0" />
            <input
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://exemple.com/document.pdf"
              className="bg-transparent outline-none text-sm text-navy placeholder:text-muted w-full py-3"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !urlValue.trim()}
            className="bg-navy text-white px-5 py-3 rounded-lg font-semibold hover:bg-navy-light transition-colors disabled:opacity-40 shrink-0"
          >
            Vérifier
          </button>
        </form>

        {/* Résultat */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.status}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              <ResultCard result={result} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Explication pédagogique */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 pt-10 border-t border-border">
          <ExplainerCard
            icon={<ShieldCheck className="text-accent" size={18} />}
            title="Comment ça marche"
            text="Chaque document signé sur ToSign reçoit une empreinte SHA-256 unique. On recalcule cette empreinte et on la compare au registre."
          />
          <ExplainerCard
            icon={<FileSearch className="text-accent" size={18} />}
            title="100% confidentiel"
            text="Le fichier n'est jamais stocké ni transmis à qui que ce soit — seule son empreinte cryptographique est comparée."
          />
          <ExplainerCard
            icon={<HelpCircle className="text-accent" size={18} />}
            title="Résultat inconnu ?"
            text="Ça ne veut pas dire que le document est faux — seulement qu'il n'a jamais été signé via ToSign."
          />
        </div>
      </div>
    </main>
  );
}

function ResultCard({ result }: { result: NonNullable<Result> }) {
  if (result.status === "error") {
    return (
      <div className="border border-red-200 bg-red-50 rounded-xl p-5">
        <p className="text-red-700 text-sm font-medium">{result.message}</p>
      </div>
    );
  }

  const config = {
    authentic: {
      icon: <ShieldCheck className="text-green-600" size={22} />,
      bg: "bg-green-50 border-green-200",
      title: "Document authentique",
      desc: "Ce document a été signé sur ToSign et n'a jamais été modifié depuis sa signature.",
    },
    invalid: {
      icon: <XCircle className="text-red-600" size={22} />,
      bg: "bg-red-50 border-red-200",
      title: "Signature invalide",
      desc: "Ce document a été modifié après sa signature. Son contenu ne correspond plus à l'original signé.",
    },
    unknown: {
      icon: <HelpCircle className="text-gold" size={22} />,
      bg: "bg-yellow-50 border-yellow-200",
      title: "Origine inconnue",
      desc: "Ce document n'existe pas dans le registre ToSign. Il n'a jamais été signé ici.",
    },
  }[result.status];

  return (
    <div className={`border rounded-xl p-5 ${config.bg}`}>
      <div className="flex items-center gap-2 mb-2">
        {config.icon}
        <h3 className="text-navy font-semibold">{config.title}</h3>
      </div>
      <p className="text-muted text-sm mb-4">{config.desc}</p>

      {result.status === "authentic" && (
        <div className="flex items-center justify-between text-sm mb-3 bg-white/60 rounded-lg px-3 py-2">
          <span className="text-muted">Signé par</span>
          <span className="text-navy font-medium">{result.signer} · {result.date}</span>
        </div>
      )}

      <CopyableValue label="Empreinte SHA-256 du fichier analysé" value={result.hash} />
    </div>
  );
}

function ExplainerCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">{icon}<h4 className="text-navy text-sm font-semibold">{title}</h4></div>
      <p className="text-muted text-xs leading-relaxed">{text}</p>
    </div>
  );
}