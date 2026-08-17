import { useState } from "react";
import { Search, Copy, ArrowRight, ChevronDown, ArrowUpRight, ArrowDownLeft, Hexagon } from "lucide-react";

const SECTIONS = [
  { id: "cosa-e", label: "Cos'è l'Explorer" },
  { id: "navigazione", label: "Navigazione" },
  { id: "ricerca", label: "Ricerca globale" },
  { id: "home", label: "Home" },
  { id: "blocchi", label: "Blocchi" },
  { id: "transazioni", label: "Transazioni" },
  { id: "wallet", label: "Wallet" },
  { id: "tipi", label: "Tipi di transazione" },
  { id: "consigli", label: "Consigli pratici" },
  { id: "faq", label: "Domande frequenti" },
];

const TX_TYPES = [
  { type: "transfer", desc: "Trasferimento di BZT tra due wallet.", badge: "bg-blue-50 text-blue-700" },
  { type: "upload", desc: "Caricamento di un file sullo storage distribuito.", badge: "bg-emerald-100 text-emerald-700" },
  { type: "smart_query", desc: "Interrogazione a un nodo AI (RAG), in linguaggio naturale.", badge: "bg-violet-100 text-violet-700" },
  { type: "knowledge_query", desc: "Query a pagamento su una collezione pubblicata sul Knowledge Marketplace.", badge: "bg-amber-50 text-amber-700" },
  { type: "escrow", desc: "Importo trattenuto in garanzia fino all'erogazione del servizio.", badge: "bg-indigo-100 text-indigo-700" },
  { type: "freeze", desc: "Blocco temporaneo di fondi o dati.", badge: "bg-sky-100 text-sky-700" },
  { type: "rollback", desc: "Ripristino a uno stato precedente.", badge: "bg-amber-100 text-amber-700" },
  { type: "penalty", desc: "Penalità applicata a un nodo.", badge: "bg-red-100 text-red-700" },
  { type: "update_chunk_location", desc: "Aggiornamento della posizione di un chunk nello storage.", badge: "bg-slate-100 text-slate-600" },
  { type: "ownership_request", desc: "Richiesta di trasferimento proprietà di un asset digitale.", badge: "bg-fuchsia-100 text-fuchsia-700" },
  { type: "ownership_accept", desc: "Accettazione del trasferimento di proprietà.", badge: "bg-emerald-100 text-emerald-700" },
  { type: "ownership_reject", desc: "Rifiuto del trasferimento di proprietà.", badge: "bg-red-100 text-red-700" },
  { type: "ownership_cancel", desc: "Annullamento della richiesta.", badge: "bg-slate-100 text-slate-600" },
  { type: "update_digital_asset_price", desc: "Modifica del prezzo di un asset digitale.", badge: "bg-amber-50 text-amber-700" },
  { type: "update_digital_asset_visibility", desc: "Modifica della visibilità pubblica/privata di un asset.", badge: "bg-slate-100 text-slate-600" },
];

const FAQS = [
  { q: "Cos'è un blocco?", a: "Un pacchetto di transazioni confermate e registrate in modo permanente sulla chain, identificato da un numero progressivo (altezza) e da un hash univoco." },
  { q: "Cos'è un hash?", a: "Un codice di 64 caratteri che identifica in modo univoco un blocco o una transazione." },
  { q: "Cos'è un wallet?", a: "L'indirizzo che identifica un partecipante alla rete Beez, dove sono depositati i BZT." },
  { q: "Serve un account per usare l'Explorer?", a: "No. La consultazione è libera e gratuita: non serve registrarsi né collegare un wallet." },
  { q: "Un indirizzo che cerco risulta senza transazioni: è normale?", a: "Sì, se non ha ancora inviato o ricevuto nulla. Verifica comunque di aver incollato l'indirizzo per intero." },
  { q: "Perché il pulsante \"successivo\" su un blocco è disattivato?", a: "Perché quel blocco è già l'ultimo della chain. Vale lo stesso per \"precedente\" sul blocco genesi." },
  { q: "Posso modificare o cancellare una transazione dall'Explorer?", a: "No. L'Explorer è di sola consultazione: mostra dati già registrati sulla chain, senza possibilità di intervenire su di essi." },
  { q: "Vedo una pagina \"non trovata\": cosa è successo?", a: "L'indirizzo, l'hash o l'altezza inseriti non corrispondono a nulla sulla chain, oppure il link è scritto in modo errato." },
  { q: "Posso condividere il link a un blocco o una transazione specifica?", a: "Sì: ogni pagina di dettaglio ha un proprio indirizzo web, copiabile e condivisibile così com'è." },
];

const SEARCH_EXAMPLES = [
  { icon: "128", label: "Altezza del blocco", result: "Blocco" },
  { icon: "a1b2…f6a7", label: "Hash della transazione (64 caratteri)", result: "Transazione" },
  { icon: "bez1a2…", label: "Indirizzo wallet", result: "Wallet" },
];

export default function Guide() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div>
        <div className="flex items-center gap-2">
          <Hexagon className="h-6 w-6 text-amber-500" strokeWidth={2.2} />
          <h1 className="text-2xl font-semibold text-slate-900">Guida Utente</h1>
        </div>
        <p className="mt-1 text-sm text-slate-600">Come muoversi in Beez Explorer.</p>
      </div>

      <nav className="rounded-xl border border-blue-100 bg-white p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">In questa guida</p>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-blue-600 hover:text-blue-700 hover:underline">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <section id="cosa-e" className="rounded-xl border border-blue-100 bg-white">
        <h2 className="border-b-2 border-blue-100 px-4 py-3 text-sm font-medium text-slate-900">Cos'è l'Explorer</h2>
        <p className="p-4 text-sm text-slate-700">
          Beez Explorer è lo strumento per consultare l'attività della blockchain Beez: blocchi, transazioni e
          wallet, senza bisogno di eseguire un nodo proprio. È di sola consultazione, gratuito e non richiede
          account: si apre e si cerca.
        </p>
      </section>

      <section id="navigazione" className="rounded-xl border border-blue-100 bg-white">
        <h2 className="border-b-2 border-blue-100 px-4 py-3 text-sm font-medium text-slate-900">Navigazione</h2>
        <div className="space-y-3 p-4 text-sm text-slate-700">
          <p>
            Ogni hash, indirizzo o altezza di blocco che vedi è un link — in ogni direzione: dal blocco alle
            transazioni che contiene, dalla transazione ai wallet coinvolti, dal wallet di nuovo alle sue
            transazioni.
          </p>
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs font-medium">
            <span className="rounded-md bg-white px-2 py-1 text-blue-700 shadow-sm">Blocco</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="rounded-md bg-white px-2 py-1 text-blue-700 shadow-sm">Transazione</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="rounded-md bg-white px-2 py-1 text-blue-700 shadow-sm">Wallet</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="rounded-md bg-white px-2 py-1 text-blue-700 shadow-sm">di nuovo Transazioni</span>
          </div>
        </div>
      </section>

      <section id="ricerca" className="rounded-xl border border-blue-100 bg-white">
        <h2 className="border-b-2 border-blue-100 px-4 py-3 text-sm font-medium text-slate-900">Ricerca globale</h2>
        <div className="space-y-3 p-4 text-sm text-slate-700">
          <p>La barra di ricerca in alto riconosce automaticamente cosa hai incollato:</p>
          <div className="space-y-2">
            {SEARCH_EXAMPLES.map((r) => (
              <div
                key={r.label}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-slate-100 px-3 py-2"
              >
                <code className="rounded bg-slate-50 px-1.5 py-0.5 font-mono text-xs text-slate-600">{r.icon}</code>
                <span className="text-xs text-slate-500">{r.label}</span>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-xs font-medium text-blue-700">{r.result}</span>
              </div>
            ))}
          </div>
          <p className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <Search className="h-3.5 w-3.5" /> Scorciatoia: premi
            <kbd className="rounded border border-slate-300 bg-slate-50 px-1 font-mono">/</kbd>
            da qualsiasi pagina per aprire subito la ricerca.
          </p>
        </div>
      </section>

      <section id="home" className="rounded-xl border border-blue-100 bg-white">
        <h2 className="border-b-2 border-blue-100 px-4 py-3 text-sm font-medium text-slate-900">Home</h2>
        <ul className="list-disc space-y-1.5 p-4 pl-8 text-sm text-slate-700">
          <li>Mostra gli ultimi blocchi prodotti e le ultime transazioni.</li>
          <li>Si aggiorna automaticamente, senza bisogno di ricaricare la pagina.</li>
          <li>Ogni riga è cliccabile verso il proprio dettaglio.</li>
        </ul>
      </section>

      <section id="blocchi" className="rounded-xl border border-blue-100 bg-white">
        <h2 className="border-b-2 border-blue-100 px-4 py-3 text-sm font-medium text-slate-900">Blocchi</h2>
        <div className="space-y-3 p-4 text-sm text-slate-700">
          <p>
            <strong className="text-slate-900">Lista:</strong> tutti i blocchi, dal più recente, con paginazione,
            altezza, orario, numero di transazioni e nodo che ha generato il blocco.
          </p>
          <p>
            <strong className="text-slate-900">Dettaglio:</strong> hash completo, transazioni contenute, e
            navigazione al blocco precedente/successivo.
          </p>
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-xs font-medium text-slate-400">
            <span>← Precedente</span>
            <span className="rounded-md bg-white px-2 py-1 text-blue-700 shadow-sm">Blocco #128</span>
            <span className="cursor-not-allowed opacity-50">Successivo →</span>
          </div>
          <p className="text-xs text-slate-500">I pulsanti si disattivano da soli agli estremi della chain.</p>
        </div>
      </section>

      <section id="transazioni" className="rounded-xl border border-blue-100 bg-white">
        <h2 className="border-b-2 border-blue-100 px-4 py-3 text-sm font-medium text-slate-900">Transazioni</h2>
        <p className="p-4 text-sm text-slate-700">
          Ogni transazione mostra hash, tipo, mittente e destinatario (cliccabili), importo in BZT, fee e il blocco
          di appartenenza.
        </p>
      </section>

      <section id="wallet" className="rounded-xl border border-blue-100 bg-white">
        <h2 className="border-b-2 border-blue-100 px-4 py-3 text-sm font-medium text-slate-900">Wallet</h2>
        <div className="space-y-3 p-4 text-sm text-slate-700">
          <p>Mostra saldo attuale in BZT e storico transazioni, paginato. Ogni riga è etichettata:</p>
          <div className="flex flex-wrap gap-3">
            <span className="flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
              <ArrowDownLeft className="h-3 w-3" /> IN — ricevuta
            </span>
            <span className="flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-600">
              <ArrowUpRight className="h-3 w-3" /> OUT — inviata
            </span>
          </div>
        </div>
      </section>

      <section id="tipi" className="rounded-xl border border-blue-100 bg-white">
        <h2 className="border-b-2 border-blue-100 px-4 py-3 text-sm font-medium text-slate-900">Tipi di transazione</h2>
        <p className="px-4 pt-3 text-xs text-slate-500">
          La chain registra non solo trasferimenti, ma tutte le operazioni della rete: storage distribuito,
          marketplace di conoscenza e AI, gestione degli asset digitali.
        </p>
        <ul className="divide-y-2 divide-blue-100">
          {TX_TYPES.map((t) => (
            <li key={t.type} className="flex flex-wrap items-start gap-x-3 gap-y-1 px-4 py-2.5">
              <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${t.badge}`}>
                {t.type.replace(/_/g, " ")}
              </span>
              <span className="flex-1 text-sm text-slate-600">{t.desc}</span>
            </li>
          ))}
        </ul>
      </section>

      <section id="consigli" className="rounded-xl border border-blue-100 bg-white">
        <h2 className="border-b-2 border-blue-100 px-4 py-3 text-sm font-medium text-slate-900">Consigli pratici</h2>
        <ul className="space-y-2 p-4 text-sm text-slate-700">
          <li className="flex items-start gap-2">
            <Copy className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <span>Ogni hash o indirizzo ha un'icona di copia accanto: non serve selezionare il testo a mano.</span>
          </li>
          <li className="flex items-start gap-2">
            <Search className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <span>
              I valori troncati (es.{" "}
              <code className="rounded bg-slate-50 px-1 font-mono text-xs">a1b2c3d4…e5f6a7</code>) mostrano il
              valore completo al passaggio del mouse.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
            <span>Ogni pagina di dettaglio ha un link diretto, condivisibile o salvabile nei preferiti.</span>
          </li>
        </ul>
      </section>

      <section id="faq" className="rounded-xl border border-blue-100 bg-white">
        <h2 className="border-b-2 border-blue-100 px-4 py-3 text-sm font-medium text-slate-900">Domande frequenti</h2>
        <div>
          {FAQS.map((f, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={f.q} className="border-b-2 border-blue-100 last:border-0">
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-slate-900"
                >
                  {f.q}
                  <ChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && <p className="px-4 pb-3 text-sm text-slate-600">{f.a}</p>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
