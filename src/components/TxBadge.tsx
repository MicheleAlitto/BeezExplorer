import type { TxType } from "../types/chain";
import { txCategory } from "../types/chain";

// Colore per CATEGORIA semantica (non per singolo tipo): palette leggibile,
// i tipi futuri si incasellano da soli. Il testo mostra il tipo esatto.
const categoryStyles: Record<string, string> = {
  value: "bg-beez-50 text-beez-700",
  smart: "bg-violet-100 text-smart",
  storage: "bg-gold-50 text-gold-700",
  system: "bg-emerald-50 text-emerald-700",
  other: "bg-slate-100 text-slate-600",
};

export function TxBadge({ type }: { type: TxType }) {
  const style = categoryStyles[txCategory(type)] ?? categoryStyles.other;
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {type.replace(/_/g, " ")}
    </span>
  );
}