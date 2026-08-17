import type { ExplorerApi } from "./index";
import type {
  Block,
  Paginated,
  Transaction,
  RawBlockListItem,
  RawBlockDetail,
  RawTxDetail,
  RawWalletTxResponse,
  RawBlockchainInfo,
  RawBalanceResponse,
} from "../types/chain";
import {
  adaptBlockListItem,
  adaptBlockDetail,
  extractBlockDetailTxs,
  adaptTxWallet,
  adaptTxDetail,
  adaptInfo,
  adaptBalance,
} from "./adapter";

// --- Selezione del chain node -------------------------------------------------
//
// STICKY NODE, non rotazione. BeezDesktop pesca un nodo a caso a ogni richiesta
// (client_core/client.py::_get_random_chain_node) e NON ha fallback: se il nodo
// scelto e' giu', la chiamata fallisce e basta. Qui si fa il contrario:
//   - si usa SEMPRE lo stesso nodo finche' risponde (coerenza: due chiamate della
//     stessa pagina non finiscono su nodi ad altezze diverse -> niente 404 fantasma)
//   - si passa al successivo SOLO se la connessione fallisce (non su 404/500, che
//     sono risposte legittime del nodo)
//   - il nodo che funziona diventa il nuovo default per il resto della sessione
//
// VITE_NODE_URLS: lista separata da virgole. Se vuota (default in dev) si usa il
// proxy Vite con path relativi, ed e' esattamente il comportamento di prima.
// Retrocompatibile con il vecchio VITE_NODE_URL singolo.
const RAW_NODES = (import.meta.env.VITE_NODE_URLS ?? import.meta.env.VITE_NODE_URL ?? "") as string;
const NODES: string[] = RAW_NODES.split(",")
  .map((s) => s.trim().replace(/\/+$/, ""))
  .filter((s) => s.length > 0);
const BASES: string[] = NODES.length > 0 ? NODES : [""];

/** Indice del nodo attivo: modulo-level, sopravvive ai cambi di pagina. */
let activeNode = 0;

/** fetch senza timeout resta appesa all'infinito su un nodo bloccato. */
const REQUEST_TIMEOUT_MS = 5000;

async function fetchWithTimeout(url: string): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function get<T>(path: string): Promise<T> {
  let lastError: unknown;
  // Parte dal nodo attivo e prova gli altri in ordine, una sola volta ciascuno.
  for (let i = 0; i < BASES.length; i++) {
    const idx = (activeNode + i) % BASES.length;
    let res: Response;
    try {
      res = await fetchWithTimeout(`${BASES[idx]}${path}`);
    } catch (e) {
      // Errore di RETE (connessione rifiutata, DNS, timeout): il nodo non risponde,
      // ha senso provarne un altro.
      lastError = e;
      continue;
    }
    // Il nodo ha risposto: la scelta e' valida anche se lo status e' 404/500.
    // Cambiare nodo su un 404 significherebbe moltiplicare i tempi di ogni ricerca
    // fallita senza cambiare il risultato.
    if (idx !== activeNode) activeNode = idx;
    if (!res.ok) throw new Error(`Node ${res.status}: ${path}`);
    return res.json();
  }
  throw new Error(
    `Nessun chain node raggiungibile (${BASES.length} provati): ${path}` +
      (lastError instanceof Error ? ` — ${lastError.message}` : "")
  );
}

async function tryGet<T>(path: string): Promise<T | null> {
  try { return await get<T>(path); } catch { return null; }
}

export const liveApi: ExplorerApi = {
  async getBlockchainInfo() {
    return adaptInfo(await get<RawBlockchainInfo>(`/api/blockchain/info`));
  },

  async getBlocks(limit, offset): Promise<Paginated<Block>> {
    const raw = await get<{ blocks?: RawBlockListItem[]; total?: number }>(
      `/api/blockchain/blocks?limit=${limit}&offset=${offset}`
    );
    const items = (raw.blocks ?? []).map(adaptBlockListItem);
    return { items, limit, offset, total: raw.total ?? items.length };
  },

  async getBlockByHeight(height) {
    const raw = await tryGet<RawBlockDetail>(`/api/blockchain/block/${height}`);
    return raw?.block ? adaptBlockDetail(raw) : null;
  },

  async getBlockByHash(hash) {
    const raw = await tryGet<RawBlockDetail>(`/api/blockchain/block/hash/${hash}`);
    return raw?.block ? adaptBlockDetail(raw) : null;
  },

  async getTransaction(hash) {
    const raw = await tryGet<{ transaction?: RawTxDetail }>(`/api/blockchain/transaction/${hash}`);
    return raw?.transaction ? adaptTxDetail(raw.transaction) : null;
  },

  async getWalletBalance(address) {
    // NOTA: /wallet/balance risponde 200 con un saldo di default (10000.0) anche per
    // address inesistenti -> non e' possibile distinguere "non esiste" da qui.
    // Interrogo anche la lista tx (limit=1) solo per sapere se il wallet ha attivita'.
    const [raw, activity] = await Promise.all([
      tryGet<RawBalanceResponse>(`/wallet/balance?address=${encodeURIComponent(address)}`),
      tryGet<RawWalletTxResponse>(
        `/api/blockchain/wallet/${encodeURIComponent(address)}/transactions?limit=1&offset=0`
      ),
    ]);
    if (!raw) return null;
    return {
      address,
      balance: adaptBalance(raw),
      // txCount volutamente NON valorizzato: il nodo non espone un conteggio reale.
      isFrozen: raw.governance?.is_frozen ?? undefined,
      hasActivity: activity ? (activity.transactions?.length ?? 0) > 0 : undefined,
    };
  },

  async getWalletTransactions(address, limit, offset, txType = "all") {
    const q = txType && txType !== "all" ? `&type=${txType}` : "";
    const raw = await get<RawWalletTxResponse>(
      `/api/blockchain/wallet/${encodeURIComponent(address)}/transactions?limit=${limit}&offset=${offset}${q}`
    );
    const items = (raw.transactions ?? []).map(adaptTxWallet);
    // ATTENZIONE: raw.tx_count NON e' il totale del wallet, e' il conteggio di questa
    // pagina (== limit). Usarlo come `total` bloccava la paginazione a pagina 1.
    // Non esistendo un totale, si pagina a cursore: c'e' un'altra pagina se questa e' piena.
    return {
      items,
      limit,
      offset,
      total: offset + items.length, // best-effort: minimo garantito, non il totale reale
      hasMore: items.length === limit,
    };
  },

  async getLatestBlocks(limit = 10) {
    const p = await this.getBlocks(limit, 0);
    return p.items;
  },

  async getLatestTransactions(limit = 10) {
    // La lista /blocks non porta le tx: prendo il DETTAGLIO degli ultimi blocchi
    // (soluzione 1). N richieste, ma dati completi. Fermo appena raggiungo limit.
    const heads = await this.getBlocks(6, 0);
    const out: Transaction[] = [];
    for (const b of heads.items) {
      const detail = await tryGet<RawBlockDetail>(`/api/blockchain/block/${b.height}`);
      if (detail?.block) out.push(...extractBlockDetailTxs(detail));
      if (out.length >= limit) break;
    }
    return out.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  },

  async search(q) {
    const query = q.trim();
    if (/^\d+$/.test(query)) {
      const block = await this.getBlockByHeight(Number(query));
      return block ? { kind: "block", block } : { kind: "none" };
    }
    if (query.startsWith("bez")) {
      const address = await this.getWalletBalance(query);
      return address ? { kind: "address", address } : { kind: "none" };
    }
    if (/^[0-9a-f]{64}$/i.test(query)) {
      const tx = await this.getTransaction(query);
      if (tx) return { kind: "tx", tx };
      const block = await this.getBlockByHash(query);
      if (block) return { kind: "block", block };
    }
    return { kind: "none" };
  },
};