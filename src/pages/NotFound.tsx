import { Link } from "react-router-dom";

export function NotFound({ message = "Pagina non trovata." }: { message?: string }) {
  return (
    <div className="rounded-xl border border-beez-100 bg-white p-8 text-center space-y-3">
      <p className="text-4xl text-gold-400/60">⬡</p>
      <p className="text-charcoal/70">{message}</p>
      <Link to="/" className="inline-block rounded-lg bg-beez-600 px-4 py-2 text-sm text-white hover:bg-beez-700">Torna alla home</Link>
    </div>
  );
}