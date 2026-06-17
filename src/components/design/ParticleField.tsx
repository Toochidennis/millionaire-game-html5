import { useEffect, useRef } from "react";
import { useSettingsStore } from "@/store";

/** Lightweight canvas particle field. Skips entirely under reduced motion. */
export function ParticleField({ count = 60 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useSettingsStore((s) => s.reducedMotion);

  useEffect(() => {
    if (reduced) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
      canvas.style.width = innerWidth + "px"; canvas.style.height = innerHeight + "px";
    };
    resize(); addEventListener("resize", resize);

    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: (Math.random() * 1.6 + 0.4) * dpr,
      vx: (Math.random() - 0.5) * 0.25 * dpr, vy: (Math.random() - 0.5) * 0.25 * dpr,
      h: Math.random() > 0.5 ? 190 : 280,
    }));

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${d.h} 90% 65% / 0.5)`;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, [count, reduced]);

  if (reduced) return null;
  return <canvas ref={ref} className="fixed inset-0 -z-10 pointer-events-none opacity-70" aria-hidden />;
}
