import type { Address, Block, Transaction, TxType } from "../types/chain";
import type { ExplorerApi } from "./index";

// ---- Generatore di chain finta ma COERENTE ----
// I blocchi contengono tx che esistono davvero, le tx puntano ad address reali
// delle fixture: la navigazione tra pagine non si rompe mai.

const rand = mulberry32(42); // seed fisso: stessa chain ad ogni reload

function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const hex = (len: number) =>
  Array.from({ length: len }, () => "0123456789abcdef"[Math.floor(rand() * 16)]).join("");

const TX_TYPES: TxType[] = [
  "transfer", "transfer", "transfer", "transfer",
  "upload", "upload",
  "smart_query", "smart_index",
  "reward", "datrone_reward",
];

// 30 address
const addresses: Address[] = Array.from({ length: 30 }, () => ({
  address: "bez" + hex(40),
  balance: 0,
  txCount: 0,
}));

const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

// 50 blocchi, ~4 tx a blocco, timestamp ogni ~30s a ritroso da ora
const NOW = Date.now();
const blocks: Block[] = [];
const txs: Transaction[] = [];

for (let h = 1; h <= 50; h++) {
  const blockTxs: Transaction[] = Array.from({ length: 1 + Math.floor(rand() * 6) }, () => {
    const from = pick(addresses);
    let to = pick(addresses);
    while (to === from) to = pick(addresses);
    const tx: Transaction = {
      hash: hex(64),
      blockHeight: h,
      timestamp: NOW - (50 - h) * 30_000 + Math.floor(rand() * 20_000),
      from: from.address,
      to: to.address,
      amount: Math.round(rand() * 500 * 100) / 100,
      type: pick(TX_TYPES),
      fee: 0.01,
    };
    from.txCount = (from.txCount ?? 0) + 1; to.txCount = (to.txCount ?? 0) + 1;
    from.balance -= tx.amount; to.balance += tx.amount;
    return tx;
  });
  txs.push(...blockTxs);
  blocks.push({
    height: h,
    hash: hex(64),
    prevHash: h === 1 ? "0".repeat(64) : blocks[h - 2].hash,
    timestamp: NOW - (50 - h) * 30_000,
    forger: pick(addresses).address,
    txCount: blockTxs.length,
    transactions: blockTxs.map((t) => t.hash),
  });
}
addresses.forEach((a) => (a.balance = Math.max(0, Math.round((a.balance + 1000) * 100) / 100)));

// ---- Helper ----
const delay = () => new Promise((r) => setTimeout(r, 200 + Math.random() * 300));
// ---- Implementazione ----
export const mockApi: ExplorerApi = {
  async getBlockchainInfo() {
    await delay();
    return { height: blocks.length, totalTransactions: txs.length, nodeCount: 12 };
  },
  async getBlocks(limit, offset) {
    await delay();
    const sorted = [...blocks].sort((a, b) => b.height - a.height);
    return { items: sorted.slice(offset, offset + limit), limit, offset, total: sorted.length };
  },
  async getBlockByHeight(height) {
    await delay();
    return blocks.find((b) => b.height === height) ?? null;
  },
  async getBlockByHash(hash) {
    await delay();
    return blocks.find((b) => b.hash === hash) ?? null;
  },
  async getTransaction(hash) {
    await delay();
    return txs.find((t) => t.hash === hash) ?? null;
  },
  async getWalletBalance(addr) {
    await delay();
    return addresses.find((a) => a.address === addr) ?? null;
  },
  async getWalletTransactions(addr, limit, offset, txType = "all") {
    await delay();
    const list = txs
      .filter((t) => t.from === addr || t.to === addr)
      .filter((t) => txType === "all" || t.type === txType || (txType === "normal" && t.type === "transfer"))
      .sort((a, b) => b.timestamp - a.timestamp);
    return { items: list.slice(offset, offset + limit), limit, offset, total: list.length };
  },
  async getLatestBlocks(limit = 10) {
    await delay();
    return [...blocks].sort((a, b) => b.height - a.height).slice(0, limit);
  },
  async getLatestTransactions(limit = 10) {
    await delay();
    return [...txs].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  },
  async search(query) {
    await delay();
    const q = query.trim();
    if (/^\d+$/.test(q)) {
      const block = blocks.find((b) => b.height === Number(q));
      return block ? { kind: "block", block } : { kind: "none" };
    }
    if (q.startsWith("bez")) {
      const address = addresses.find((a) => a.address === q);
      return address ? { kind: "address", address } : { kind: "none" };
    }
    if (/^[0-9a-f]{64}$/i.test(q)) {
      const tx = txs.find((t) => t.hash === q);
      if (tx) return { kind: "tx", tx };
      const block = blocks.find((b) => b.hash === q);
      if (block) return { kind: "block", block };
    }
    return { kind: "none" };
  },
};