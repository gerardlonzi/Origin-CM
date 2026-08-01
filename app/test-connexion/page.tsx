"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client"

export default function TestConnexionPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ error }) => {
        if (error) {
          setStatus("error");
          setMessage(error.message);
        } else {
          setStatus("ok");
          setMessage("Connexion à Supabase établie avec succès.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message ?? "Erreur inconnue");
      });
  }, []);

  return (
    <main className="min-h-screen bg-bg-app flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-bold text-navy">Test de connexion Supabase</h1>

      {status === "loading" && <p className="text-muted">Connexion en cours...</p>}
      {status === "ok" && <p className="text-green-600 font-semibold">✅ {message}</p>}
      {status === "error" && (
        <p className="text-red-600 font-semibold max-w-md text-center">❌ {message}</p>
      )}
    </main>
  );
}