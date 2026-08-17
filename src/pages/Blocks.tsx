import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../api";
import { HashLink, TimeAgo } from "../components/HashLink";

export function Blocks() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["blocks", page],
    queryFn: () => api.getBlocks(20, (page - 1) * 20),
    placeholderData: keepPreviousData,
  });

  return (
    <section className="rounded-xl border border-beez-100 bg-white">
      <h1 className="border-b-2 border-beez-100 px-4 py-3 font-medium text-ink">Blocchi</h1>
      {isLoading && <p className="p-4 text-sm text-charcoal/50">Caricamento…</p>}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-charcoal/60 border-b-2 border-beez-100">
            <th className="px-4 py-2 font-medium">Altezza</th>
            <th className="hidden sm:table-cell px-4 py-2 font-medium">Hash</th>
            <th className="px-4 py-2 font-medium text-right">Tx</th>
            <th className="px-4 py-2 font-medium">Età</th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map((b) => (
            <tr key={b.hash} className="border-b-2 border-beez-100 last:border-0 hover:bg-surface">
              <td className="px-4 py-3 font-mono">
                <HashLink value={String(b.height)} kind="block" short={false} />
              </td>
              <td className="hidden sm:table-cell px-4 py-3"><HashLink value={b.hash} kind="block" /></td>
              <td className="px-4 py-3 text-right font-mono text-charcoal">{b.txCount}</td>
              <td className="px-4 py-3 "><TimeAgo ts={b.timestamp} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {data && (
        <div className="flex items-center justify-between border-t border-beez-100 px-4 py-3 text-sm">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}
            className="rounded-lg bg-beez-600 px-3 py-1.5 text-white hover:bg-beez-700 disabled:bg-beez-100 disabled:text-beez-300 disabled:cursor-not-allowed">
            ← Precedente
          </button>
          <span className="text-charcoal/60">Pagina {page} di {Math.ceil(data.total / data.limit)}</span>
          <button disabled={data.offset + data.limit >= data.total} onClick={() => setPage(page + 1)}
            className="rounded-lg bg-beez-600 px-3 py-1.5 text-white hover:bg-beez-700 disabled:bg-beez-100 disabled:text-beez-300 disabled:cursor-not-allowed">
            Successiva →
          </button>
        </div>
      )}
    </section>
  );
}