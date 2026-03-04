# Piano: Migrazione Laravel+Inertia → React SPA pura (Netlify)

## Contesto
L'app Trust Nobody è attualmente Laravel 12 + Inertia.js + React. L'obiettivo è portarla a una SPA React pura (zero backend) deployabile su Netlify con file statici. Tutta la logica di gioco è in PHP e va tradotta in JS. Lo storage session-based va sostituito con localStorage. Le chiamate Groq vanno fatte direttamente dal browser (`VITE_GROQ_API_KEY`).

---

## Struttura target

```
src/
  engine/
    archetypes.js       // dati npc_archetypes.php + CONNECTION_TEMPLATES
    roles.js            // RoleAssignmentService
    npcGenerator.js     // NpcGeneratorService + chiamata Groq async
    hints.js            // DynamicHintService
    nightResolution.js  // NightResolutionService
    vote.js             // VoteService
    winCondition.js     // WinConditionService
    stateMachine.js     // GameStateMachine
    phaseRoutes.js      // mappa fase → route
    gameState.js        // Context + useReducer + localStorage
  pages/
    Home.jsx
    Setup/PlayerNames.jsx, RoleReveal.jsx
    N1/NpcIntroductions.jsx, FirstVote.jsx
    Night/MasterNightPanel.jsx
    Morning/NpcHint.jsx
    Day/Discussion.jsx
    Vote/MasterVotePanel.jsx, VoteResult.jsx, MediumReveal.jsx
    GameOver.jsx
  components/           // COPIA 1:1, zero modifiche
    PhaseHeader.jsx, HotSeatGuard.jsx, PrivacyScreen.jsx
    VoteButtons.jsx, PlayerList.jsx, NpcCard.jsx
  App.jsx               // HashRouter + routes + GameProvider
  main.jsx
index.html
vite.config.js          // nuovo (rimuove laravel-vite-plugin)
.env                    // VITE_GROQ_API_KEY=... (in .gitignore)
netlify.toml
```

---

## Ordine di implementazione

### FASE 1 — Scaffolding

1. **Nuovo `package.json`**: rimuovere `laravel-vite-plugin`, `@inertiajs/react`, `axios`; aggiungere `react-router-dom@^6`
2. **Nuovo `vite.config.js`**: `@vitejs/plugin-react` + `@tailwindcss/vite`, alias `@` → `./src`, `outDir: 'dist'`
3. **`index.html`** nella root del progetto
4. **`src/main.jsx`**: `ReactDOM.createRoot('#root').render(<App />)`
5. **`.env.example`**: `VITE_GROQ_API_KEY=inserisci_qui`
6. **`netlify.toml`**: `command = "npm run build"`, `publish = "dist"`

### FASE 2 — Engine (logica pura JS, no React, testabile isolatamente)

7. **`src/engine/archetypes.js`**: traduzione 1:1 di `npc_archetypes.php` + `CONNECTION_TEMPLATES` da `NpcGeneratorService.php`
8. **`src/engine/roles.js`**: traduzione 1:1 di `RoleAssignmentService.php` con Fisher-Yates shuffle
9. **`src/engine/npcGenerator.js`**: traduzione di `NpcGeneratorService.php`; `generateNpcs(players)` è `async`; fallback automatico a templates se Groq fallisce
10. **`src/engine/hints.js`**: traduzione 1:1 di `DynamicHintService.php`; riceve `state` invece di `GameState $game`
11. **`src/engine/nightResolution.js`**: traduzione di `NightResolutionService.php`; ritorna `{roundUpdate, npcUpdates}` (immutabile, non muta stato)
12. **`src/engine/vote.js`**: traduzione di `VoteService.php`
13. **`src/engine/winCondition.js`**: traduzione di `WinConditionService.php`
14. **`src/engine/stateMachine.js`**: traduzione di `GameStateMachine.php`; ritorna `{next, incrementRound}`
15. **`src/engine/phaseRoutes.js`**: `export const PHASE_ROUTES = { setup: '/setup', role_reveal: '/roles', ... }`

### FASE 3 — State Management

16. **`src/engine/gameState.js`**: Context + useReducer + localStorage
    - Actions: `INIT_GAME`, `SET_PLAYERS`, `SET_NPCS`, `SET_PHASE_AND_ROUND`, `UPDATE_PLAYER`, `UPDATE_NPC`, `ADD_VOTE`, `ADD_NIGHT_ACTION`, `RESOLVE_NIGHT`, `SET_WINNER`, `RESET`
    - `useGame()` hook
    - `selectors` object (alivePlayers, aliveNpcs, aliveKillers, currentRound, findPlayer, findNpc, votesForRound, nightActionsForRound)
    - Ogni dispatch scrive su `localStorage` (`trust_nobody_game`)
    - Al mount: carica da localStorage se presente (permette di riprendere partita interrotta)
    - Action `SET_WINNER` / `RESET`: cancella localStorage (`localStorage.removeItem(STORAGE_KEY)`) — nessuno storico
    - `useAdvance()` hook riutilizzabile: `advance(state)` → dispatch `SET_PHASE_AND_ROUND` → `navigate(PHASE_ROUTES[next])`

### FASE 4 — Routing e App shell

17. **`src/App.jsx`**: `<GameProvider>` wrappa `<HashRouter>` + `<Routes>` con tutte le route; `<RequireGame>` guard che reindirizza a `/` se `!state.id`

### FASE 5 — Adattamento pagine

Pattern comune per ogni pagina:

| Prima (Inertia) | Dopo |
|---|---|
| `import { router } from '@inertiajs/react'` | `import { useNavigate } from 'react-router-dom'` |
| Props dalla funzione `({ game, players })` | `const { state, dispatch } = useGame()` |
| `router.post('/games/…/advance')` | `useAdvance()` |
| `router.visit('/')` | `navigate('/')` |

Pagine e note specifiche:

18. **`Home.jsx`**: `dispatch INIT_GAME` + `navigate('/setup')`; aggiungere "Continua partita" se `state.id` in localStorage

19. **`Setup/PlayerNames.jsx`** (più complessa): submit è `async`; chiama `assignRoles(players)` + `await generateNpcs(players)`; mostra spinner durante la chiamata Groq; dispatch `SET_PLAYERS` + `SET_NPCS`; navigate `/roles`

20. **`Setup/RoleReveal.jsx`**: legge `state.players`; ultimo player → `useAdvance()`

21. **`N1/NpcIntroductions.jsx`**: legge `state.npcs`; `connection_descriptions` è array `[{player_id, text}]`, mostrare `.text`

22. **`N1/FirstVote.jsx`**: stato locale `currentVoterIndex`; ogni voto → `dispatch ADD_VOTE`; quando index === alivePlayers.length → `navigate('/vote/result?n1=true')`

23. **`Night/MasterNightPanel.jsx`**: step è stato locale `useState('killer')`; azioni accumulate con `dispatch ADD_NIGHT_ACTION`; allo step `summary` → `dispatch RESOLVE_NIGHT` → `useAdvance()`

24. **`Morning/NpcHint.jsx`**: `hint_npc_id` da `currentRound(state)`; indizi generati runtime con `generateHint(state, npc, isThreatened)`

25. **`Day/Discussion.jsx`**: solo lettura da state; `useAdvance()` sul bottone

26. **`Vote/MasterVotePanel.jsx`**: voti in batch → `dispatch ADD_VOTE` × N; gestione runoff: stato locale con players runoff, rispecchiato da `tally()` result; navigate `/vote/result`

27. **`Vote/VoteResult.jsx`**: `tally(state, isRunoff)` runtime; se `result.runoff` → navigate `/vote?runoff=1`; se vincitore → `dispatch SET_WINNER`; altrimenti `useAdvance()`

28. **`Vote/MediumReveal.jsx`**: legge `currentRound.eliminated_player_id` + ruolo del player eliminato

29. **`GameOver.jsx`**: `state.winner`, `state.players`, `state.npcs`; "Nuova Partita" → `dispatch RESET` + `navigate('/')`

---

## File critici da leggere durante implementazione

- `resources/js/Pages/Night/MasterNightPanel.jsx` — step logic più complessa
- `resources/js/Pages/Vote/MasterVotePanel.jsx` — runoff handling
- `resources/js/Pages/Setup/PlayerNames.jsx` — form validation
- `app/Services/DynamicHintService.php` — già letto, logica da tradurre fedelmente

## Note tecniche

- **IDs**: usare `crypto.randomUUID()` al posto degli auto-increment PHP
- **`analyst_used` vs `analyst_used_ever`**: il PHP ha entrambi; nel reducer mantenere entrambi per compatibilità con il UI esistente
- **Runoff**: `VoteResult` mostra i candidati dal `tally()` result; `MasterVotePanel` legge `?runoff=1` dalla URL e filtra i giocatori eligibili dal result salvato in state (nuovo campo `runoff_player_ids` nello state)
- **Groq fallback**: se `VITE_GROQ_API_KEY` non è impostata, `generateNpcs` usa direttamente i template statici senza tentare la fetch

## Verifica finale

1. `npm run build` → nessun errore
2. `npm run preview` → aprire `http://localhost:4173/#/`
3. Test flusso completo: Home → Setup → Role Reveal → N1 → Night → Morning → Day → Vote → GameOver
4. Refresh browser a metà partita → partita ripresa da localStorage
5. Deploy su Netlify: collegare repo, impostare `VITE_GROQ_API_KEY` nelle env vars, verificare build
