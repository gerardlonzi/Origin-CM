"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export default function ScanAnimation() {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full border-2 border-accent"
          initial={{ opacity: 0.6, scale: 0.4 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: i * 0.5 }}
        />
      ))}
      <motion.span
        className="absolute inset-2 rounded-full border-t-2 border-r-2 border-accent/70"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="z-10 bg-white rounded-full p-3 border border-border shadow-sm"
      >
        <ShieldCheck className="text-accent" size={24} />
      </motion.div>
    </div>
  );
}