import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api";
import { HashLink, TimeAgo } from "../components/HashLink";
import { TxBadge } from "../components/TxBadge";
import { NotFound } from "./NotFound";

export function TxDetail() {
  const { hash } = useParams();
  const [showRaw, setShowRaw] = useState(false);
  const { data: tx, isLoading } = useQuery({
    queryKey: ["tx", hash],
    queryFn: () => api.getTransaction(hash!),
    enabled: !!hash,
  });

  if (isLoading) return <p className="text-sm text-charcoal/50">Caricamento…</p>;
  if (!tx) return <NotFound message="Transazione non trovata." />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium text-ink flex items-center gap-3">
        Transazione <TxBadge type={tx.type} />
      </h1>
      <dl className="rounded-xl border border-beez-100 bg-white divide-y-2 divide-beez-100 text-sm">
        {[
          ["Hash", <HashLink value={tx.hash} kind="tx" short={false} linked={false} />],
          ["Blocco", <HashLink value={String(tx.blockHeight)} kind="block" short={false} />],
          ["Timestamp", <span><TimeAgo ts={tx.timestamp} /> · {new Date(tx.timestamp).toLocaleString("it-IT")}</span>],
          ["Da", <HashLink value={tx.from} kind="address" short={false} />],
          ["A", <HashLink value={tx.to} kind="address" short={false} />],
          ["Importo", <span className="font-mono font-semibold text-gold-600">{tx.amount.toLocaleString("it-IT")} BZT</span>],
          ["Fee", tx.fee != null ? <span className="font-mono text-gold-600">{tx.fee} BZT</span> : "—"],
        ].map(([label, value], i) => (
          <div key={i} className="grid grid-cols-1 gap-1 sm:grid-cols-[160px_1fr] sm:gap-4 px-4 py-2.5">
            <dt className="text-charcoal/60">{label}</dt>
            <dd className="break-all">{value}</dd>
          </div>
        ))}
      </dl>
      <button onClick={() => setShowRaw(!showRaw)} className="text-sm text-beez-600 hover:text-beez-700 hover:underline">
        {showRaw ? "Nascondi" : "Mostra"} dati raw
      </button>
      {showRaw && (
        <pre className="rounded-xl border border-beez-100 bg-white p-4 text-xs overflow-x-auto font-mono">
          {JSON.stringify(tx, null, 2)}
        </pre>
      )}
    </div>
  );
}