# Sistema Indizi — Trust Nobody

## Panoramica

Ogni mattina, **un NPC** parla e fornisce un indizio ai giocatori. L'indizio viene generato dinamicamente in base a:
- Chi e' l'NPC (le sue connessioni con i giocatori)
- Se l'NPC conosce un killer (ha un killer tra le connessioni)
- Se l'NPC e' stato minacciato la notte precedente
- Il round corrente (1-2 = early, 3-4 = mid, 5+ = late)

Il sistema usa **pool di frasi** divisi in generiche (senza nomi) e con nomi. La selezione cambia per fascia di round:
- **Early (1-2):** pick uniforme tra generiche e con nomi (confusione voluta)
- **Mid (3-4) e Late (5+):** `weightedPick` → **70% frasi con nomi, 30% generiche**

---

## Come viene scelto l'NPC che parla

(`nightResolution.js` → `selectHintNpc`)

1. **Se il killer ha minacciato un NPC** quella notte → parla **sempre** l'NPC minacciato (hint fuorviante)
2. Altrimenti, tra gli NPC vivi:
   - Escludi l'NPC che ha parlato il round precedente (no ripetizioni consecutive)
   - Preferisci NPC che non hanno **mai** parlato finora
   - Se tutti hanno gia' parlato, scegli random tra i candidati

---

## Struttura delle connessioni NPC-Giocatori

(`npcGenerator.js` → `buildConnectionMap`)

| Giocatori | NPC generati | Connessioni per NPC |
|-----------|-------------|---------------------|
| 4         | 3           | 1-2                 |
| 5         | 3           | 1-2                 |
| 6         | 4           | 2-3                 |
| 7         | 5           | 2-3                 |
| 8         | 6           | 2-3                 |
| 9         | 6           | 2-3                 |
| 10        | 7           | 2-4                 |

**Garanzie:**
- Ogni giocatore e' conosciuto da almeno 1 NPC
- Almeno 1 NPC conosce un killer

Le connessioni sono assegnate random, poi corrette per soddisfare le garanzie.

---

## I tre percorsi di generazione hint

### 1. NPC Innocente (`innocentHint`)
**Condizione:** l'NPC NON ha killer tra le connessioni

Dice cose tipo: "tra chi conosco va tutto bene, il pericolo e' altrove". Fa nomi dei suoi conoscenti per **scagionarli**.

| Round | Contenuto tipico |
|-------|-----------------|
| 1-2   | Atmosfera vaga, sensazioni. Se ha connessioni, dice che i suoi conoscenti sembrano a posto. |
| 3-4   | Piu' osservazione, nota tensione nei voti. Ribadisce che i suoi non sono coinvolti. |
| 5+    | Certezza: "i miei conoscenti non c'entrano, cercate altrove." |

### 2. NPC che conosce il Killer (`killerHint`)
**Condizione:** l'NPC ha almeno 1 killer tra le connessioni, e NON e' minacciato

Questo e' l'indizio **utile**. Fa nomi che includono **sempre** il killer, mescolato con innocenti.

| Round | Lista nomi usata | Selezione | Descrizione |
|-------|-----------------|-----------|-------------|
| 1-2   | `expanded` (fino a 5 nomi) | Uniforme (50/50 con generiche) | Killer annegato in una lista larga. Tono incerto: "uno di loro nasconde qualcosa". |
| 3-4   | `narrow` (killer + max 2 innocenti = 2-3 nomi) | 70% con nomi / 30% generiche | Cerchio si stringe. "Qualcuno tra X, Y, Z non dice la verita'." |
| 5+    | `focused` (killer + 2-3 innocenti, **minimo 3 nomi**) | 70% con nomi / 30% generiche | Quasi diretto. "Guarderei con attenzione X, Y, Z." Ma sempre con dubbio espresso. |

**Regole sul `focused` (round 5+):**
- **Minimo 3 nomi sempre** (killer + 2 extra) — il killer non e' mai in una lista troppo corta
- **In endgame (<=5 giocatori vivi): minimo 4 nomi** (killer + 3 extra) — un voto sbagliato in questa fase puo' significare parita' killer/cittadini = vittoria killer, quindi l'hint non deve regalare la partita
- Se le connessioni innocenti dell'NPC non bastano a riempire il minimo, i nomi extra vengono pescati dal **bridge** (connessioni di altri NPC)

### 3. NPC Minacciato (`isThreatened = true`)
**Condizione:** il killer lo ha minacciato la notte precedente

Due sotto-casi:
- **Conosce il killer ma e' minacciato** → usa `innocentHint` (depista, finge di non sapere nulla)
- **NON conosce il killer ma e' minacciato** → usa `killerHint` ma con un **innocente random** al posto del killer (accusa un innocente come se fosse sospetto)

In entrambi i casi, l'hint e' **fuorviante**. E il tono e' identico a quello di un NPC normale, quindi i giocatori non possono distinguerlo.

---

## Il meccanismo "Bridge"

(`buildBridge` + `expandNames`)

Un NPC puo' "prendere in prestito" nomi dalle connessioni di un altro NPC vivo. Questo:
- Allarga le liste di nomi (piu' confusione nei round early)
- Crea l'illusione che l'NPC sappia piu' di quanto dovrebbe
- Aggiunge frasi tipo "Ho parlato con Bardo. Tra i suoi e i miei conoscenti..."
- **Garantisce il minimo di nomi nel `focused`** quando l'NPC ha poche connessioni innocenti

I nomi presi in prestito non si sovrappongono con quelli propri dell'NPC.

---

## Indizio Analista (bonus)

(`generateAnalystBonus`)

Attivato dal potere dell'Analista (one-time, durante la notte). Analizza i **pattern di voto reali** del gioco.

I pattern sono divisi per priorita':

| Priorita' | Pattern | Perche' e' forte |
|-----------|---------|-----------------|
| **HIGH** | Voti coordinati (killer + innocente votano insieme contro lo stesso bersaglio) | Rivela alleanze sospette che coinvolgono un killer reale |
| **HIGH** | Push innocenti eliminati (chi ha spinto per eliminare un giocatore che era innocente) | Rivela chi aveva interesse a eliminare un innocente |
| LOW | Mai bersagliati (giocatori che non hanno mai ricevuto un voto) | Indizio indiretto, potrebbe essere irrilevante |
| LOW | Cambio bersaglio (chi cambia target ad ogni votazione) | Comportamento sospetto ma non necessariamente killer |

**Logica di selezione:** se ci sono pattern HIGH, ne viene scelto uno random tra quelli. Solo se non ci sono HIGH si passa ai LOW. Se non c'e' nessun pattern → frase generica di fallback.

L'hint dell'analista appare **in aggiunta** a quello dell'NPC normale.

---

## Riassunto visuale del flusso

```
Notte
  |
  +-- Killer sceglie: uccidere o minacciare un NPC
  +-- Guardiano protegge un NPC
  +-- (Analista attiva il potere)
  |
  v
Risoluzione Notte (nightResolution.js)
  |
  +-- Se minaccia → hint_npc = NPC minacciato
  +-- Altrimenti → hint_npc = selectHintNpc() (rotazione, no ripetizioni)
  +-- Se analista attivato → genera analyst_bonus_hint (priorita' HIGH > LOW)
  |
  v
Mattino (NpcHint.jsx)
  |
  +-- generateHint(state, hintNpc, isThreatened)
  |     |
  |     +-- Minacciato + conosce killer → innocentHint (depista)
  |     +-- Minacciato + non conosce killer → killerHint con finto killer
  |     +-- Non minacciato + non conosce killer → innocentHint
  |     +-- Non minacciato + conosce killer → killerHint (utile!)
  |     |
  |     +-- Scelta pool per round: early/mid/late
  |     +-- Early: pick uniforme
  |     +-- Mid/Late: weightedPick (70% nomi, 30% generiche)
  |
  +-- Se analyst_bonus_hint presente → mostrato sotto l'hint principale
```

---

## Note di bilanciamento

- **La minaccia e' molto potente per il killer.** Se il killer minaccia, il giocatore sentira' SEMPRE un hint fuorviante. Non c'e' modo di "saltare" l'NPC minacciato.
- **Il `focused` scala con l'endgame.** Con <=5 giocatori vivi, il minimo di nomi sale a 4 per compensare il fatto che i killer vincono a parita' (killer >= cittadini dopo l'assemblea). Un hint troppo stretto in endgame regalerebbe la partita ai cittadini.
- **Il bridge e' opzionale e random.** Non c'e' garanzia che il bridge produca nomi utili, ma serve come "rete di sicurezza" per raggiungere il minimo di nomi nel focused.
