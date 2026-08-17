import type { Address, Block, BlockchainInfo, Paginated, SearchResult, Transaction } from "../types/chain";
import { mockApi } from "./mock";
import { liveApi } from "./live";

// Interfaccia unica, modellata 1:1 sulle query di client_core (BeezShared):
// get_blockchain_info(), get_blocks(limit, offset), get_block_by_height(h),
// get_block_by_hash(hash), get_transaction(hash), get_wallet_balance(addr),
// get_wallet_transactions(addr, limit, offset, tx_type)
export interface ExplorerApi {
  getBlockchainInfo(): Promise<BlockchainInfo>;
  getBlocks(limit: number, offset: number): Promise<Paginated<Block>>;
  getBlockByHeight(height: number): Promise<Block | null>;
  getBlockByHash(hash: string): Promise<Block | null>;
  getTransaction(hash: string): Promise<Transaction | null>;
  getWalletBalance(address: string): Promise<Address | null>;
  getWalletTransactions(
    address: string,
    limit: number,
    offset: number,
    txType?: string // filtro lato nodo: "all" | tipo wire (es. "normal", "upload")
  ): Promise<Paginated<Transaction>>;
  // Comodità frontend (composte dalle precedenti):
  getLatestBlocks(limit?: number): Promise<Block[]>;
  getLatestTransactions(limit?: number): Promise<Transaction[]>;
  search(query: string): Promise<SearchResult>;
}

const mode = import.meta.env.VITE_API_MODE ?? "mock";
export const api: ExplorerApi = mode === "live" ? liveApi : mockApi;