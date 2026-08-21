import type {
  Block,
  RawBalanceResponse,
  RawBlockDetail,
  RawBlockListItem,
  RawTxDetail,
  RawTxInBlock,
  RawTxWallet,
  Transaction,
  TxType,
  RawBlockchainInfo,
} from "../types/chain";

// Conversione wire -> dominio. Tarato sui PAYLOAD REALI (Postman, 10/08/2026).
// La tx ha TRE forme wire diverse a seconda dell'endpoint:
//   - RawTxWallet   da /wallet/{addr}/transactions  (ricca)
//   - RawTxDetail   da /transaction/{hash}           (cost, nonce UUID, pub/sig)
//   - RawTxInBlock  da /block/{height}.body.txs      (scheletrica)

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v.replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

/** Gestisce TUTTI i formati timestamp visti: ISO, "… UTC+HH:MM", epoch s/ms, {timestamp:…}. */
export function toMs(ts: unknown): number {
  if (ts == null) return 0;
  if (typeof ts === "object" && ts !== null && "timestamp" in ts) {
    return toMs((ts as { timestamp: unknown }).timestamp);
  }
  if (typeof ts === "number") return ts < 1e12 ? ts * 1000 : ts;
  if (typeof ts === "string") {
    const s = ts.trim();
    const m = s.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.\d+)?\s*UTC([+-]\d{2}:?\d{2})?/i);
    if (m) {
      const off = m[3] ? m[3].replace(/(\d{2}):?(\d{2})$/, "$1:$2") : "+00:00";
      const parsed = Date.parse(`${m[1]}T${m[2]}${off}`);
      if (Number.isFinite(parsed)) return parsed;
    }
    const direct = Date.parse(s);
    if (Number.isFinite(direct)) return direct;
    const asNum = Number(s);
    if (Number.isFinite(asNum)) return toMs(asNum);
  }
  return 0;
}


function txAmount(raw: Record<string, unknown>): number {
  if (typeof raw.amount_numeric === "number") return raw.amount_numeric;
  if (typeof raw.total_cost === "number") return raw.total_cost;
  const alt =
    raw.amount ?? raw.escrow_amount ?? raw.release_amount ?? raw.asking_price ?? raw.new_price;
  return num(alt);
}

function toUiType(raw: string): TxType {
  return (raw === "normal" ? "transfer" : raw) as TxType;
}

// --- da lista wallet (ricca) ---
export function adaptTxWallet(raw: RawTxWallet): Transaction {
  return {
    hash: raw.tx_hash,
    blockHeight: raw.block_height ?? 0,
    blockHash: raw.block_hash ?? undefined,
    timestamp: toMs(raw.timestamp),
    from: raw.sender ?? raw.uploader ?? raw.from_address ?? "",
    to: raw.recipient ?? raw.to_address ?? raw.counterparty ?? "",
    amount: txAmount(raw as unknown as Record<string, unknown>),
    type: toUiType(raw.type),
    direction: raw.direction ?? undefined,
    file_id: raw.file_id ?? undefined,
    file_name: raw.file_name ?? undefined,
    file_ids: raw.file_ids ?? undefined,
    query_hash: raw.query_hash ?? undefined,
    answer_hash: raw.answer_hash ?? undefined,
    smart_node_id: raw.smart_node_id ?? undefined,
  };
}

// --- da /transaction/{hash} ---
export function adaptTxDetail(raw: RawTxDetail): Transaction {
  return {
    hash: raw.tx_hash,
    blockHeight: raw.block_height ?? 0,
    blockHash: raw.block_hash ?? undefined,
    timestamp: toMs(raw.timestamp),
    from: raw.sender ?? raw.wallet_address ?? raw.uploader ?? "",
    to: raw.recipient ?? raw.smart_node_wallet ?? raw.to_address ?? "",
    amount: typeof raw.cost === "number"
      ? raw.cost
      : txAmount(raw as unknown as Record<string, unknown>),
    type: toUiType(raw.type),
    file_ids: raw.file_ids ?? undefined,
    query_hash: raw.query_hash ?? undefined,
    answer_hash: raw.answer_hash ?? undefined,
    smart_node_id: raw.smart_node_id ?? undefined,
    sig: raw.sig ?? undefined,
    pub: raw.pub ?? undefined,
  };
}

// --- da /block/{height}.body.txs (scheletrica) ---
export function adaptTxInBlock(raw: RawTxInBlock, height: number): Transaction {
  return {
    hash: raw.tx_hash,
    blockHeight: raw.block_height ?? height,
    timestamp: toMs(raw.timestamp),
    from: raw.sender ?? "",
    to: raw.recipient ?? "",
    amount: num(raw.amount),
    type: toUiType(raw.type),
  };
}

// --- blocco: listing (/blocks) ---
export function adaptBlockListItem(raw: RawBlockListItem): Block {
  return {
    height: raw.height ?? 0,
    hash: raw.hash ?? "",
    prevHash: "", // non presente nel listing; solo nel dettaglio
    timestamp: toMs(raw.timestamp),
    forger: raw.miner ?? "",
    txCount: raw.tx_count ?? 0,
    transactions: [],
  };
}

// --- blocco: dettaglio (/block/{height}) — annidato header/body/node ---
export function adaptBlockDetail(raw: RawBlockDetail): Block {
  const b = raw.block ?? ({} as NonNullable<RawBlockDetail["block"]>);
  const header = b.header ?? {};
  const txs = b.body?.txs ?? [];
  return {
    height: header.height ?? b.height ?? 0,
    hash: header.hash ?? "",
    prevHash: header.prev_hash ?? "",
    timestamp: toMs(b.node?.timestamp ?? txs[0]?.timestamp),
    forger: b.node?.miner_address ?? "",
    txCount: header.num_txs ?? txs.length,
    transactions: txs.map((t) => t.tx_hash),
    txs: txs.map((t) => adaptTxInBlock(t, header.height ?? b.height ?? 0)),

  };
}

export function extractBlockDetailTxs(raw: RawBlockDetail): Transaction[] {
  const b = raw.block;
  const height = b?.header?.height ?? b?.height ?? 0;
  const txs = b?.body?.txs ?? [];
  return txs.map((t) => adaptTxInBlock(t, height));
}

export function adaptInfo(raw: RawBlockchainInfo) {
  const bc = raw.blockchain ?? {};
  return {
    height: bc.current_block ?? 0,
    lastBlockHash: bc.last_block_hash_full ?? bc.last_block_hash ?? undefined,
    mempoolSize: bc.mempool_size ?? undefined,
    totalWallets: bc.total_wallets ?? undefined,
    nodeId: raw.node?.node_id ?? undefined,
  };
}

export function adaptBalance(raw: RawBalanceResponse): number {
  return num(raw.balance);
}