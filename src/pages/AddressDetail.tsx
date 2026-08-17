import { useParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../api";
import { HashLink, TimeAgo } from "../components/HashLink";
import { TxBadge } from "../components/TxBadge";
import { NotFound } from "./NotFound";
import type { Transaction } from "../types/chain";

const PAGE_SIZE = 20;

/**
 * Direzione della tx rispetto all'address in pagina.
 * Preferisce `direction` precalcolato dal nodo (verificato: "sent" | "received").
 * Fallback al confronto su from/to quando il campo manca (mock, tx estratte da blocco).
 */
function isOutgoing(t: Transaction, self: string): boolean {
  if (t.direction === "sent") return true;
  if (t.direction === "received") return false;
  return t.from === self;
}

export function AddressDetail() {
  const { addr } = useParams();
  const [page, setPage] = useState(1);

  const {
    data: address,
    isLoading,
    isError: addressError,
  } = useQuery({
    queryKey: ["address", addr],
    queryFn: () => api.getWalletBalance(addr!),
    enabled: !!addr,
  });

  const {
    data: txs,
    isError: txsError,
    isFetching,
  } = useQuery({
    queryKey: ["addressTxs", addr, page],
    queryFn: () => api.getWalletTransactions(addr!, PAGE_SIZE, (page - 1) * PAGE_SIZE),
    enabled: !!addr,
    placeholderData: keepPreviousData,
  });

  if (isLoading) return <p className="text-sm text-charcoal/50">Caricamento…</p>;

  if (addressError)
    return <NotFound message="Impossibile contattare il nodo. Riprova tra qualche istante." />;

  if (!address) return <NotFound message="Address non trovato." />;

  // Il nodo risponde 200 con un saldo di default anche per address mai visti sulla chain:
  // l'unica discriminante e' l'assenza di transazioni. Volutamente NON diciamo "non esiste",
  // perche' un wallet nuovo e legittimo ricade nello stesso caso.
  const noActivity = address.hasActivity === false;

  // Paginazione a cursore: il nodo non espone un totale reale delle tx di un wallet.
  const hasPrev = page > 1;
  const hasNext = txs?.hasMore ?? (txs ? txs.offset + txs.limit < txs.total : false);
  const showPager = hasPrev || hasNext;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium text-ink">Address</h1>

      <div className="rounded-xl border border-beez-100 border-l-4 border-l-gold-400 bg-white p-4 space-y-2 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-mono break-all text-charcoal">{address.address}</p>
          {address.isFrozen && (
            <span
              className="rounded px-1.5 py-0.5 text-xs font-medium bg-sky-100 text-sky-700"
              title="Wallet congelato da governance: non puo' effettuare trasferimenti."
            >
              Congelato
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1">
          <p>
            <span className="text-charcoal/60">Balance:</span>{" "}
            <span className="font-mono font-semibold text-gold-600">
              {address.balance.toLocaleString("it-IT")} BZT
            </span>
          </p>
          {/* txCount mostrato solo se davvero disponibile (mock). In live il nodo non
              espone un conteggio reale: meglio omettere che mostrare uno 0 falso. */}
          {typeof address.txCount === "number" && (
            <p>
              <span className="text-charcoal/60">Transazioni:</span>{" "}
              <span className="font-mono">{address.txCount}</span>
            </p>
          )}
        </div>
      </div>

      {noActivity && (
        <div className="rounded-xl border border-beez-100 bg-surface p-4 text-sm text-charcoal/70">
          Nessuna transazione registrata per questo address sulla chain.
        </div>
      )}

      <section className="rounded-xl border border-beez-100 bg-white">
        <h2 className="border-b-2 border-beez-100 px-4 py-3 font-medium text-sm text-ink">
          Transazioni
        </h2>

        {txsError && (
          <p className="px-4 py-6 text-center text-sm text-charcoal/60">
            Impossibile caricare le transazioni: il nodo non risponde.
          </p>
        )}

        {!txsError && txs && txs.items.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-charcoal/50">
            Nessuna transazione da mostrare.
          </p>
        )}

        <ul>
          {txs?.items.map((t) => {
            const isOut = isOutgoing(t, address.address);
            return (
              <li
                key={t.hash}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5 border-b-2 border-beez-100 last:border-0"
              >
                <span
                  className={`text-xs font-medium rounded px-1.5 py-0.5 ${
                    isOut ? "bg-red-50 text-red-600" : "bg-emerald-100 text-ok"
                  }`}
                >
                  {isOut ? "OUT" : "IN"}
                </span>
                <HashLink value={t.hash} kind="tx" />
                <TxBadge type={t.type} />
                <span className="ml-auto text-sm font-mono font-semibold text-gold-600 whitespace-nowrap">
                  {t.amount.toLocaleString("it-IT")} BZT
                </span>
                <TimeAgo ts={t.timestamp} />
              </li>
            );
          })}
        </ul>

        {showPager && (
          <div className="flex items-center justify-between border-t-2 border-beez-100 px-4 py-3 text-sm">
            <button
              disabled={!hasPrev || isFetching}
              onClick={() => setPage(page - 1)}
              className="rounded-lg bg-beez-600 px-3 py-1.5 text-white hover:bg-beez-700 disabled:bg-beez-100 disabled:text-beez-300 disabled:cursor-not-allowed"
            >
              ←
            </button>
            {/* Nessun "pagina X di Y": il totale reale non e' noto. */}
            <span className="text-charcoal/60">Pagina {page}</span>
            <button
              disabled={!hasNext || isFetching}
              onClick={() => setPage(page + 1)}
              className="rounded-lg bg-beez-600 px-3 py-1.5 text-white hover:bg-beez-700 disabled:bg-beez-100 disabled:text-beez-300 disabled:cursor-not-allowed"
            >
              →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}