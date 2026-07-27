"use client";

import { motion } from "framer-motion";

export default function HeroIllustration() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-6 -left-6 w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20"
      />
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -bottom-8 -right-4 w-28 h-28 rounded-full bg-navy/5 border border-navy/10"
      />

      <svg viewBox="0 0 400 420" className="relative z-10 w-full h-auto">
        {/* Ombre du document */}
        <ellipse cx="200" cy="380" rx="120" ry="14" fill="#002B44" opacity="0.06" />

        {/* Document principal */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <rect x="90" y="40" width="220" height="290" rx="16" fill="#FFFFFF" stroke="#E5E9EF" strokeWidth="2" />
          <rect x="120" y="80" width="160" height="12" rx="6" fill="#002B44" opacity="0.12" />
          <rect x="120" y="108" width="160" height="12" rx="6" fill="#002B44" opacity="0.12" />
          <rect x="120" y="136" width="110" height="12" rx="6" fill="#002B44" opacity="0.12" />

          {/* Ligne de signature manuscrite */}
          <motion.path
            d="M120 200 Q 140 175, 160 200 T 200 200 T 240 200"
            stroke="#2563EB"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          />

          <rect x="120" y="230" width="90" height="10" rx="5" fill="#002B44" opacity="0.08" />
          <rect x="120" y="250" width="130" height="10" rx="5" fill="#002B44" opacity="0.08" />
        </motion.g>

        {/* Badge de vérification flottant */}
        <motion.g
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <circle cx="290" cy="270" r="46" fill="#2563EB" />
          <motion.path
            d="M270 270 L283 283 L312 254"
            stroke="white"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          />
        </motion.g>

        {/* Points décoratifs */}
        <circle cx="60" cy="150" r="5" fill="#2563EB" opacity="0.4" />
        <circle cx="340" cy="120" r="7" fill="#002B44" opacity="0.15" />
        <circle cx="55" cy="300" r="6" fill="#2563EB" opacity="0.3" />
      </svg>
    </div>
  );
}