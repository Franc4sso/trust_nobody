Trust Nobody - Restyling Pulp / True Crime Anni '50 │
│ │
│ Context │
│ │
│ L'app ha attualmente uno stile dark generico con Tailwind utilities. L'obiettivo è trasformarla in un'esperienza │
│ visiva Pulp / True Crime anni '50: colori saturi, estetica da copertina pulp magazine, neon di motel, atmosfera │
│ americana noir con tocchi sensazionalistici. │
│ │
│ --- │
│ Palette Colori │
│ │
│ ┌───────────────────┬─────────┬─────────────────────────────────┐ │
│ │ Nome │ Hex │ Uso │ │
│ ├───────────────────┼─────────┼─────────────────────────────────┤ │
│ │ Nero profondo │ #0a0a0a │ Background principale │ │
│ ├───────────────────┼─────────┼─────────────────────────────────┤ │
│ │ Grigio asfalto │ #1a1a1a │ Card backgrounds │ │
│ ├───────────────────┼─────────┼─────────────────────────────────┤ │
│ │ Rosso sangue │ #c41e3a │ Killer, pericolo, eliminazioni │ │
│ ├───────────────────┼─────────┼─────────────────────────────────┤ │
│ │ Crema invecchiato │ #f0e6d3 │ Testo principale, pergamena │ │
│ ├───────────────────┼─────────┼─────────────────────────────────┤ │
│ │ Giallo taxi │ #e8b930 │ Titoli, accenti, highlight │ │
│ ├───────────────────┼─────────┼─────────────────────────────────┤ │
│ │ Neon rosa │ #ff2d6b │ Accenti neon, hover, alert │ │
│ ├───────────────────┼─────────┼─────────────────────────────────┤ │
│ │ Neon blu │ #4dc9f6 │ Info, analista, link │ │
│ ├───────────────────┼─────────┼─────────────────────────────────┤ │
│ │ Verde veleno │ #2ecc40 │ Successo, cittadini, protezione │ │
│ ├───────────────────┼─────────┼─────────────────────────────────┤ │
│ │ Viola morfina │ #9b59b6 │ Medium, mistico │ │
│ ├───────────────────┼─────────┼─────────────────────────────────┤ │
│ │ Marrone tabacco │ #8b6914 │ Bordi, elementi vintage │ │
│ └───────────────────┴─────────┴─────────────────────────────────┘ │
│ │
│ --- │
│ Typography (Google Fonts) │
│ │
│ - Titoli: Bebas Neue — condensed bold, perfetto per titoloni pulp │
│ - Body: IBM Plex Mono — typewriter feel, leggibile │
│ - Quotes/NPC: Playfair Display italic — elegante, anni '50 │
│ - UI/Labels: Inter semibold — UI moderna │
│ │
│ --- │
│ Fase 1: Fondamenta CSS e Font │
│ │
│ File: index.html │
│ │
│ - Aggiungere Google Fonts link (Bebas Neue, IBM Plex Mono, Playfair Display, Inter) │
│ │
│ File: src/index.css │
│ │
│ - Aggiungere @theme block con custom colors, fonts, animations │
│ - CSS custom properties per colori │
│ - Classi utility globali: .card-pulp, .btn-neon, .btn-blood, .text-headline, ecc. │
│ - Animazioni: flicker neon, fade-in, slide-up, blood-drip, typewriter │
│ - Background pattern: texture rumore/grana fotografica │
│ - Pseudo-elementi decorativi │
│ │
│ --- │
│ Fase 2: Componenti Condivisi │
│ │
│ File: src/components/PageShell.jsx (NUOVO) │
│ │
│ - Wrapper layout per tutte le pagine │
│ - Background nero con grana fotografica (CSS noise texture) │
│ - Bordo neon sottile opzionale │
│ - Container centrato con max-width │
│ │
│ File: src/components/PulpCard.jsx (NUOVO) │
│ │
│ - Card stile copertina pulp / fascicolo polizia │
│ - Bordo rosso/giallo con effetto "carta invecchiata" │
│ - Shadow rossa/neon │
│ - Varianti: danger, info, neon, vintage │
│ │
│ File: src/components/NeonButton.jsx (NUOVO) │
│ │
│ - Bottone con effetto neon glow │
│ - Hover: flicker + intensificazione glow │
│ - Varianti: red, blue, yellow, green │
│ │
│ File: src/components/Headline.jsx (NUOVO) │
│ │
│ - Titolo stile copertina pulp magazine │
│ - Font Bebas Neue, tutto maiuscolo │
│ - Effetto text-shadow neon o metallico │
│ - Sottotitolo opzionale in Playfair Display italic │
│ │
│ --- │
│ Fase 3: Pagine — Restyling Completo │
│ │
│ 3.1 Home.jsx │
│ │
│ - Background: città notturna con neon (gradient scuro + effetto glow) │
│ - Titolo "TRUST NOBODY" enorme in Bebas Neue con glow rosso │
│ - Sottotitolo: "Nessuno è al sicuro..." in Playfair italic │
│ - Bottoni: insegne neon (Nuova Partita = neon rosso, Continua = neon blu) │
│ - Effetto: flicker neon sul titolo │
│ - Decorazione: silhouette città / insegna motel │
│ │
│ 3.2 PlayerNames.jsx (Setup) │
│ │
│ - Input fields: stile macchina da scrivere (bordo tratteggiato, font mono) │
│ - Ogni giocatore: "scheda sospetto" con numero progressivo │
│ - Bottone aggiungi: "+" con bordo neon │
│ - Loading: effetto typewriter "Generando profili..." │
│ - Sfondo: scrivania detective (texture legno scuro) │
│ │
│ 3.3 RoleReveal.jsx │
│ │
│ - Card flip 3D mantenuto │
│ - Fronte: busta sigillata con "CONFIDENZIALE" stampato │
│ - Retro: ruolo con colore tematico del ruolo │
│ - Killer: rosso sangue + icona coltello │
│ - Guardiano: verde + icona scudo │
│ - Medium: viola + icona occhio │
│ - Analista: blu neon + icona lente │
│ - Cittadino: crema + icona persona │
│ - Progress: dots sostituiti da "fascicoli" numerati │
│ │
│ 3.4 NpcIntroductions.jsx │
│ │
│ - NPC come "profili sospetti" / schede segnaletiche │
│ - Foto placeholder: silhouette in cerchio con bordo giallo │
│ - Nome in Bebas Neue, personalità in Playfair italic │
│ - Connessioni come "note a matita" con font mono │
│ - Navigazione: frecce stile "prossimo fascicolo" │
│ │
│ 3.5 FirstVote.jsx (N1) │
│ │
│ - Header: "PRIMA VOTAZIONE" stile titolone giornale │
│ - Votante corrente: spotlight con bordo neon giallo │
│ - Target: griglia di "foto segnaletiche" cliccabili │
│ - Selezionato: bordo neon rosa + glow │
│ - Bottone vota: neon rosso │
│ │
│ 3.6 MasterNightPanel.jsx │
│ │
│ - Sfondo: più scuro con effetto vignetta │
│ - Header "NOTTE" con luna/stelle CSS │
│ - Step killer: card rosse con azione kill/threaten │
│ - Step guardiano: card verde con scudo │
│ - Step analista: card blu neon con lente │
│ - NPC come bersagli con alone appropriato │
│ - Summary: "rapporto notturno" stile fascicolo │
│ │
│ 3.7 NpcHint.jsx (Morning) │
│ │
│ - Transizione: sfondo leggermente più chiaro (alba) │
│ - NPC che parla: card grande stile "testimonianza" │
│ - Hint text: in Playfair italic, virgolette grandi decorative │
│ - Se NPC ucciso: "VITTIMA" stampato in rosso diagonal │
│ - Analyst bonus: card separata con bordo neon blu │
│ │
│ 3.8 Discussion.jsx (Day) │
│ │
│ - Sfondo: leggermente più luminoso del nero │
│ - Info eliminazione: "BREAKING NEWS" stile giornale │
│ - Lista giocatori vivi: griglia di "sospetti" con stato │
│ - NPC morti: sbarrati con X rossa │
│ - Timer/prompt discussione: stile headline giornale │
│ │
│ 3.9 MasterVotePanel.jsx │
│ │
│ - Header: "IL VERDETTO" stile titolone │
│ - Votante corrente: evidenziato con spotlight neon │
│ - Target: foto segnaletiche in griglia │
│ - Voto registrato: checkmark neon verde │
│ - Progress bar: barra rossa che si riempie │
│ - Ballottaggio: alert speciale con bordo neon rosa │
│ │
│ 3.10 VoteResult.jsx │
│ │
│ - Eliminazione: flash rosso drammatico + nome grande │
│ - Ballottaggio: "PAREGGIO!" lampeggiante │
│ - Conteggio voti: numeri grandi stile tabellone │
│ - Nessun eliminato: messaggio neutro │
│ │
│ 3.11 MediumReveal.jsx │
│ │
│ - Atmosfera mistica: sfondo viola scuro con glow │
│ - Card che si "apre": animazione reveal │
│ - Killer: testo rosso + "COLPEVOLE" │
│ - Innocente: testo verde + "INNOCENTE" │
│ - Font Bebas Neue per il verdetto │
│ │
│ 3.12 GameOver.jsx │
│ │
│ - Vittoria cittadini: sfondo con tocchi dorati, "GIUSTIZIA È FATTA" │
│ - Vittoria killer: sfondo rosso scuro, "IL KILLER HA VINTO" │
│ - Riepilogo: "rapporto finale" con tutti i giocatori │
│ - Ruoli rivelati con colori appropriati │
│ - Bottone "Nuova Partita" neon │
│ │
│ --- │
│ Fase 4: Animazioni │
│ │
│ Definite in index.css: │
│ - neon-flicker: flicker di insegna neon (opacity + text-shadow) │
│ - fade-in-up: entrata dal basso con fade │
│ - typewriter: effetto battitura │
│ - blood-drip: goccia che scende (per eliminazioni) │
│ - spotlight: pulsazione luce spotlight │
│ - shake: tremolio per momenti drammatici │
│ │
│ --- │
│ File da Modificare/Creare │
│ │
│ Nuovi: │
│ 1. src/components/PageShell.jsx │
│ 2. src/components/PulpCard.jsx │
│ 3. src/components/NeonButton.jsx │
│ 4. src/components/Headline.jsx │
│ │
│ Da modificare: │
│ 1. index.html — Google Fonts │
│ 2. src/index.css — Theme, animazioni, utility classes │
│ 3. src/pages/Home.jsx │
│ 4. src/pages/Setup/PlayerNames.jsx │
│ 5. src/pages/Setup/RoleReveal.jsx │
│ 6. src/pages/N1/NpcIntroductions.jsx │
│ 7. src/pages/N1/FirstVote.jsx │
│ 8. src/pages/Night/MasterNightPanel.jsx │
│ 9. src/pages/Morning/NpcHint.jsx │
│ 10. src/pages/Day/Discussion.jsx │
│ 11. src/pages/Vote/MasterVotePanel.jsx │
│ 12. src/pages/Vote/VoteResult.jsx │
│ 13. src/pages/Vote/MediumReveal.jsx │
│ 14. src/pages/GameOver.jsx │
│ │
│ Totale: 4 nuovi + 14 modificati = 18 file │
│ │
│ --- │
│ Ordine di Implementazione │
│ │
│ 1. index.html + index.css (fondamenta) │
│ 2. 4 componenti condivisi │
│ 3. Home.jsx (pagina showcase) │
│ 4. Pagine setup: PlayerNames.jsx, RoleReveal.jsx │
│ 5. Pagine N1: NpcIntroductions.jsx, FirstVote.jsx │
│ 6. Pagine notte/mattina: MasterNightPanel.jsx, NpcHint.jsx │
│ 7. Pagine giorno/voto: Discussion.jsx, MasterVotePanel.jsx, VoteResult.jsx │
│ 8. Pagine finali: MediumReveal.jsx, GameOver.jsx
