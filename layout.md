# Trust Nobody - Piano Restyling Layout (Stile Lupus in Fabula)

## Palette Colori

| Ruolo | Colore | Hex | Uso |
|-------|--------|-----|-----|
| Sfondo principale | Blu notte | `#0a0e1a` | Background globale |
| Sfondo card | Blu scuro | `#111827` | Cards, pannelli |
| Primario (killer) | Rosso sangue | `#8b1a1a` | Azioni killer, eliminazioni, pericolo |
| Secondario (oro) | Oro antico | `#c9a84c` | Titoli, NPC, hint, bordi decorativi |
| Testo chiaro | Avorio | `#f5e6c8` | Testo su sfondo scuro |
| Medium | Viola profondo | `#6b21a8` | Azioni medium, reveal |
| Guardiano | Verde bosco | `#166534` | Protezione, sicurezza |
| Analista | Blu acciaio | `#1e40af` | Potere analista |
| Cittadino | Grigio caldo | `#9ca3af` | Ruolo neutro |
| Successo | Verde smeraldo | `#059669` | Vittoria cittadini, conferme |

---

## Tipografia

- **Titoli**: Font serif medievale - `Cinzel` (Google Fonts) o `MedievalSharp`
- **Body**: `Inter` o `DM Sans` - leggibile, moderno
- **Quotes NPC**: `Lora` italic - elegante per le frasi degli NPC
- **UI elements**: `Inter` semibold

---

## Elementi di Design

### Sfondo Globale
- Gradient radiale blu notte con texture sottile di pergamena/nebbia
- Particelle fluttuanti (lucciole/stelle) con CSS animation
- Silhouette di alberi/villaggio nel footer (SVG decorativo)

### Cards
- Stile "carte da gioco medievali"
- Bordi con pattern decorativo (CSS border-image o pseudo-elements)
- Angoli arrotondati con ornamenti
- Effetto pergamena (background texture leggero)
- Ombra calda (shadow con tinta ambrata)

### Bottoni
- Stile "sigillo di cera" per azioni principali
- Hover con effetto "pressione" (scale down + shadow)
- Bordi decorativi dorati
- Gradiente rosso scuro per azioni killer
- Gradiente oro per azioni positive

### Icone Tematiche (sostituire le emoji)
- Luna piena/crescente → Notte
- Pugnale/teschio → Kill
- Scudo → Protezione
- Occhio → Veggente/Analista
- Bilancia → Votazione
- Pergamena → Indizio
- Croce → Eliminazione
- Fiamma → Discussione

---

## Layout per Pagina

### Home
- Illustrazione: silhouette di villaggio al chiaro di luna (SVG/CSS)
- Titolo "Trust Nobody" con effetto inciso/metallico (text-shadow + gradient)
- Sottotitolo in font serif italic
- Bottoni come sigilli di cera con icona
- Regole in cards "pergamena" espandibili
- Footer con silhouette foresta

### Setup (PlayerNames)
- Input fields stilizzati come "targhette di legno"
- Ogni giocatore ha un piccolo avatar generato (iniziale in cerchio decorativo)
- Animazione di aggiunta/rimozione giocatore
- Loading NPC con animazione di "scrittura su pergamena"

### Role Reveal
- Card che si "gira" con animazione 3D flip
- Fronte: sigillo con lucchetto
- Retro: ruolo con icona tematica grande + descrizione
- Background cambia colore in base al ruolo rivelato
- Effetto "cera che si rompe" al click

### NPC Introductions
- Ogni NPC appare come "ritratto in cornice"
- Backstory in font serif su sfondo pergamena
- Connessioni come "note scritte a mano" ai margini
- Transizione tra NPC con effetto "girare pagina"

### Night Panel (Master)
- Sfondo cielo stellato con luna piena animata
- NPC mostrati come "bersagli" con alone rosso
- Azione kill: effetto "taglio" sulla card
- Azione threaten: effetto "ombra incombente"
- Azione protect: scudo luminoso verde
- Step indicator come fasi lunari

### Morning / Hint
- Sfondo che transita da notte ad alba (gradient animato)
- NPC che parla in "bolla pergamena" con virgolette decorative
- Se NPC ucciso: croce rossa sulla card con effetto dissolvenza
- Se protetto: scudo verde con "Il guardiano ha protetto!"

### Day / Discussion
- Sfondo luminoso (giorno nel villaggio)
- Timer circolare medievale (clessidra?)
- Lista giocatori vivi in "tavola rotonda" circolare
- NPC morti sbarrati con X rossa
- Info cards come "avvisi del villaggio" (stile manifesto)

### Vote Panel
- Urna medievale al centro (SVG)
- Votante corrente evidenziato con "spotlight"
- Bersagli come "ritratti" cliccabili
- Animazione "pietra nell'urna" al voto
- Progress bar come "pergamena che si srotola"

### Vote Result
- Eliminazione: effetto drammatico (schermo rosso flash)
- Ballottaggio: bilancia che oscilla
- Conteggio voti con animazione incrementale
- Nome eliminato con effetto "incisione"

### Medium Reveal
- Atmosfera mistica (viola, stelle, cristallo)
- Card che si "apre" per rivelare il ruolo
- Killer: effetto rosso + teschio
- Innocente: effetto verde + colomba

### Game Over
- Vittoria cittadini: alba dorata, campane
- Vittoria killer: notte eterna, lupo che ulula
- Riepilogo in "libro/cronaca" sfogliabile
- Statistiche in cards decorative

---

## Animazioni e Transizioni

- **Tra fasi**: Dissolvenza con testo tematico overlay
  - Setup → Night: "La notte cala sul villaggio..."
  - Night → Morning: "L'alba porta nuove rivelazioni..."
  - Morning → Day: "Il villaggio si riunisce..."
  - Day → Vote: "E' ora di decidere..."
  - Vote → Night: "Un'altra notte di terrore..."
- **Cards**: Fade-in dal basso con leggero bounce
- **Bottoni**: Hover glow + press shrink
- **Eliminazioni**: Flash rosso + shake
- **Protezioni**: Pulse verde + shield icon

---

## Suoni (futura implementazione)

- Notte: lupi in lontananza, vento, gufo
- Mattina: gallo, campana del villaggio
- Giorno: chiacchiericcio, mercato
- Voto: tamburo lento
- Eliminazione: colpo secco + silenzio
- Vittoria: fanfara medievale / ululato lupo
