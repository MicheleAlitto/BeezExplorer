# Beez Explorer

Block explorer per la blockchain Beez. Frontend React standalone, integrato con la testnet reale.

## Stack
Vite · React 18 · TypeScript (strict) · React Router · TanStack Query · Tailwind CSS

## Avvio locale

Requisiti: Node 18+

```bash
cp .env.example .env   # su Windows: copy .env.example .env
npm install
npm run dev
```

Aprire l'URL indicato in console (di norma http://localhost:5173).

Senza il passo `.env` l'app parte ma nessuna pagina carica dati: il proxy di
sviluppo non ha un nodo verso cui inoltrare le chiamate.

## Configurazione (`.env`)

| Variabile | Uso |
|---|---|
| `VITE_API_MODE` | `live` = chain reale (default) · `mock` = chain finta con seed fisso, per sviluppo offline |
| `VITE_DEV_PROXY_TARGET` | Nodo verso cui il proxy Vite inoltra `/api` e `/wallet`. Solo sviluppo. |
| `VITE_NODE_URLS` | Produzione: lista di chain node separati da virgola. In sviluppo va lasciata vuota (si usa il proxy). |

## Architettura API

Interfaccia unica in `src/api/index.ts`: le pagine non sanno quale implementazione
(mock o live) stanno usando. Tipi a due livelli in `src/types/chain.ts` — dominio
(UI) e wire (payload reali del nodo) — con adattamento in `src/api/adapter.ts`.

Selezione del nodo in produzione: sticky con fallback. Si usa il primo nodo di
`VITE_NODE_URLS` finché risponde; si passa al successivo solo su errore di
connessione (mai su 404/500). Dettagli nei commenti di `src/api/live.ts`.

## Endpoint del nodo utilizzati

| Metodo | Endpoint |
|---|---|
| GET | `/api/blockchain/info` |
| GET | `/api/blockchain/blocks?limit=N&offset=M` |
| GET | `/api/blockchain/block/{height}` |
| GET | `/api/blockchain/block/hash/{hash}` |
| GET | `/api/blockchain/transaction/{hash}` |
| GET | `/api/blockchain/wallet/{addr}/transactions?limit=N&offset=M` |
| GET | `/wallet/balance?address=...` (fuori da `/api`) |

Note operative documentate nei commenti di `src/types/chain.ts` e `src/api/live.ts`,
tra cui: gli aggregati `tx_count`/`total_sent`/`total_received` dell'endpoint wallet
sono per-pagina e non per-wallet; gli pseudo-address di sistema (`FROZEN_POOL`,
`BEEZBASE`) non sono wallet e non vengono linkati.

## Deploy

Build statica: `npm run build` → `dist/`.

Il nodo espone solo HTTP: servendo l'explorer in HTTPS, il browser blocca le
chiamate dirette (mixed content). In produzione serve quindi un proxy lato hosting.

Su Netlify si configura in `public/_redirects` con due regole di proxy verso il
chain node più la regola SPA:

```
/api/*     http://<NODO>:5000/api/:splat     200!
/wallet/*  http://<NODO>:5000/wallet/:splat  200!
/*         /index.html                       200
```

L'ordine conta: Netlify applica la prima regola che fa match. Lo status `200!`
forza il rewrite invece del redirect.

`_redirects` è un file statico e non interpola variabili d'ambiente: l'indirizzo
del nodo va scritto direttamente nel file al momento del deploy.