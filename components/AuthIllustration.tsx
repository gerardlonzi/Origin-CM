export default function AuthIllustration() {
    return (
      <div className="hidden lg:flex flex-1 bg-navy relative overflow-hidden items-center justify-center">
        {/* Formes de fond */}
        <div className="absolute w-96 h-96 rounded-full bg-accent/20 blur-3xl -top-20 -left-20" />
        <div className="absolute w-72 h-72 rounded-full bg-white/5 blur-3xl bottom-0 right-0" />
  
        <svg viewBox="0 0 400 400" className="w-80 h-80 relative z-10">
          {/* Document */}
          <rect x="110" y="70" width="180" height="240" rx="12" fill="#FFFFFF" opacity="0.95" />
          <rect x="135" y="105" width="130" height="10" rx="5" fill="#002B44" opacity="0.15" />
          <rect x="135" y="130" width="130" height="10" rx="5" fill="#002B44" opacity="0.15" />
          <rect x="135" y="155" width="90" height="10" rx="5" fill="#002B44" opacity="0.15" />
  
          {/* Ligne de signature */}
          <path
            d="M135 220 Q 155 200, 175 220 T 215 220 T 255 220"
            stroke="#2563EB"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
  
          {/* Sceau / badge de vérification */}
          <circle cx="270" cy="255" r="42" fill="#2563EB" />
          <path
            d="M252 255 L264 267 L290 240"
            stroke="white"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
  
          {/* Points flottants décoratifs */}
          <circle cx="90" cy="130" r="5" fill="#FFFFFF" opacity="0.6" />
          <circle cx="320" cy="110" r="7" fill="#FFFFFF" opacity="0.4" />
          <circle cx="80" cy="280" r="6" fill="#FFFFFF" opacity="0.5" />
        </svg>
  
        <div className="absolute bottom-12 left-12 right-12 text-white z-10">
          <p className="text-lg font-semibold">Chaque document, une signature unique.</p>
          <p className="text-sm text-white/70 mt-1">
            Cryptographie Ed25519 · Vérification en temps réel · Registre national de confiance.
          </p>
        </div>
      </div>
    );
  }