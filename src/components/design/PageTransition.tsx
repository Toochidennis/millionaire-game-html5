import type { ReactNode } from "react";

export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main className={className ?? "min-h-dvh px-4 pb-[calc(8rem_+_env(safe-area-inset-bottom))] pt-[calc(1.5rem_+_env(safe-area-inset-top))] sm:px-6 max-w-2xl mx-auto w-full"}>
      {children}
    </main>
  );
}
