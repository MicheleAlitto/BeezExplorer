// Parametri economici della chain Beez.
//
// FONTE: "Beez Network — Systematic Overview", BeezMaster Project, giugno 2026,
// §1.1 (genesis), §1.2 (block timing), §1.3 + tabella 1.2 (halving), §1.4 (Datrone).
// I valori NON sono esposti da alcun endpoint: il nodo non ha /supply, /params o
// /genesis (verificato con ~30 probe, 18/08/2026). Vanno quindi tenuti qui a mano
// e riallineati se il documento cambia.

/** Wallet BeezBase: pool di emissione mineraria, 60M BZT al genesis (tabella 1.1). */
export const BEEZBASE_POOL_ADDRESS = "bez3NW15n38RsDJrRKN4ppXXvARLaB7";

/** Allocazione iniziale del pool BeezBase, in BZT. */
export const BEEZBASE_POOL_GENESIS = 60_000_000;

/** Durata di ogni epoca di halving, in blocchi (tabella 1.2). */
export const EPOCH_BLOCKS = 453_600;

/** Reward per blocco in ciascuna epoca, in BZT (tabella 1.2). */
export const EPOCH_REWARDS = [34.8, 17.4, 8.7, 4.35] as const;

export interface HalvingInfo {
  /** 0 = genesis, 1-4 = epoche di emissione, 5 = post-minting. */
  epoch: number;
  /** BZT emessi per blocco in questa epoca. 0 dopo l'ultima. */
  rewardPerBlock: number;
  /** Altezza del primo blocco della prossima epoca. null se non ce n'e' una. */
  nextHalvingBlock: number | null;
  /** Blocchi mancanti al prossimo halving. null se non ce n'e' uno. */
  blocksToNext: number | null;
}

/**
 * Epoca di halving e reward corrente a una data altezza.
 * Epoca 1 = blocchi 1..453.600, epoca 2 = 453.601..907.200, e cosi' via.
 * Dopo il blocco 1.814.400 l'emissione si azzera (§1.6).
 */
export function halvingInfo(height: number): HalvingInfo {
  if (height < 1) {
    return { epoch: 0, rewardPerBlock: 0, nextHalvingBlock: 1, blocksToNext: 1 - height };
  }
  const idx = Math.floor((height - 1) / EPOCH_BLOCKS);
  if (idx >= EPOCH_REWARDS.length) {
    return { epoch: EPOCH_REWARDS.length + 1, rewardPerBlock: 0, nextHalvingBlock: null, blocksToNext: null };
  }
  return {
    epoch: idx + 1,
    rewardPerBlock: EPOCH_REWARDS[idx],
    nextHalvingBlock: (idx + 1) * EPOCH_BLOCKS + 1,
    blocksToNext: (idx + 1) * EPOCH_BLOCKS - height + 1,
  };
}

/**
 * Block time mediano dai timestamp dei blocchi noti, in millisecondi.
 * Mediana e non media: un singolo buco nella catena (nodo fermo, riavvio)
 * falserebbe la media, la mediana no. Serve almeno 2 blocchi.
 */
export function medianBlockTimeMs(timestamps: number[]): number | null {
  const sorted = [...timestamps].sort((a, b) => b - a);
  const deltas: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const d = sorted[i] - sorted[i + 1];
    if (d > 0) deltas.push(d);
  }
  if (deltas.length === 0) return null;
  deltas.sort((a, b) => a - b);
  const mid = Math.floor(deltas.length / 2);
  return deltas.length % 2 !== 0 ? deltas[mid] : (deltas[mid - 1] + deltas[mid]) / 2;
}

/** "3 g", "5 h", "12 min" — durata approssimata, unita' singola. */
export function humanDuration(ms: number): string {
  const min = ms / 60_000;
  if (min < 60) return `${Math.round(min)} min`;
  const h = min / 60;
  if (h < 48) return `${Math.round(h)} h`;
  const d = h / 24;
  if (d < 60) return `${Math.round(d)} g`;
  return `${Math.round(d / 30)} mesi`;
}

/** Formatta un numero di BZT con separatori italiani e decimali opzionali. */
export function bzt(n: number, decimals = 0): string {
  return n.toLocaleString("it-IT", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}