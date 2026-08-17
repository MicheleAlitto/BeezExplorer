import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { HashLink, TimeAgo } from "../components/HashLink";
import { NotFound } from "./NotFound";

export function BlockDetail() {
  const { id } = useParams();
  // La rotta /block/:id riceve DUE forme: l'altezza (link dalla colonna "Altezza")
  // e l'hash (link dalla colonna "Hash" della lista blocchi). Prima si chiamava
  // sempre getBlockByHeight(Number(id)): con un hash dava NaN -> "Blocco non trovato".
  const isHeight = !!id && /^\d+$/.test(id);
  const { data: block, isLoading } = useQuery({
    queryKey: ["block", id],
    queryFn: () => (isHeight ? api.getBlockByHeight(Number(id)) : api.getBlockByHash(id!)),
    enabled: !!id,
  });
  // Serve solo per sapere l'altezza corrente della chain (nasconde "next" sul tip).
  const { data: info } = useQuery({
    queryKey: ["blockchainInfo"],
    queryFn: () => api.getBlockchainInfo(),
    staleTime: 10_000,
  });

  if (isLoading) return <p className="text-sm text-charcoal/50">Caricamento…</p>;
  if (!block) return <NotFound message="Blocco non trovato." />;

  const isTip = info != null && block.height >= info.height;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-medium text-ink">Blocco #{block.height}</h1>
        <div className="flex gap-2 text-sm">
          {block.height > 0 && (
            <Link to={`/block/${block.height - 1}`} className="rounded-lg border border-beez-100 bg-white px-3 py-1.5 hover:bg-beez-50">← #{block.height - 1}</Link>
          )}
          {!isTip && (
            <Link to={`/block/${block.height + 1}`} className="rounded-lg border border-beez-100 bg-white px-3 py-1.5 hover:bg-beez-50">#{block.height + 1} →</Link>
          )}
        </div>
      </div>

      <dl className="rounded-xl border border-beez-100 bg-white divide-y-2 divide-beez-100 text-sm">
        {[
          // Hash del blocco corrente: niente link (siamo già qui), solo testo + copy.
          ["Hash", <HashLink value={block.hash} kind="block" short={false} linked={false} />],
          // prevHash mostrato, ma il link naviga per height: l'API espone solo
          // getBlockByHeight. Nota: in caso di fork/reorg height-1 e prevHash
          // potrebbero divergere — irrilevante sulla testnet privata attuale.
          ["Blocco precedente",
            block.height > 0
              ? <HashLink value={block.prevHash} kind="block" to={`/block/${block.height - 1}`} />
              : <HashLink value={block.prevHash} kind="block" linked={false} />],
          ["Timestamp", <span><TimeAgo ts={block.timestamp} /> · {new Date(block.timestamp).toLocaleString("it-IT")}</span>],
          ["Forger", <HashLink value={block.forger} kind="address" />],
          ["Transazioni", <span className="font-mono">{String(block.txCount)}</span>],
        ].map(([label, value], i) => (
          <div key={i} className="grid grid-cols-1 gap-1 sm:grid-cols-[160px_1fr] sm:gap-4 px-4 py-2.5">
            <dt className="text-charcoal/60">{label}</dt>
            <dd className="break-all">{value}</dd>
          </div>
        ))}
      </dl>

      <section className="rounded-xl border border-beez-100 bg-white">
        <h2 className="border-b-2 border-beez-100 px-4 py-3 font-medium text-sm text-ink">Transazioni nel blocco</h2>
        <ul>
          {block.transactions.map((hash) => (
            <li key={hash} className="px-4 py-2.5 border-b-2 border-beez-100 last:border-0">
              <HashLink value={hash} kind="tx" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}