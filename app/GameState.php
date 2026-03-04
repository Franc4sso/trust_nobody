<?php

namespace App;

use App\Enums\GamePhase;
use App\Enums\PlayerRole;
use Illuminate\Contracts\Routing\UrlRoutable;

class GameState implements UrlRoutable
{
    private array $data;

    private function __construct(array $data)
    {
        $this->data = $data;
    }

    // ── Factory ──────────────────────────────────────────────

    public static function create(array $attrs = []): static
    {
        $state = new static(array_merge([
            'id' => 1,
            'player_count' => 0,
            'current_phase' => GamePhase::Setup->value,
            'current_round' => 0,
            'winner' => null,
            'analyst_used' => false,
            'analyst_used_ever' => false,
            'analyst_night_decided' => false,
            'runoff_active' => false,
            'runoff_player_ids' => [],
            'players' => [],
            'npcs' => [],
            'rounds' => [],
            'night_actions' => [],
            'votes' => [],
        ], $attrs));

        $state->save();
        return $state;
    }

    public static function load(): ?static
    {
        $data = session('game');
        return $data ? new static($data) : null;
    }

    public function save(): void
    {
        session(['game' => $this->data]);
    }

    public static function clear(): void
    {
        session()->forget('game');
    }

    // ── UrlRoutable ──────────────────────────────────────────

    public function getRouteKey(): mixed
    {
        return 1;
    }

    public function getRouteKeyName(): string
    {
        return 'id';
    }

    public function resolveRouteBinding($value, $field = null): ?static
    {
        return static::load();
    }

    public function resolveChildRouteBinding($childType, $value, $field = null): ?static
    {
        return null;
    }

    // ── Property access ──────────────────────────────────────

    public function __get(string $key): mixed
    {
        if ($key === 'current_phase') {
            return GamePhase::from($this->data['current_phase']);
        }
        return $this->data[$key] ?? null;
    }

    public function __set(string $key, mixed $value): void
    {
        if ($key === 'current_phase' && $value instanceof GamePhase) {
            $this->data[$key] = $value->value;
        } else {
            $this->data[$key] = $value;
        }
    }

    public function __isset(string $key): bool
    {
        return isset($this->data[$key]);
    }

    // ── Bulk update ──────────────────────────────────────────

    public function update(array $attrs): void
    {
        foreach ($attrs as $k => $v) {
            if ($k === 'current_phase' && $v instanceof GamePhase) {
                $this->data[$k] = $v->value;
            } elseif ($k === 'current_phase' && is_string($v)) {
                $this->data[$k] = $v;
            } else {
                $this->data[$k] = $v;
            }
        }
        $this->save();
    }

    public function increment(string $key): void
    {
        $this->data[$key] = ($this->data[$key] ?? 0) + 1;
        $this->save();
    }

    public function refresh(): static
    {
        // No-op in session mode — data is always fresh in memory
        return $this;
    }

    // ── Players ──────────────────────────────────────────────

    public function addPlayer(array $player): int
    {
        $id = count($this->data['players']) + 1;
        $player['id'] = $id;
        $player['is_alive'] = $player['is_alive'] ?? true;
        $player['role'] = $player['role'] ?? null;
        $this->data['players'][] = $player;
        $this->save();
        return $id;
    }

    public function players(): array
    {
        return $this->data['players'];
    }

    public function alivePlayers(): array
    {
        return array_values(array_filter($this->data['players'], fn ($p) => $p['is_alive']));
    }

    public function findPlayer(int $id): ?array
    {
        foreach ($this->data['players'] as $p) {
            if ($p['id'] === $id) {
                return $p;
            }
        }
        return null;
    }

    public function updatePlayer(int $id, array $attrs): void
    {
        foreach ($this->data['players'] as &$p) {
            if ($p['id'] === $id) {
                $p = array_merge($p, $attrs);
                break;
            }
        }
        $this->save();
    }

    public function playersWithRole(string $role): array
    {
        return array_values(array_filter($this->data['players'], fn ($p) => $p['role'] === $role));
    }

    public function alivePlayersWithRole(string $role): array
    {
        return array_values(array_filter($this->data['players'], fn ($p) => $p['role'] === $role && $p['is_alive']));
    }

    public function killers(): array
    {
        return $this->playersWithRole(PlayerRole::SerialKiller->value);
    }

    public function aliveKillers(): array
    {
        return $this->alivePlayersWithRole(PlayerRole::SerialKiller->value);
    }

    // ── NPCs ─────────────────────────────────────────────────

    public function addNpc(array $npc): int
    {
        $id = count($this->data['npcs']) + 1;
        $npc['id'] = $id;
        $npc['is_alive'] = $npc['is_alive'] ?? true;
        $npc['is_threatened'] = $npc['is_threatened'] ?? false;
        $this->data['npcs'][] = $npc;
        $this->save();
        return $id;
    }

    public function npcs(): array
    {
        return $this->data['npcs'];
    }

    public function aliveNpcs(): array
    {
        return array_values(array_filter($this->data['npcs'], fn ($n) => $n['is_alive']));
    }

    public function findNpc(int $id): ?array
    {
        foreach ($this->data['npcs'] as $n) {
            if ($n['id'] === $id) {
                return $n;
            }
        }
        return null;
    }

    public function updateNpc(int $id, array $attrs): void
    {
        foreach ($this->data['npcs'] as &$n) {
            if ($n['id'] === $id) {
                $n = array_merge($n, $attrs);
                break;
            }
        }
        $this->save();
    }

    // ── Rounds ───────────────────────────────────────────────

    public function addRound(array $round): int
    {
        $id = count($this->data['rounds']) + 1;
        $round['id'] = $id;
        $this->data['rounds'][] = $round;
        $this->save();
        return $id;
    }

    public function currentRound(): ?array
    {
        foreach ($this->data['rounds'] as $r) {
            if ($r['round_number'] === $this->data['current_round']) {
                return $r;
            }
        }
        return null;
    }

    public function updateRound(int $id, array $attrs): void
    {
        foreach ($this->data['rounds'] as &$r) {
            if ($r['id'] === $id) {
                $r = array_merge($r, $attrs);
                break;
            }
        }
        $this->save();
    }

    public function roundHintNpcIds(): array
    {
        $ids = [];
        foreach ($this->data['rounds'] as $r) {
            if (!empty($r['hint_npc_id'])) {
                $ids[] = $r['hint_npc_id'];
            }
        }
        return $ids;
    }

    // ── Night Actions ────────────────────────────────────────

    public function addNightAction(array $action): void
    {
        $id = count($this->data['night_actions']) + 1;
        $action['id'] = $id;
        $this->data['night_actions'][] = $action;
        $this->save();
    }

    public function nightActionsForRound(int $roundNumber): array
    {
        return array_values(array_filter($this->data['night_actions'], fn ($a) => $a['round_number'] === $roundNumber));
    }

    // ── Votes ────────────────────────────────────────────────

    public function addVote(array $vote): void
    {
        $id = count($this->data['votes']) + 1;
        $vote['id'] = $id;
        $this->data['votes'][] = $vote;
        $this->save();
    }

    public function votesForRound(int $roundNumber, bool $isRunoff = false): array
    {
        return array_values(array_filter($this->data['votes'], fn ($v) =>
            $v['round_number'] === $roundNumber && $v['is_runoff'] === $isRunoff
        ));
    }

    public function voterIdsForRound(int $roundNumber, bool $isRunoff = false): array
    {
        return array_map(
            fn ($v) => $v['voter_player_id'],
            $this->votesForRound($roundNumber, $isRunoff)
        );
    }

    // ── Serialization for Inertia ────────────────────────────

    public function toArray(): array
    {
        return [
            'id' => $this->data['id'],
            'player_count' => $this->data['player_count'],
            'current_phase' => $this->data['current_phase'],
            'current_round' => $this->data['current_round'],
            'winner' => $this->data['winner'],
            'analyst_used' => $this->data['analyst_used'],
        ];
    }
}
