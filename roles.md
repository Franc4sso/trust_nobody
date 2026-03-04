# Trust Nobody - Ruoli (Esistenti + Nuovi)

## Ruoli Esistenti

### Serial Killer (Killer)
- **Fazione**: Killer
- **Potere**: Ogni notte puo' uccidere o minacciare un NPC
- **Win condition**: Tutti gli NPC eliminati OPPURE cittadini vivi <= killer vivi
- **Note**: Se minaccia, l'NPC da' indizi fuorvianti

### Guardiano (Cittadino)
- **Fazione**: Cittadini
- **Potere**: Ogni notte protegge un NPC dall'attacco del killer
- **Note**: Se protegge il bersaglio del killer, l'uccisione e' bloccata

### Medium (Cittadino)
- **Fazione**: Cittadini
- **Potere**: Dopo ogni eliminazione per voto, scopre in segreto se l'eliminato era killer
- **Note**: Info riservata, solo il medium (e il master) la vedono

### Analista (Cittadino)
- **Fazione**: Cittadini
- **Potere**: Una volta a partita, di notte, attiva un potere per ricevere un indizio bonus sui pattern di voto
- **Note**: One-shot, deve scegliere il momento giusto

### Cittadino (Cittadino)
- **Fazione**: Cittadini
- **Potere**: Nessuno
- **Note**: Partecipa alle votazioni, deduce

---

## Nuovi Ruoli Proposti

### RUOLI CITTADINI NOTTURNI

#### Veggente
- **Fazione**: Cittadini
- **Potere**: Ogni notte sceglie un giocatore e scopre se e' Serial Killer o no
- **Quando**: Da 7+ giocatori (1 per partita)
- **Bilanciamento**: E' il bersaglio principale del killer (se scoperto), deve nascondersi bene. Non puo' verificare se stesso.
- **Fase**: Notte, dopo il killer ma prima del mattino

#### Spia
- **Fazione**: Cittadini
- **Potere**: Ogni notte sceglie un giocatore e scopre se ha agito quella notte (ha usato un potere o no)
- **Quando**: Da 7+ giocatori (1 per partita)
- **Bilanciamento**: Non rivela il ruolo, solo se e' stato "attivo". Utile per smascherare killer ma puo' confondere con altri ruoli attivi (Guardiano, Veggente).
- **Fase**: Notte, agisce per ultima (deve sapere chi ha agito)

#### Esorcista
- **Fazione**: Cittadini
- **Potere**: Ogni notte sceglie un giocatore e lo "blocca": quel giocatore non puo' usare il suo potere quella notte
- **Quando**: Da 8+ giocatori (1 per partita)
- **Bilanciamento**: Se blocca il killer, l'uccisione non avviene. Ma se blocca un alleato (Guardiano, Veggente) per sbaglio, lo disabilita. Arma a doppio taglio.
- **Fase**: Notte, agisce per prima (il blocco si applica prima delle altre azioni)

#### Becchino
- **Fazione**: Cittadini
- **Potere**: Ogni notte puo' "esaminare" un NPC morto e scoprire quale killer specifico lo ha ucciso
- **Quando**: Da 8+ giocatori (1 per partita)
- **Bilanciamento**: Inutile la prima notte (nessun NPC morto). Diventa piu' potente col passare delle notti. Con 2+ killer, aiuta a distinguere chi ha fatto cosa.
- **Fase**: Notte, ordine indifferente

### RUOLI KILLER NOTTURNI

#### Infiltrato
- **Fazione**: Killer
- **Potere**: Ogni notte sceglie un giocatore: il mattino dopo, gli hint dell'NPC punteranno verso quel giocatore come sospetto (inquina le prove)
- **Quando**: Da 8+ giocatori (1 per partita, in aggiunta ai Serial Killer)
- **Bilanciamento**: Non uccide direttamente, ma manipola le informazioni. I cittadini ricevono indizi falsi e sospettano degli innocenti.
- **Fase**: Notte, agisce in aggiunta al killer principale

#### Stalker
- **Fazione**: Killer
- **Potere**: Ogni notte sceglie un giocatore e scopre il suo ruolo. L'informazione e' condivisa con gli altri killer.
- **Quando**: Da 9+ giocatori (1 per partita, sostituisce un Serial Killer)
- **Bilanciamento**: Non uccide, ma da' informazioni preziose ai killer (trovare il Guardiano, il Veggente, ecc.). Sostituisce un killer, quindi la fazione ha meno potere offensivo.
- **Fase**: Notte, ordine indifferente

#### Sabotatore
- **Fazione**: Killer
- **Potere**: Ogni notte puo' "sabotare" un NPC vivo: quell'NPC il giorno dopo non dara' hint (resta muto)
- **Quando**: Da 8+ giocatori (1 per partita, sostituisce un Serial Killer)
- **Bilanciamento**: Alternativa all'uccisione. Toglie informazioni senza attirare sospetti (nessun NPC muore, ma nemmeno parla). Piu' sottile ma meno letale di un SK.
- **Fase**: Notte, al posto dell'azione killer normale

#### Avvelenatore
- **Fazione**: Killer
- **Potere**: Invece di uccidere un NPC, avvelena un GIOCATORE. Il giocatore avvelenato muore alla fine del giorno successivo (se non curato).
- **Quando**: Da 8+ giocatori (1 per partita, sostituisce un Serial Killer)
- **Bilanciamento**: Effetto ritardato (il giocatore ha un intero giorno per essere "curato" dal Guardiano). Il Guardiano puo' proteggere il giocatore avvelenato invece di un NPC.
- **Cura**: Il Guardiano puo' scegliere di proteggere un giocatore invece di un NPC → annulla il veleno
- **Fase**: Notte, al posto dell'azione killer normale

### RUOLI AMBIGUI / NEUTRALI

#### Folle (Jester)
- **Fazione**: Neutrale
- **Potere**: Vince se viene eliminato per voto dai giocatori. Non e' ne' killer ne' cittadino.
- **Quando**: Da 7+ giocatori (1 per partita)
- **Bilanciamento**: Distrae le votazioni, crea paranoia. Non contribuisce alla vittoria di nessuna fazione. Se muore, la partita NON finisce (continua per le altre fazioni).
- **Win condition**: Essere eliminato per voto (vince solo lui, la partita continua)
- **Fase**: Passivo

#### Lupo Solitario
- **Fazione**: Killer (ma indipendente)
- **Potere**: E' un killer ma vince SOLO se e' l'ultimo killer rimasto vivo alla fine della partita.
- **Quando**: Da 9+ giocatori (1 per partita, sostituisce un Serial Killer)
- **Bilanciamento**: I killer normali non sanno chi e'. Potrebbe votare per eliminare gli altri killer. Crea conflitto interno nella fazione killer.
- **Win condition**: Essere l'unico killer vivo quando i killer vincono
- **Fase**: Agisce di notte come un killer normale (il master sa chi e')

---

## Meccanica Prigione (giocatori eliminati per voto)

I giocatori eliminati per voto non escono dal gioco completamente: vengono mandati in "prigione" e possono ancora influenzare la partita in modo limitato.

### Ultima Volonta'
- **Quando**: Subito dopo l'eliminazione per voto
- **Meccanica**: Il giocatore eliminato puo' lasciare un messaggio breve (una frase) che sara' visibile a tutti il mattino successivo
- **Note**: Puo' dire la verita' o mentire. Un killer eliminato puo' depistare anche dalla prigione. Il master mostra il messaggio durante la fase Morning.

### Fantasma Vendicativo
- **Quando**: La notte immediatamente dopo la sua eliminazione (una sola volta)
- **Meccanica**: Il giocatore eliminato sceglie un giocatore vivo e lo "maledice": quel giocatore non potra' votare il giorno successivo
- **Note**: Non sa se sta punendo un innocente o un killer. Aggiunge un elemento di vendetta e strategia post-mortem. Il master gestisce la scelta durante la fase Night.

### Testimonianza Postuma
- **Quando**: Automatico, subito dopo l'eliminazione
- **Meccanica**: Viene rivelato automaticamente l'ultimo giocatore per cui l'eliminato aveva votato nelle votazioni precedenti
- **Note**: Da' un dato concreto su cui ragionare. Se l'eliminato era un killer, il suo ultimo voto potrebbe rivelare chi stava cercando di incastrare.

---

## Distribuzione Ruoli Aggiornata (Proposta)

### Configurazione Base (attuale, senza nuovi ruoli)
| Giocatori | SK | Guardiano | Medium | Analista | Cittadini |
|-----------|----|-----------| -------|----------|-----------|
| 4         | 1  | 1         | 0      | 0        | 2         |
| 5         | 1  | 1         | 0      | 0        | 3         |
| 6         | 1  | 1         | 0      | 1        | 3         |
| 7         | 2  | 1         | 1      | 1        | 2         |
| 8         | 2  | 1         | 1      | 1        | 3         |
| 9         | 2  | 1         | 1      | 1        | 4         |
| 10        | 3  | 1         | 1      | 1        | 4         |

### Ruoli Opzionali Notturni (attivabili dal master nel setup)

#### Cittadini
- **Veggente**: Sostituisce 1 Cittadino (da 7+)
- **Spia**: Sostituisce 1 Cittadino (da 7+)
- **Esorcista**: Sostituisce 1 Cittadino (da 8+)
- **Becchino**: Sostituisce 1 Cittadino (da 8+)

#### Killer
- **Infiltrato**: Si aggiunge ai killer (da 8+)
- **Stalker**: Sostituisce 1 Serial Killer (da 9+)
- **Sabotatore**: Sostituisce 1 Serial Killer (da 8+)
- **Avvelenatore**: Sostituisce 1 Serial Killer (da 8+)

#### Neutrali
- **Folle (Jester)**: Sostituisce 1 Cittadino (da 7+)
- **Lupo Solitario**: Sostituisce 1 Serial Killer (da 9+)

### Meccaniche Prigione (attivabili dal master nel setup)
- **Ultima Volonta'**: Attiva di default
- **Fantasma Vendicativo**: Opzionale (da 7+)
- **Testimonianza Postuma**: Opzionale (alternativa a Ultima Volonta')

---

## Note di Bilanciamento

- Il rapporto killer/cittadini deve restare circa 1:3 per partite equilibrate
- I ruoli con potere one-shot (Analista) bilanciano i ruoli con potere ogni-notte (Veggente, Guardiano, Spia)
- L'Esorcista e' potente ma rischioso: puo' bloccare alleati per errore
- Il Becchino scala col tempo: inutile all'inizio, decisivo a fine partita
- L'Infiltrato non uccide ma inquina le informazioni, rendendo gli hint inaffidabili
- Lo Stalker da' intel ai killer ma toglie un'uccisione (trade-off offensivo/informativo)
- Il Sabotatore e' piu' sottile di un SK: nessun morto ma nessun hint
- Il Folle aggiunge incertezza alle votazioni senza sbilanciare il rapporto di forza
- Il Lupo Solitario indebolisce i killer internamente, compensando l'aggiunta di un killer extra
- L'Avvelenatore e' piu' debole di un SK perche' la sua azione puo' essere curata
- La meccanica Prigione mantiene i giocatori eliminati coinvolti nel gioco
