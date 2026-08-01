"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, FileCheck2, Search, Lock, Building2, GraduationCap, Landmark, Radio } from "lucide-react";
import HeroIllustration from "@/components/HeroIllustration";
import { DashboardGlyph, LensGlyph, OrbGlyph } from "@/components/ToolIllustration";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="border-b border-border sticky top-0 bg-white/90 backdrop-blur z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-navy" size={22} />
            <span className="font-bold text-navy text-lg">tosign CM</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="#outils" className="text-sm text-muted hover:text-navy transition-colors hidden sm:block">
              Nos outils
            </Link>
            <Link href="/verifications" className="text-sm text-muted hover:text-navy transition-colors">
              Vérifier un document
            </Link>
            <Link href="/login" className="text-sm text-muted hover:text-navy transition-colors">
              Connexion
            </Link>
            <Link href="/signup" className="bg-navy text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-navy-light transition-colors">
              Créer un compte
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <motion.div initial="hidden" animate="show" variants={fadeUp}>
          <span className="inline-block bg-accent/10 text-accent text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            Signature & vérification cryptographique
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-navy leading-tight">
            L'authenticité des documents officiels, prouvée en un instant.
          </h1>
          <p className="text-muted text-lg mt-6 max-w-lg">
            tosign permet aux administrations et entreprises de signer numériquement
            leurs documents, et à tout citoyen de vérifier gratuitement leur authenticité.
          </p>
          <div className="flex items-center gap-4 mt-9">
            <Link href="/signup" className="bg-navy text-white px-6 py-3 rounded-lg font-semibold hover:bg-navy-light transition-colors">
              Accéder à tosign CM
            </Link>
            <Link href="/verifications" className="bg-white text-navy border border-border px-6 py-3 rounded-lg font-semibold hover:border-navy transition-colors">
              Vérifier un document
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}>
          <HeroIllustration />
        </motion.div>
      </section>

      {/* Pourquoi tosign CM */}
      <section className="bg-bg-soft border-y border-border py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="text-center mb-14">
            <span className="text-accent text-xs font-semibold uppercase tracking-wide">Pourquoi tosign</span>
            <h2 className="text-3xl font-bold text-navy mt-2">Une confiance vérifiable, pas seulement promise</h2>
            <p className="text-muted mt-3 max-w-xl mx-auto">
              Contrairement à un simple tampon ou une signature scannée, chaque document tosign
              est mathématiquement lié à son auteur — impossible à falsifier sans être détecté.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: FileCheck2, title: "Signature numérique", desc: "Ed25519 + SHA-256 : chaque document reçoit une signature unique et infalsifiable." },
              { icon: Search, title: "Vérification publique", desc: "Tout citoyen peut vérifier gratuitement un document, sans créer de compte." },
              { icon: Lock, title: "Sécurité renforcée", desc: "Clé privée protégée par Argon2id, 2FA obligatoire, journal de sécurité complet." },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeUp}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-border rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="bg-accent/10 w-11 h-11 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="text-accent" size={22} />
                </div>
                <h3 className="text-navy font-semibold mb-2">{f.title}</h3>
                <p className="text-muted text-sm">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos outils */}
      <section id="outils" className="max-w-6xl mx-auto px-6 py-24">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} variants={fadeUp} className="text-center mb-14">
          <span className="text-accent text-xs font-semibold uppercase tracking-wide">Nos outils</span>
          <h2 className="text-3xl font-bold text-navy mt-2">Un écosystème complet, pensé pour chaque usage</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ToolCard glyph={<DashboardGlyph />} title="tosign CM" desc="La plateforme de gestion pour administrations et entreprises : signature, versions, publication officielle." />
          <ToolCard glyph={<LensGlyph />} title="tosign Lens" desc="Vérification instantanée de tout document — glisser-déposer, coller, ou via une URL." />
          <ToolCard glyph={<OrbGlyph />} title="tosign Orb" desc="Sur mobile, une bulle flottante vérifie ce que tu partages, sans jamais quitter ton app." />
        </div>
      </section>

      {/* Bandeau institutions */}
      <section className="bg-navy py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-white/60 text-sm uppercase tracking-wide font-semibold mb-8">
            Conçu pour les institutions et entreprises
          </p>
          <div className="flex items-center justify-center gap-10 text-white/70 flex-wrap">
            <span className="flex items-center gap-2"><Landmark size={18} /> Administration</span>
            <span className="flex items-center gap-2"><GraduationCap size={18} /> Éducation</span>
            <span className="flex items-center gap-2"><Building2 size={18} /> Secteur bancaire</span>
            <span className="flex items-center gap-2"><Radio size={18} /> Télécoms</span>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function ToolCard({ glyph, title, desc }: { glyph: React.ReactNode; title: string; desc: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
      className="border border-border rounded-xl p-6 hover:border-accent/40 hover:shadow-md transition-all"
    >
      {glyph}
      <h3 className="text-navy font-semibold mt-4 mb-2">{title}</h3>
      <p className="text-muted text-sm">{desc}</p>
    </motion.div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="text-navy" size={20} />
            <span className="font-bold text-navy">tosign</span>
          </div>
          <p className="text-muted text-sm">Signature et vérification cryptographique de documents officiels.</p>
        </div>

        <div>
          <h4 className="text-navy font-semibold text-sm mb-3">Produit</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            <li><Link href="/verifications" className="hover:text-navy">tosign Lens</Link></li>
            <li><Link href="/login" className="hover:text-navy">tosign CM</Link></li>
            <li><Link href="#outils" className="hover:text-navy">tosign Orb</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-navy font-semibold text-sm mb-3">Ressources</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            <li><Link href="#" className="hover:text-navy">Documentation</Link></li>
            <li><Link href="#" className="hover:text-navy">Sécurité</Link></li>
            <li><Link href="#" className="hover:text-navy">API</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-navy font-semibold text-sm mb-3">tosign</h4>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            <li><Link href="#" className="hover:text-navy">À propos</Link></li>
            <li><Link href="#" className="hover:text-navy">Contact</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-muted">
          © 2026 tosign — Plateforme de signature et vérification cryptographique
        </div>
      </div>
    </footer>
  );
}