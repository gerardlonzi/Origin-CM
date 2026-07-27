"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("tosign-theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("tosign-theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="text-muted hover:text-navy dark:hover:text-white transition-colors"
      title={dark ? "Mode clair" : "Mode sombre"}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}