import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { api } from "../api";
import { BookOpen } from "lucide-react";

export function Layout() {
  const [query, setQuery] = useState("");
  const [notFound, setNotFound] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // shortcut "/" per focalizzare la search da qualsiasi pagina
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const result = await api.search(query);
    setNotFound(false);
    switch (result.kind) {
      case "block":
        navigate(`/block/${result.block.height}`);
        break;
      case "tx":
        navigate(`/tx/${result.tx.hash}`);
        break;
      case "address":
        navigate(`/address/${result.address.address}`);
        break;
      default:
        setNotFound(true);
    }
    setQuery("");
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-beez-800 bg-beez-900 sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-semibold text-lg text-white"
          >
            <img src="/logo.png" alt="Beez" className="h-8 w-8" />
            <span>
              Beez <span className="text-gold-400">Explorer</span>
            </span>
          </Link>
          <nav className="flex gap-4 text-sm text-beez-100">
            <Link
              to="/blocks"
              className="hover:text-gold-400 transition-colors"
            >
              Blocchi
            </Link>
          </nav>
          <form
            onSubmit={onSubmit}
            className="ml-auto flex-1 min-w-[180px] max-w-md"
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca blocco, hash tx o address…  ( / )"
              className="w-full rounded-lg border border-beez-800 bg-beez-800/60 px-3 py-2 text-sm font-mono
                         text-white placeholder:text-beez-200/60
                         focus:outline-none focus:ring-2 focus:ring-gold-400 focus:bg-beez-800"
            />
          </form>
          <span className="flex items-center gap-1.5 text-xs text-gold-300 bg-beez-800 px-2.5 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Testnet
          </span>
          <Link
            to="/guide"
            title="Guida utente"
            aria-label="Guida utente"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-beez-100 hover:bg-white/10 hover:text-white"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Guida</span>
          </Link>
        </div>
        {notFound && (
          <p className="mx-auto max-w-5xl px-4 pb-2 text-sm text-red-300">
            Nessun risultato. Controlla il formato: numero di blocco, hash (64
            hex) o address (bez…).
          </p>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}