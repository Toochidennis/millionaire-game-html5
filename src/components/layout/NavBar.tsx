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
    /*
     * Mobile (default): spans left-2 → right-2 so all 5 tabs share equal width
     * regardless of label language/length. RTL is symmetric: both edges are fixed.
     * sm+: reverts to an auto-width centered pill.
     */
    <nav className="fixed bottom-3 left-2 right-2 z-40 glass glass-hi px-1 py-1.5 rounded-3xl flex sm:left-1/2 sm:right-auto sm:w-auto sm:-translate-x-1/2 sm:px-2 sm:py-2 sm:gap-1">
      {TABS.map(({ to, icon: Icon, key }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-2xl px-1 py-2 transition",
              "sm:flex-none sm:px-4",
              isActive
                ? "bg-gradient-to-br from-cyan/30 to-violet/30 text-cyan neon-cyan"
                : "text-muted hover:text-ink",
            )
          }
        >
          <Icon size={20} />
          <span className="w-full text-center text-[9px] leading-tight truncate sm:text-[10px]">
            {t(key)}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}
