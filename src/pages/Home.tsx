import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { HashLink, TimeAgo } from "../components/HashLink";
import { TxBadge } from "../components/TxBadge";

export function Home() {
  const blocks = useQuery({
    queryKey: ["latestBlocks"],
    queryFn: () => api.getLatestBlocks(10),
    refetchInterval: 10_000,
  });
  const txs = useQuery({
    queryKey: ["latestTxs"],
    queryFn: () => api.getLatestTransactions(10),
    refetchInterval: 10_000,
  });

  const tip = blocks.data?.[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Ultimo blocco" value={tip ? `#${tip.height.toLocaleString("it-IT")}` : "…"} />
        <Stat label="Tx nell'ultimo blocco" value={tip ? String(tip.txCount) : "…"} />
        <Stat label="Tempo blocco" value="~30s" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel title="Ultimi blocchi" loading={blocks.isLoading} error={blocks.isError}>
          {blocks.data?.map((b) => (
            <li key={b.hash} className="flex items-center justify-between px-4 py-2.5 border-b-2 border-beez-100 last:border-0">
              <div>
                <HashLink value={String(b.height)} kind="block" short={false} />
                <span className="ml-2 text-xs text-charcoal/70">{b.txCount} tx</span>
              </div>
              <TimeAgo ts={b.timestamp} />
            </li>
          ))}
        </Panel>

        <Panel title="Ultime transazioni" loading={txs.isLoading} error={txs.isError}>
          {txs.data?.map((t) => (
            <li key={t.hash} className="flex items-center justify-between gap-3 px-4 py-2.5 border-b-2 border-beez-100 last:border-0">
              <div className="flex flex-col min-w-0">
                <span className="flex items-center gap-2">
                  <HashLink value={t.hash} kind="tx" />
                  <TxBadge type={t.type} />
                </span>
                <span className="text-xs text-charcoal/70 truncate">
                  <HashLink value={t.from} kind="address" /> → <HashLink value={t.to} kind="address" />
                </span>
              </div>
              <span className="text-sm font-medium whitespace-nowrap text-gold-600">{t.amount.toLocaleString("it-IT")} BZT</span>
            </li>
          ))}
        </Panel>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-beez-100 bg-white px-4 py-3 border-l-4 border-l-beez-600">
      <p className="text-xs text-charcoal/70" >{label}</p>
      <p className="text-xl font-medium font-mono text-beez-700">{value}</p>
    </div>
  );
}

function Panel({ title, loading, error, children }: {
  title: string; loading: boolean; error: boolean; children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-beez-100 bg-white">
      <h2 className="border-b-2 border-beez-100 px-4 py-3 font-medium text-sm">{title}</h2>
      {loading && <p className="p-4 text-sm text-charcoal/70">Caricamento…</p>}
      {error && <p className="p-4 text-sm text-red-600">Errore di rete, riprovo…</p>}
      <ul>{children}</ul>
    </section>
  );
}
