import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Home, User, Trophy, CalendarDays, Map } from "lucide-react";
import { cn } from "@/lib/cn";

const TABS = [
  { to: "/dashboard", icon: Home, key: "nav_home" },
  { to: "/leaderboards", icon: Trophy, key: "nav_ranks" },
  { to: "/daily", icon: CalendarDays, key: "nav_daily" },
  { to: "/journey", icon: Map, key: "nav_journey" },
  { to: "/profile", icon: User, key: "nav_you" },
] as const;

export function NavBar() {
  const { t } = useTranslation();
  return (
    <nav className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 glass glass-hi px-2 py-2 rounded-3xl flex gap-1">
      {TABS.map(({ to, icon: Icon, key }) => (
        <NavLink key={to} to={to} className={({ isActive }) =>
          cn("flex flex-col items-center gap-0.5 rounded-2xl px-4 py-2 text-[10px] transition",
            isActive ? "bg-gradient-to-br from-cyan/30 to-violet/30 text-cyan neon-cyan" : "text-muted hover:text-ink")
        }>
          <Icon size={20} /><span>{t(key)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
