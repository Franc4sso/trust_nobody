# Trust Nobody - Bug Report

## BUG 1 - Il Medium non funziona mai [CRITICO]
**File**: `VoteResult.jsx:22-30`, `MediumReveal.jsx:12-15`

Quando un giocatore viene eliminato, `VoteResult` aggiorna `is_alive: false` sul player ma **non scrive mai `eliminated_player_id` nel round**. L'azione `UPDATE_ROUND` esiste nel reducer ma non viene mai chiamata.

`MediumReveal` cerca `currentRound?.eliminated_player_id` → trova sempre `null` → pagina vuota.

**Fix**: Dopo l'eliminazione in `VoteResult`, dispatchare `UPDATE_ROUND` con `eliminated_player_id`.

---

## BUG 2 - Il tally nella votazione e' sfasato di un voto [CRITICO]
**File**: `MasterVotePanel.jsx:38-39`

Quando l'ultimo votante conferma, viene chiamato `tally(state, ...)` **prima** che il dispatch dell'ultimo voto sia processato dal reducer (React dispatch e' asincrono). Il tally manca l'ultimo voto.

**Fix**: Calcolare il tally includendo manualmente l'ultimo voto, oppure usare un useEffect che reagisce al cambio di state.votes.

---

## BUG 3 - Il potere dell'Analista non produce nulla [CRITICO]
**File**: `MasterNightPanel.jsx:208-222`, `hints.js:35-53`

L'analista puo' "attivare il potere" nel night panel, ma `generateAnalystBonus()` non viene mai chiamato. Il potere viene segnato come usato ma il giocatore non riceve mai l'indizio bonus.

**Fix**: Chiamare `generateAnalystBonus()` e mostrare il risultato nella fase morning (NpcHint), oppure in una schermata dedicata dopo la notte.

---

## BUG 4 - analyst_used: state globale vs campo player [MEDIO]
**File**: `MasterNightPanel.jsx:18`, `gameState.js:12`

Lo state globale ha `analyst_used: false`, ma il night panel filtra con `!state.analyst_used`. Quando il potere viene usato, viene settato come `UPDATE_PLAYER` sul giocatore (`{ analyst_used: true }`). Le due cose non si parlano.

**Fix**: Usare un'unica source of truth - o lo state globale o il campo player. Consiglio: usare `analyst_used_ever` nello state globale e aggiornarlo con un'azione dedicata.

---

## BUG 5 - Round number parte da 0, prima notte non incrementa [MEDIO]
**File**: `stateMachine.js:41-44`, `FirstVote.jsx:38-44`

Il first vote va direttamente a `night` senza passare per `advance()`. Quindi `shouldIncrementRound` non scatta. La prima notte ha `current_round: 0`, causando mismatch nei filtri per round.

**Fix**: In `FirstVote.continueToNight()`, settare esplicitamente `current_round: 1` nel dispatch, oppure passare per la state machine.

---

## BUG 6 - Runoff rotto al refresh [MEDIO]
**File**: `MasterVotePanel.jsx:12`

`runoffPlayers` e' in `useState` locale. Se l'utente refresha durante un ballottaggio, lo stato locale viene perso. `runoff_active` nel context non viene mai settato durante il voting flow.

**Fix**: Usare `SET_RUNOFF` del context quando inizia un ballottaggio, e leggere da li' al mount del componente.

---

## BUG 7 - Typo hardcoded nell'innkeeper template [BASSO]
**File**: `archetypes.js:90`

```js
"Bardo beve alla mia locanda ogni sera. L'alcol scioglie la lingua..."
```
Hardcoded "Bardo" invece di `{name}`. Se il template viene scelto per un NPC diverso, il testo non ha senso.

**Fix**: Sostituire "Bardo" con `{name}`.
