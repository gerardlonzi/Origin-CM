import { ReactNode } from "react";

export default function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-origin-panel border border-origin-border rounded-xl p-5 ${className}`}>
      {children}
    </div>
  );
}
