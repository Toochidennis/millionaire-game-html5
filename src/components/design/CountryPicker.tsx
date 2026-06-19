import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getAllCountries, flagSvg, type Country } from "@/data/countries";
import { initCountryCache } from "@/lib/countryCache";
import { cn } from "@/lib/cn";

interface Props {
  value: string;
  onChange: (code: string) => void;
}

export function CountryPicker({ value, onChange }: Props) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [countries, setCountries] = useState<Country[]>(getAllCountries);
  const [loading, setLoading] = useState(getAllCountries().length === 0);

  useEffect(() => {
    if (countries.length > 0) { setLoading(false); return; }
    initCountryCache()
      .then(() => setCountries(getAllCountries()))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const selected = countries.find((c) => c.code === value);

  const filtered = useMemo(() => {
    if (!query.trim() || !searchActive) return countries;
    const q = query.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [query, searchActive, countries]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearchActive(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Reset search state when closing
  const close = () => {
    setOpen(false);
    setSearchActive(false);
    setQuery("");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm active:bg-white/10 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-3 min-w-0">
          <img src={flagSvg(value)} alt="" className="w-6 h-4 shrink-0 rounded-sm object-cover" />
          <span className="truncate">{selected?.name ?? value}</span>
        </span>
        <ChevronDown
          size={15}
          className={cn("text-muted shrink-0 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          className="absolute top-full mt-1 inset-x-0 z-50 rounded-xl border border-white/10 shadow-2xl overflow-hidden"
          style={{
            background: "linear-gradient(160deg,#1a2240,#111830)",
            backdropFilter: "blur(20px)",
            maxHeight: "min(20rem, 60vh)",
          }}
        >
          {/* Search bar — only active when clicked */}
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 border-b border-white/5 sticky top-0 bg-[#111830]/95 backdrop-blur cursor-text",
              searchActive && "ring-1 ring-cyan/30",
            )}
            onClick={() => {
              setSearchActive(true);
              inputRef.current?.focus();
            }}
          >
            <Search size={14} className="text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setSearchActive(true); setQuery(e.target.value); }}
              placeholder={t("country_search")}
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted"
            />
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: "16rem" }}>
            {loading ? (
              <p className="px-4 py-3 text-sm text-muted text-center">{t("country_loading")}</p>
            ) : filtered.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted text-center">{t("country_not_found")}</p>
            ) : (
              filtered.map((c) => {
                const active = c.code === value;
                return (
                  <button
                    key={c.code}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(c.code);
                      close();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start transition-colors",
                      active
                        ? "bg-white/12 text-ink"
                        : "text-muted hover:bg-white/8 hover:text-ink active:bg-white/10",
                    )}
                  >
                    <img src={flagSvg(c.code)} alt="" className="w-6 h-4 shrink-0 rounded-sm object-cover" />
                    <span className="flex-1 truncate">{c.name}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
