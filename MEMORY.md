# Trust Nobody - Project Memory

## Progetto
- Gioco di deduzione sociale (stile Lupus in Fabula) per 4-10 giocatori
- Stack: React 19 + Vite 7 + Tailwind CSS 4 + React Router 6 (HashRouter)
- Deploy: Netlify, SPA con hash routing
- AI: Groq API (llama-3.3-70b-versatile) per generare descrizioni NPC
- Storage: localStorage per persistenza stato partita

## Struttura
- `src/engine/` - logica di gioco (roles, gameState, stateMachine, vote, winCondition, nightResolution, hints, npcGenerator, archetypes, phaseRoutes)
- `src/pages/` - UI React organizzata per fasi (Home, Setup/, N1/, Night/, Morning/, Day/, Vote/, GameOver)
- `src/App.jsx` - routing principale con RequireGame guard

## Documenti di Piano
- `memory/bugs.md` - 7 bug identificati (3 critici, 3 medi, 1 basso)
- `memory/layout.md` - piano completo restyling stile Lupus in Fabula
- `memory/roles.md` - ruoli esistenti + 6 nuovi ruoli proposti con bilanciamento

## Fasi di Gioco
setup → role_reveal → n1_intro → n1_vote → night → morning → day → vote → (medium_reveal) → night/game_over

## Note Chiave
- Il gioco usa NPC come vittime notturne (non giocatori), twist rispetto al classico Lupus
- Gli NPC hanno connessioni con giocatori e danno hint basati su chi conoscono
- NPC minacciati danno indizi fuorvianti (nominano innocenti come sospetti)
- Il master controlla il telefono per tutta la partita
