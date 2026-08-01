"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, FileText, ArrowUpDown, Download, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import AppShell from "@/components/AppShell";

interface DocumentRow {
  id: string;
  origin_doc_id: string;
  file_name: string | null;
  signed_at: string;
  profiles: { full_name: string } | null;
}

type SortKey = "signed_at" | "file_name" | "profiles";
type SortDir = "asc" | "desc";

export default function DocumentsPage() {
  const [fullName, setFullName] = useState<string>();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState<"all" | "7d" | "30d">("all");
  const [sortKey, setSortKey] = useState<SortKey>("signed_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user?.id).maybeSingle();
      setFullName(profile?.full_name);

      const { data } = await supabase
        .from("documents")
        .select("id, origin_doc_id, file_name, signed_at, profiles(full_name)")
        .order("signed_at", { ascending: false })
        .limit(200);
      setDocuments((data as any) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    let result = [...documents];

    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (d) =>
          d.file_name?.toLowerCase().includes(q) ||
          d.origin_doc_id.toLowerCase().includes(q) ||
          d.profiles?.full_name?.toLowerCase().includes(q)
      );
    }

    if (period !== "all") {
      const days = period === "7d" ? 7 : 30;
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      result = result.filter((d) => new Date(d.signed_at).getTime() >= cutoff);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "signed_at") cmp = new Date(a.signed_at).getTime() - new Date(b.signed_at).getTime();
      if (sortKey === "file_name") cmp = (a.file_name ?? "").localeCompare(b.file_name ?? "");
      if (sortKey === "profiles") cmp = (a.profiles?.full_name ?? "").localeCompare(b.profiles?.full_name ?? "");
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [documents, query, period, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function exportCsv() {
    const rows = [
      ["Nom", "Auteur", "Origin ID", "Date"],
      ...filtered.map((d) => [d.file_name ?? "Sans nom", d.profiles?.full_name ?? "—", d.origin_doc_id, new Date(d.signed_at).toLocaleDateString("fr-FR")]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "documents-tosign.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <AppShell userName={fullName}>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h1 className="text-2xl font-bold text-navy">Documents</h1>
          <p className="text-muted text-sm mt-1">
            Registre des documents signés numériquement, consultable et vérifiable à tout moment.
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 bg-white border border-border text-navy text-sm font-semibold px-4 py-2.5 rounded-lg hover:border-accent transition-colors disabled:opacity-40"
        >
          <Download size={16} /> Exporter (CSV)
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="flex flex-wrap items-center gap-3 mt-6 mb-4">
        <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 flex-1 min-w-[240px]">
          <Search size={16} className="text-muted shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, auteur ou Origin ID..."
            className="bg-transparent outline-none text-sm text-navy placeholder:text-muted w-full py-2.5"
          />
        </div>

        <div className="flex items-center gap-1 bg-white border border-border rounded-lg p-1">
          {[
            { key: "all", label: "Tout" },
            { key: "7d", label: "7 jours" },
            { key: "30d", label: "30 jours" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key as typeof period)}
              className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                period === opt.key ? "bg-accent text-white" : "text-muted hover:text-navy"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted mb-3">
        {loading ? "Chargement..." : `${filtered.length} document${filtered.length !== 1 ? "s" : ""} trouvé${filtered.length !== 1 ? "s" : ""}`}
      </p>

      {/* Tableau */}
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-border bg-bg-soft">
              <SortableHeader label="Nom" sortKey="file_name" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <SortableHeader label="Auteur" sortKey="profiles" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
              <th className="px-5 py-3 font-medium">Origin ID</th>
              <th className="px-5 py-3 font-medium">Statut</th>
              <SortableHeader label="Date" sortKey="signed_at" activeKey={sortKey} dir={sortDir} onSort={toggleSort} />
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td colSpan={5} className="px-5 py-4">
                    <div className="h-4 bg-bg-soft rounded animate-pulse" />
                  </td>
                </tr>
              ))}

            {!loading &&
              filtered.map((doc) => (
                <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-bg-soft transition-colors">
                  <td className="px-5 py-3.5 text-navy font-medium">
                    <Link href={`/documents/${doc.id}`} className="hover:text-accent flex items-center gap-2">
                      <FileText size={15} className="text-muted shrink-0" />
                      {doc.file_name ?? "Sans nom"}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{doc.profiles?.full_name ?? "—"}</td>
                  <td className="px-5 py-3.5 text-muted font-mono text-xs">{doc.origin_doc_id}</td>
                  <td className="px-5 py-3.5">
                    <span className="bg-accent/10 text-accent text-xs font-semibold px-2.5 py-1 rounded-full">
                      ✓ Authentique
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted">{new Date(doc.signed_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="bg-bg-soft w-12 h-12 rounded-full flex items-center justify-center mb-1">
                      <SlidersHorizontal className="text-muted" size={20} />
                    </div>
                    <p className="text-navy font-medium">
                      {query || period !== "all" ? "Aucun résultat pour ces filtres" : "Aucun document signé pour le moment"}
                    </p>
                    <p className="text-muted text-sm max-w-sm">
                      {query || period !== "all"
                        ? "Essaie d'élargir ta recherche ou de changer la période sélectionnée."
                        : "Les documents que tu signes apparaîtront ici, avec leur empreinte cryptographique et leur historique de vérification."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const active = sortKey === activeKey;
  return (
    <th className="px-5 py-3 font-medium">
      <button onClick={() => onSort(sortKey)} className={`flex items-center gap-1.5 hover:text-navy transition-colors ${active ? "text-navy" : ""}`}>
        {label}
        <ArrowUpDown size={13} className={active ? "opacity-100" : "opacity-30"} />
      </button>
    </th>
  );
}