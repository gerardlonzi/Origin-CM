"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, XCircle, HelpCircle } from "lucide-react";
import CopyableValue from "@/components/CopyableValue";

interface HistoryEntry {
  id: string;
  event_type: string;
  metadata: { hash?: string; file_name?: string; source?: string };
  created_at: string;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; desc: string }> = {
  verification: {
    icon: <ShieldCheck size={20} />,
    label: "Document authentique",
    color: "text-green-600 bg-green-50 border-green-200",
    desc: "Ce document était intact et correctement signé au moment de la vérification.",
  },
  verification_invalid: {
    icon: <XCircle size={20} />,
    label: "Signature invalide",
    color: "text-red-600 bg-red-50 border-red-200",
    desc: "Ce document avait été modifié après sa signature d'origine.",
  },
  verification_unknown: {
    icon: <HelpCircle size={20} />,
    label: "Origine inconnue",
    color: "text-gold bg-yellow-50 border-yellow-200",
    desc: "Ce document n'existait pas dans le registre ToSign au moment de la vérification.",
  },
};

export default function HistoryDetailModal({ entry, onClose }: { entry: HistoryEntry | null; onClose: () => void }) {
  const config = entry ? STATUS_CONFIG[entry.event_type] : null;

  return (
    <AnimatePresence>
      {entry && config && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="bg-white dark:bg-[#0F1714] border border-border dark:border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-start justify-between mb-4">
                <div className={`flex items-center gap-2 border rounded-full px-3 py-1.5 text-sm font-semibold ${config.color}`}>
                  {config.icon} {config.label}
                </div>
                <button onClick={onClose} className="text-muted hover:text-navy dark:hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <p className="text-navy dark:text-white/90 text-sm mb-5">{config.desc}</p>

              <div className="flex flex-col gap-3">
                <Row label="Fichier" value={entry.metadata?.file_name ?? "Vérification par lien"} />
                <Row
                  label="Date"
                  value={`${new Date(entry.created_at).toLocaleDateString("fr-FR")} à ${new Date(entry.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`}
                />
                {entry.metadata?.hash && <CopyableValue label="Empreinte SHA-256" value={entry.metadata.hash} />}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="text-navy dark:text-white/90 font-medium">{value}</span>
    </div>
  );
}