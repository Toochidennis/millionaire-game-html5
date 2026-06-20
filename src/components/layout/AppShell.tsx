import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { AnimatedGradient } from "@/components/design/AnimatedGradient";
import { ParticleField } from "@/components/design/ParticleField";
import { NavBar } from "./NavBar";

const HIDE_NAV = ["/", "/login", "/game", "/results"];
// Routes that carry their own heavy animation — skip the ambient particle canvas
// so its always-on rAF loop doesn't compete with gameplay (WebView perf).
const HIDE_PARTICLES = ["/game"];

export function AppShell() {
  const { pathname } = useLocation();
  const showNav = !HIDE_NAV.includes(pathname);
  const showParticles = !HIDE_PARTICLES.includes(pathname);
  return (
    <div className="relative min-h-dvh">
      <AnimatedGradient />
      {showParticles && <ParticleField />}
      <AnimatePresence mode="wait">
        <Outlet key={pathname} />
      </AnimatePresence>
      {showNav && <NavBar />}
    </div>
  );
}
