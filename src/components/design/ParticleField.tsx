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
    // Cap DPR at 1.5: dots are tiny, so the extra pixels (and per-frame clearRect
    // cost) buy almost no visual gain but hurt WebView fill-rate.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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

    // Throttle to ~30fps — slow-drifting dots look identical but cost half the frames.
    const frameMs = 1000 / 30;
    let last = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < frameMs) return;
      last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const d of dots) {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
        ctx.beginPath();
        ctx.fillStyle = `hsla(${d.h} 90% 65% / 0.5)`;
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
      }
    };

    // Pause the loop while the app is backgrounded (WebView battery/CPU win).
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) { last = 0; raf = requestAnimationFrame(loop); }
    };
    document.addEventListener("visibilitychange", onVisibility);

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [count, reduced]);

  if (reduced) return null;
  return <canvas ref={ref} className="fixed inset-0 -z-10 pointer-events-none opacity-70" aria-hidden />;
}
