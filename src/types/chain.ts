// Contratto dati Beez Explorer — DUE LIVELLI.
// Tipi DOMINIO (UI, invariati) + tipi WIRE (payload reali del nodo, Postman 10/08/2026).
// Conversione in src/api/adapter.ts.

// ============================================================
// DOMINIO (consumato dalla UI)
// ============================================================

export interface Block {
  height: number;
  hash: string;
  prevHash: string; // "" nel listing; valorizzato dal dettaglio (/block/{height})
  timestamp: number; // ms epoch
  forger: string; // dal nodo: "miner" / "miner_address"
  txCount: number;
  transactions: string[]; // hash; popolato solo dal dettaglio blocco
}

// Allineato a shared/transaction.py (fonte di verita', letto 11/08/2026).
// NB: sulla chain il transfer si chiama "normal", l'adapter lo mappa a "transfer".
export type TxType =
  | "transfer"
  | "upload"
  | "smart_query"
  | "smart_index"
  | "knowledge_query"
  | "reward"
  | "datrone_reward"
  | "freeze"
  | "rollback"
  | "penalty"
  | "escrow"
  | "escrow_release"
  | "escrow_unlock"
  | "storage_payment"
  | "update_chunk_location"
  | "ownership_request"
  | "ownership_accept"
  | "ownership_reject"
  | "ownership_cancel"
  | "update_digital_asset_price"
  | "update_digital_asset_visibility";

// Categoria semantica per il colore del badge (raggruppa i tipi).
export type TxCategory = "value" | "smart" | "storage" | "system" | "other";

export const TX_CATEGORY: Record<string, TxCategory> = {
  transfer: "value",
  smart_query: "smart",
  smart_index: "smart",
  knowledge_query: "smart",
  upload: "storage",
  update_chunk_location: "storage",
  // La famiglia escrow NON e' un escrow di marketplace: sono ricompense generate dal DAM
  // verso gli storage node dopo la verifica dei chunk (shared/transaction.py make_escrow).
  // Categoria "storage", non "system".
  escrow: "storage",
  escrow_release: "storage",
  escrow_unlock: "storage",
  storage_payment: "storage",
  reward: "system",
  datrone_reward: "system",
  freeze: "system",
  rollback: "system",
  penalty: "system",
  // I trasferimenti di proprieta' di asset digitali muovono BZT: categoria "value".
  ownership_request: "value",
  ownership_accept: "value",
  ownership_reject: "value",
  ownership_cancel: "value",
  update_digital_asset_price: "other",
  update_digital_asset_visibility: "other",
};

export function txCategory(type: string): TxCategory {
  return TX_CATEGORY[type] ?? "other";
}

export interface Transaction {
  hash: string;
  blockHeight: number;
  blockHash?: string;
  timestamp: number; // ms epoch
  from: string;
  to: string;
  amount: number; // BZT
  type: TxType;
  direction?: string; // "sent" | "received" (precalcolato dal nodo, solo lista wallet)
  fee?: number;
  file_id?: string;
  file_name?: string;
  file_ids?: string[];
  query_hash?: string;
  answer_hash?: string;
  smart_node_id?: string;
  request_id?: string;
  asking_price?: string;
  sig?: string;
  pub?: string;
}

export interface Address {
  address: string;
  balance: number;
  /**
   * Numero totale di tx del wallet. OPZIONALE: il mock lo valorizza, il nodo reale NO
   * (`tx_count` del wire e' per-pagina, vedi RawWalletTxResponse). In live resta undefined
   * e la UI non deve mostrarlo, invece di mostrare uno 0 falso.
   */
  txCount?: number;
  /** Non popolabili dal nodo attuale: richiesta aperta a Enrico. Vedi RawWalletTxResponse. */
  totalSent?: number;
  totalReceived?: number;
  isFrozen?: boolean;
  hasActivity?: boolean;
}

export interface BlockchainInfo {
  height: number;
  lastBlockHash?: string;
  mempoolSize?: number;
  totalWallets?: number;
  nodeId?: string;
}

export interface Paginated<T> {
  items: T[];
  limit: number;
  offset: number;
  /**
   * Totale reale degli elementi, quando il nodo lo espone.
   * ATTENZIONE: affidabile SOLO per i blocchi (/blocks -> "total": 106763, verificato).
   * Per le tx di un wallet il nodo NON espone un totale: in quel caso `total` viene
   * valorizzato in modo best-effort e la paginazione deve basarsi su `hasMore`.
   */
  total: number;
  /**
   * Esiste (probabilmente) una pagina successiva. Usato quando `total` non è affidabile:
   * si deduce da items.length === limit (paginazione a cursore).
   * Se assente, i consumer possono continuare a usare `total` (comportamento storico).
   */
  hasMore?: boolean;
}

export type SearchResult =
  | { kind: "block"; block: Block }
  | { kind: "tx"; tx: Transaction }
  | { kind: "address"; address: Address }
  | { kind: "none" };

// ============================================================
// WIRE (payload reali — solo live.ts + adapter.ts)
// ============================================================

// tx da /wallet/{addr}/transactions (ricca)
// NOTA: il nodo non omette i campi non pertinenti, li invia esplicitamente a `null`
// (una tx reward reale porta 40+ chiavi null). Per questo i campi sono `T | null`:
// l'adapter normalizza con `?? undefined`, che cattura sia null sia undefined.
export interface RawTxWallet {
  type: string;
  tx_hash: string;
  block_height?: number | null;
  block_hash?: string | null;
  timestamp?: unknown;
  sender?: string | null;
  recipient?: string | null;
  counterparty?: string | null;
  from_address?: string | null;
  to_address?: string | null;
  uploader?: string | null;
  amount?: string | number | null;
  amount_numeric?: number | null;
  total_cost?: number | null;
  /** Precalcolato dal nodo: "sent" | "received". Presente e affidabile (verificato). */
  direction?: string | null;
  file_id?: string | null;
  file_name?: string | null;
  file_ids?: string[] | null;
  query_hash?: string | null;
  answer_hash?: string | null;
  smart_node_id?: string | null;
  // --- famiglia escrow/penalty/ownership: campi VERIFICATI su shared/transaction.py
  // (11/08/2026). NB: `escrow` NON e' un escrow di marketplace, e' una ricompensa
  // generata dal DAM verso uno storage node dopo la verifica dei chunk.
  // escrow / escrow_release / escrow_unlock:
  storage_node_id?: string | null;
  storage_node_address?: string | null;
  escrow_amount?: string | null;
  release_amount?: string | null;
  verification_period?: number | null;
  chunks_verified?: number | null;
  dam_address?: string | null;
  escrow_tx_hash?: string | null;
  // penalty:
  target_node_id?: string | null;
  target_node_address?: string | null;
  penalty_score?: number | null;
  evidence_hash?: string | null;
  verification_type?: string | null;
  // ownership_request / accept / reject / cancel:
  request_id?: string | null;
  current_owner?: string | null;
  new_owner?: string | null;
  asking_price?: string | null;
  ownership_message?: string | null;
  // update_digital_asset_price / _visibility:
  owner_address?: string | null;
  new_price?: string | null;
  old_price?: string | null;
  visibility?: string | null;
  update_reason?: string | null;
  // freeze / rollback (governance multisig 4/5):
  target_address?: string | null;
  duration_blocks?: number | null;
  target_tx_hash?: string | null;
  reason?: string | null;
  // update_chunk_location:
  old_node_id?: string | null;
  new_node_id?: string | null;
  migration_reason?: string | null;
  reward_type?: string | null;
  [k: string]: unknown;
}

// tx da /transaction/{hash}
export interface RawTxDetail {
  type: string;
  tx_hash: string;
  block_height?: number;
  block_hash?: string;
  timestamp?: unknown;
  sender?: string | null;
  recipient?: string | null;
  to_address?: string | null;
  uploader?: string | null;
  wallet_address?: string | null;
  smart_node_wallet?: string | null;
  amount?: string | number | null;
  cost?: number | null;
  file_ids?: string[] | null;
  query_hash?: string | null;
  answer_hash?: string | null;
  smart_node_id?: string | null;
  nonce?: string | number | null;
  sig?: string | null;
  pub?: string | null;
  [k: string]: unknown;
}

// tx dentro /block/{height}.body.txs (scheletrica)
export interface RawTxInBlock {
  type: string;
  tx_hash: string;
  block_height?: number;
  timestamp?: unknown;
  sender?: string;
  recipient?: string;
  amount?: string | number;
  [k: string]: unknown;
}

// item di /blocks
export interface RawBlockListItem {
  height?: number;
  hash?: string;
  miner?: string;
  timestamp?: unknown; // { timestamp: "..." }
  tx_count?: number;
  [k: string]: unknown;
}

// /block/{height} — annidato
export interface RawBlockDetail {
  block?: {
    height?: number;
    header?: {
      hash?: string;
      height?: number;
      prev_hash?: string;
      num_txs?: number;
      nonce?: number;
      magisters_list?: string[];
    };
    body?: { txs?: RawTxInBlock[] };
    node?: {
      miner_address?: string;
      node_id?: string;
      timestamp?: unknown;
    };
  };
  status?: string;
}

export interface RawBlockchainInfo {
  blockchain?: {
    current_block?: number;
    last_block_hash?: string;
    last_block_hash_full?: string;
    mempool_size?: number;
    total_wallets?: number;
  };
  node?: { node_id?: string; node_type?: string; is_miner?: boolean };
  timestamp?: number;
  status?: string;
}

export interface RawWalletTxResponse {
  address?: string;
  /** Saldo reale e aggiornato del wallet. Questo SI' e' un dato globale. */
  balance?: number;
  /**
   * ⚠️ AGGREGATI PER-PAGINA, NON TOTALI DEL WALLET. Verificato 10/08/2026 sul nodo:
   *   limit=2  -> tx_count: 2,  total_received: 69.6   (= 34.8 x 2)
   *   limit=10 -> tx_count: 10, total_received: 348.0  (= 34.8 x 10)
   * Sono la somma/conteggio delle sole tx restituite in `transactions`.
   * NON usarli per popolare Address.totalSent / totalReceived / txCount:
   * darebbero numeri falsi (es. "0 BZT inviati" su un wallet da 2.2M BZT).
   * I totali reali richiedono un endpoint dedicato lato nodo (richiesta aperta a Enrico).
   */
  total_sent?: number;
  total_received?: number;
  tx_count?: number;
  limit?: number;
  offset?: number;
  transactions?: RawTxWallet[];
  status?: string;
}

export interface RawBalanceResponse {
  address?: string;
  balance: number | string;
  governance?: { is_frozen?: boolean };
}