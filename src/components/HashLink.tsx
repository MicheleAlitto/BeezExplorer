import { Link } from "react-router-dom";
import { useState } from "react";

interface Props {
  value: string;
  kind: "block" | "tx" | "address";
  short?: boolean;
  /** Sovrascrive la destinazione derivata da kind (es. link per height mostrando un hash) */
  to?: string;
  /** Se false, mostra solo testo + copy senza link (es. hash del blocco corrente) */
  linked?: boolean;
}

const routes = { block: "/block", tx: "/tx", address: "/address" };

const SYSTEM_ADDRESSES = new Set(["FROZEN_POOL", "BEEZBASE"]);

function isRealAddress(value: string): boolean {
  if (SYSTEM_ADDRESSES.has(value)) return false;
  return value.startsWith("bez");
}

export function HashLink({ value, kind, short = true, to, linked = true }: Props) {
  const [copied, setCopied] = useState(false);
  const display = short && value.length > 16 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value;
  const isLinked = linked && (kind !== "address" || isRealAddress(value));

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <span className="inline-flex items-center gap-1 font-mono text-sm">
      {isLinked ? (
        <Link to={to ?? `${routes[kind]}/${value}`} className="text-beez-600 hover:text-beez-700 hover:underline" title={value}>
          {display}
        </Link>
      ) : (
        <span className="text-charcoal/70" title={value}>{display}</span>
      )}
      <button onClick={copy} className="text-charcoal/40 hover:text-beez-600" aria-label="Copia">
        {copied ? "✓" : "⧉"}
      </button>
    </span>
  );
}

export function TimeAgo({ ts }: { ts: number }) {
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  const label =
    s < 60 ? `${s}s fa` :
    s < 3600 ? `${Math.floor(s / 60)}m fa` :
    s < 86400 ? `${Math.floor(s / 3600)}h fa` :
    `${Math.floor(s / 86400)}g fa`;
  return <span title={new Date(ts).toLocaleString("it-IT")} className="text-charcoal/60">{label}</span>;
}