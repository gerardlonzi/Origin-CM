export function DashboardGlyph() {
    return (
      <svg viewBox="0 0 80 80" className="w-16 h-16">
        <rect x="8" y="8" width="64" height="64" rx="12" fill="#2563EB" opacity="0.08" />
        <rect x="18" y="20" width="20" height="16" rx="4" fill="#2563EB" opacity="0.7" />
        <rect x="42" y="20" width="20" height="16" rx="4" fill="#002B44" opacity="0.15" />
        <rect x="18" y="42" width="44" height="8" rx="4" fill="#002B44" opacity="0.15" />
        <rect x="18" y="54" width="30" height="8" rx="4" fill="#002B44" opacity="0.15" />
      </svg>
    );
  }
  
  export function LensGlyph() {
    return (
      <svg viewBox="0 0 80 80" className="w-16 h-16">
        <rect x="8" y="8" width="64" height="64" rx="12" fill="#10B981" opacity="0.08" />
        <circle cx="34" cy="34" r="16" fill="none" stroke="#10B981" strokeWidth="5" />
        <line x1="46" y1="46" x2="60" y2="60" stroke="#10B981" strokeWidth="5" strokeLinecap="round" />
        <path d="M27 34 L32 39 L42 27" stroke="#10B981" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  
  export function OrbGlyph() {
    return (
      <svg viewBox="0 0 80 80" className="w-16 h-16">
        <rect x="8" y="8" width="64" height="64" rx="12" fill="#F59E0B" opacity="0.08" />
        <circle cx="40" cy="38" r="18" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="3" />
        <circle cx="40" cy="38" r="7" fill="#F59E0B" />
        <circle cx="56" cy="24" r="5" fill="#F59E0B" opacity="0.5" />
      </svg>
    );
  }