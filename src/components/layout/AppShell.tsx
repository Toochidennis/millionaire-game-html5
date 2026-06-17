import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { AnimatedGradient } from "@/components/design/AnimatedGradient";
import { ParticleField } from "@/components/design/ParticleField";
import { NavBar } from "./NavBar";

const HIDE_NAV = ["/", "/login", "/game", "/results"];

export function AppShell() {
  const { pathname } = useLocation();
  const showNav = !HIDE_NAV.includes(pathname);
  return (
    <div className="relative min-h-dvh">
      <AnimatedGradient />
      <ParticleField />
      <AnimatePresence mode="wait">
        <Outlet key={pathname} />
      </AnimatePresence>
      {showNav && <NavBar />}
    </div>
  );
}
