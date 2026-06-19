import type { ReactNode } from "react";

export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={className ?? "min-h-dvh px-4 pb-32 pt-6 sm:px-6 max-w-2xl mx-auto w-full"}>
      {children}
    </main>
  );
}
