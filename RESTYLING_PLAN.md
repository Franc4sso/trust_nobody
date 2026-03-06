# Piano Restyling Completo - Trust Nobody

## Filosofia del Redesign

**Da:** Pulp noir grezzo con neon aggressivi e contrasti duri
**A:** Noir elegante e cinematografico con colori morbidi, illustrazioni AI, micro-animazioni raffinate

L'app deve sembrare un gioco mobile premium: pulita, atmosferica, immersiva.
Meno "hacker cyberpunk", piu' "film noir italiano anni '50 con tocco moderno".

---

## FASE 1 - Palette e Fondamenta Visive

### 1.1 Nuova Palette Colori (piu' morbida e raffinata)
Sostituire i colori attuali con tonalita' piu' calde e meno aggressive:

```
--color-noir:       #0d0f14      (blu-nero profondo, non nero puro)
--color-surface:    #161923      (superficie card, leggermente blu)
--color-surface-2:  #1e2230      (superficie elevata)
--color-border:     #2a2f40      (bordi sottili, quasi invisibili)

--color-blood:      #d4364b      (rosso piu' caldo, meno acido)
--color-blood-soft: #d4364b33    (rosso per glow/bg sottili)
--color-cream:      #e8dcc8      (crema leggermente piu' calda)
--color-cream-soft: #e8dcc880    (testo secondario)
--color-gold:       #d4a843      (oro antico, sostituisce taxi)
--color-gold-soft:  #d4a84333

--color-emerald:    #3ecf8e      (verde morbido per guardiano)
--color-violet:     #a78bfa      (viola morbido per medium)
--color-sky:        #60a5fa      (blu cielo per analista)
--color-amber:      #f59e0b      (ambra per veggente)
--color-rose:       #fb7185      (rosa per accenti)
```

### 1.2 Tipografia Raffinata
- **Headlines:** Mantenere Bebas Neue ma ridurre letter-spacing (0.02em invece di 0.05em)
- **Body:** Passare da IBM Plex Mono a **Inter** come font principale (piu' leggibile)
- **Mono:** Usare IBM Plex Mono solo per elementi "dossier" (indizi, codici)
- **Quote:** Mantenere Playfair Display per citazioni NPC
- **Aggiungere:** Pesi font piu' sottili (300, 400) per testo secondario

### 1.3 Sfondi e Texture
- Sostituire il noise grezzo con un gradient radiale morbido (leggera macchia di luce al centro)
- Aggiungere opzione per pattern sottile tipo carta invecchiata (opacity 0.02)
- Vignette piu' morbida e graduale

---

## FASE 2 - Illustrazioni AI per Ruoli e NPC

### 2.1 Ritratti dei Ruoli (6 illustrazioni)
Generare con AI (DALL-E / Midjourney / Stable Diffusion) ritratti in stile:
- **Stile:** Illustrazione cartoon noir, tratto pulito, ombre drammatiche
- **Formato:** 512x512 PNG con sfondo trasparente o sfondo scuro circolare
- **Mood:** Anni '50 italiani, Hitchcock meets Studio Ghibli

Ritratti necessari:
1. **Serial Killer** - Figura in ombra, sorriso ambiguo, cappello a tesa larga, occhi penetranti rossi
2. **Guardiano** - Figura protettiva, mantello/giacca lunga, postura difensiva, aura verde
3. **Medium** - Figura mistica, occhi luminosi viola, mani alzate, velo/fumo attorno
4. **Analista** - Figura con lente d'ingrandimento, occhiali, sguardo acuto, luce blu
5. **Veggente** - Figura con occhio mistico/terzo occhio, sfera di cristallo, toni ambra
6. **Cittadino** - Figura comune, volto aperto, stile "uomo della strada" anni '50

### 2.2 Avatar NPC (10+ illustrazioni)
Un ritratto per ogni archetipo NPC presente in `archetypes.js`:
- Stesso stile dei ruoli ma con personalita' distinta
- Ogni NPC deve essere immediatamente riconoscibile
- Formato circolare con bordo dorato sottile

### 2.3 Illustrazioni di Scena (opzionale, fase avanzata)
- Scena notturna (per la fase notte)
- Alba sulla citta' (per la fase mattina)
- Tribunale/piazza (per la fase votazione)
- Scena finale vittoria/sconfitta

### 2.4 Dove mettere le immagini
- `/public/img/roles/` - ritratti ruoli
- `/public/img/npcs/` - ritratti NPC
- `/public/img/scenes/` - sfondi di scena
- Usare WebP per performance, con fallback PNG

---

## FASE 3 - Componenti UI Ridisegnati

### 3.1 PageShell migliorato
- Gradient di sfondo contestuale per fase (notte=blu scuro, mattina=ambra tenue, giorno=neutro)
- Header fisso sottile con nome fase + icona + numero round
- Transizioni animate tra pagine (fade + slide)
- Safe area padding per dispositivi mobili moderni

### 3.2 Card System Rinnovato
- Rimuovere i glow aggressivi, sostituire con ombre morbide multi-layer
- Border sottilissimi (1px rgba bianco al 5%) invece di colori forti
- Hover: leggera elevazione (translateY -2px) + ombra piu' profonda
- Glass morphism leggero per card importanti (backdrop-blur + bg semitrasparente)
- Border-radius piu' generoso (1rem invece di 0.75rem)

### 3.3 Bottoni Ridisegnati
- **Primario:** Sfondo pieno con gradient sottile, bordi arrotondati (0.75rem)
- **Secondario:** Bordo sottile + sfondo trasparente, testo colorato
- **Ghost:** Solo testo colorato, hover mostra sfondo tenue
- Rimuovere i glow neon, sostituire con transizioni di colore fluide
- Aggiungere feedback tattile: scale(0.97) al click + transizione rapida
- Icone opzionali (usare lucide-react per set di icone coerente)

### 3.4 Nuovo Componente: RoleCard
- Card dedicata per mostrare ruolo con:
  - Illustrazione AI grande al centro
  - Nome ruolo con colore tematico
  - Descrizione in font quote sotto
  - Bordo con colore del ruolo (sottile, elegante)
  - Animazione di reveal (flip card o fade-in progressivo)

### 3.5 Nuovo Componente: NpcProfile
- Card NPC con:
  - Avatar AI circolare (con ring colorato per personalita')
  - Nome in headline
  - Backstory in italic
  - Lista connessioni come "chip" cliccabili
  - Badge "INAFFIDABILE" se unreliable (sottile, non spoiler)

### 3.6 Nuovo Componente: PhaseHeader
- Banner fisso in alto che mostra:
  - Icona fase (luna per notte, sole per giorno, etc.)
  - Nome fase
  - Round corrente
  - Contatore giocatori vivi
- Animazione di transizione quando cambia fase

### 3.7 Nuovo Componente: PlayerChip
- Chip compatto per mostrare un giocatore:
  - Iniziale in cerchio colorato (colore del ruolo, visibile solo al master)
  - Nome
  - Stato (vivo/eliminato) con stile visivo
  - Usato nelle griglie di voto, liste giocatori, connessioni NPC

---

## FASE 4 - Pagine Ridisegnate

### 4.1 Home Page
- Logo grande "TRUST NOBODY" con animazione cinematografica (typewriter lento + glow morbido)
- Sottotitolo in Playfair Display: "Un gioco di bugie e sospetti"
- Illustrazione hero: silhouette citta' noir o scena misteriosa
- Due bottoni grandi: "Nuova Partita" + "Come si gioca"
- Sezione "Come si gioca" come carousel/accordion elegante (non card ammassate)
- Footer discreto con versione e credits

### 4.2 Setup - PlayerNames
- Step indicator elegante in alto (1. Nomi -> 2. Ruoli -> 3. Inizia)
- Input nomi con animazione di aggiunta fluida (slide-in)
- Chip rimovibili per nomi gia' inseriti
- Toggle ruoli con switch animati e icone dei ruoli
- Preview distribuzione ruoli in tempo reale
- Bottone "Inizia" che appare solo quando tutto e' valido

### 4.3 RoleReveal
- Effetto "busta da aprire": card che si gira (CSS 3D flip)
- Fronte: "Tocca per rivelare" con nome giocatore
- Retro: Illustrazione ruolo + nome ruolo + descrizione
- Progress dots in basso con nomi
- Colore tema della pagina cambia in base al ruolo rivelato

### 4.4 NPC Introductions (N1)
- Carousel orizzontale swipeable per NPC (uno alla volta)
- Ogni NPC: avatar grande + nome + backstory narrata
- Connessioni mostrate come "schede" sotto il profilo
- Animazione di entrata cinematografica (fade + zoom leggero)

### 4.5 Night Panel (Master)
- Layout a step con progress bar in alto
- Ogni step ha icona + colore del ruolo che agisce
- Selezione target con card giocatore (non semplici bottoni)
- Effetto "spotlight" sul giocatore selezionato
- Riepilogo finale della notte con timeline visiva degli eventi

### 4.6 Morning / NPC Hint
- Transizione "alba" (sfondo che schiarisce leggermente)
- NPC vittima mostrato con il suo ritratto + stamp "VITTIMA" elegante
- Indizio in card stile "biglietto strappato" o "nota trovata"
- Se guardiano ha protetto: effetto "scudo" visivo

### 4.7 Day / Discussion
- Layout piu' strutturato:
  - Sezione "Breaking News" in alto (evento della notte)
  - Griglia giocatori vivi (con chip colorati)
  - Dossier espandibile per ogni NPC (con timeline indizi)
  - Timer opzionale per la discussione (configurabile)
- Separatori visivi eleganti tra sezioni

### 4.8 Vote Panel
- Votante attuale in "spotlight" (card grande centrata)
- Griglia target con foto/iniziale + nome
- Selezione con animazione (bordo che si illumina, non cambio brusco)
- Conferma voto con micro-animazione
- Barra progresso voti in basso

### 4.9 Game Over
- Schermata cinematografica:
  - Grande headline "VITTORIA" o "SCONFITTA" con animazione drammatica
  - Reveal di tutti i ruoli con ritratti AI
  - Statistiche partita (round giocati, NPC sopravvissuti, voti totali)
  - Bottone "Nuova Partita" e "Condividi Risultato"

---

## FASE 5 - Micro-animazioni e Polish

### 5.1 Transizioni Pagina
- Aggiungere `framer-motion` o usare View Transitions API
- Fade + slide direzionale (avanti = slide left, indietro = slide right)
- Durata: 300ms, easing: ease-out

### 5.2 Micro-interazioni
- Bottoni: scale(0.97) on press, spring back
- Card: hover lift (translateY -2px)
- Toggle: slide fluido con cambio colore
- Liste: stagger animation (elementi appaiono uno dopo l'altro con delay)
- Numeri/contatori: animazione incrementale

### 5.3 Feedback Visivo
- Toast/snackbar per azioni completate (non alert nativi)
- Skeleton loading per contenuti AI
- Stato vuoto illustrato (non solo testo)

### 5.4 Suoni (opzionale, fase avanzata)
- Click bottone sottile
- Reveal ruolo drammatico
- Transizione notte (suono ambiente)
- Eliminazione (suono drammatico)
- Attivabili/disattivabili nelle impostazioni

---

## FASE 6 - Dipendenze da Aggiungere

```bash
npm install framer-motion lucide-react
```

- **framer-motion**: Animazioni fluide, transizioni pagina, gesture (swipe)
- **lucide-react**: Set icone coerente e leggero (moon, sun, shield, skull, eye, etc.)

---

## FASE 7 - Struttura File Aggiornata

```
public/
  img/
    roles/
      serial-killer.webp
      guardian.webp
      medium.webp
      analyst.webp
      seer.webp
      citizen.webp
    npcs/
      [nome-npc].webp (uno per archetipo)
    scenes/
      night-bg.webp
      morning-bg.webp
      city-silhouette.webp
      logo.webp
src/
  components/
    PageShell.jsx      (aggiornato)
    Headline.jsx       (aggiornato)
    PulpCard.jsx       -> Card.jsx (semplificato)
    NeonButton.jsx     -> Button.jsx (ridisegnato)
    SuspectDossier.jsx (aggiornato)
    RoleCard.jsx       (NUOVO)
    NpcProfile.jsx     (NUOVO)
    PhaseHeader.jsx    (NUOVO)
    PlayerChip.jsx     (NUOVO)
    PageTransition.jsx (NUOVO)
    Toast.jsx          (NUOVO)
  hooks/
    usePageTransition.js (NUOVO)
```

---

## Ordine di Implementazione Consigliato

1. **Palette + Typography** (index.css) - fondamenta, impatto immediato
2. **Componenti base** (Card, Button, PageShell) - tutto ne beneficia
3. **Generare illustrazioni AI** - processo parallelo, richiede tempo
4. **Installare framer-motion + lucide-react**
5. **RoleCard + NpcProfile** - componenti chiave con immagini
6. **Ridisegnare Home** - prima impressione
7. **Ridisegnare RoleReveal** - momento wow del gioco
8. **Ridisegnare Night + Morning** - core gameplay
9. **Ridisegnare Day + Vote** - completare il ciclo
10. **GameOver** - finale d'impatto
11. **Micro-animazioni e transizioni** - polish finale
12. **Suoni** (opzionale)

---

## Note Tecniche

- Mantenere tutto il testo in italiano
- Mobile-first: il gioco si gioca su un telefono passato di mano in mano
- Performance: lazy load immagini, animazioni GPU-accelerate (transform/opacity)
- Accessibilita': contrasto sufficiente anche con colori morbidi (WCAG AA)
- Le immagini AI vanno generate esternamente e committate nel repo (non generate a runtime)
- Deploy su Netlify free tier: nessun problema, il sito resta completamente statico
- Peso stimato aggiuntivo per immagini: ~1.1MB (WebP)

---

## Compatibilita' Netlify Free Tier

| Risorsa | Limite Free | Uso Stimato | OK? |
|---------|-------------|-------------|-----|
| Bandwidth | 100GB/mese | ~3MB/visita | Si |
| Build minutes | 300/mese | ~20s/build | Si |
| Storage | Illimitato (statico) | ~5MB totali | Si |
| Server functions | 0 necessarie | 0 usate | Si |
