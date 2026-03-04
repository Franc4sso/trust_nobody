import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from '@/engine/gameState';

// Pages
import Home from '@/pages/Home';
import PlayerNames from '@/pages/Setup/PlayerNames';
import RoleReveal from '@/pages/Setup/RoleReveal';
import NpcIntroductions from '@/pages/N1/NpcIntroductions';
import FirstVote from '@/pages/N1/FirstVote';
import MasterNightPanel from '@/pages/Night/MasterNightPanel';
import NpcHint from '@/pages/Morning/NpcHint';
import Discussion from '@/pages/Day/Discussion';
import MasterVotePanel from '@/pages/Vote/MasterVotePanel';
import VoteResult from '@/pages/Vote/VoteResult';
import MediumReveal from '@/pages/Vote/MediumReveal';
import GameOver from '@/pages/GameOver';

// Guard component that ensures a game exists
function RequireGame({ children }) {
    const { state } = useGame();
    if (!state.id) {
        return <Navigate to="/" replace />;
    }
    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />

            <Route
                path="/setup/names"
                element={
                    <RequireGame>
                        <PlayerNames />
                    </RequireGame>
                }
            />
            <Route
                path="/roles"
                element={
                    <RequireGame>
                        <RoleReveal />
                    </RequireGame>
                }
            />

            <Route
                path="/n1/intro"
                element={
                    <RequireGame>
                        <NpcIntroductions />
                    </RequireGame>
                }
            />
            <Route
                path="/n1/vote"
                element={
                    <RequireGame>
                        <FirstVote />
                    </RequireGame>
                }
            />

            <Route
                path="/night"
                element={
                    <RequireGame>
                        <MasterNightPanel />
                    </RequireGame>
                }
            />

            <Route
                path="/morning/hint"
                element={
                    <RequireGame>
                        <NpcHint />
                    </RequireGame>
                }
            />

            <Route
                path="/day"
                element={
                    <RequireGame>
                        <Discussion />
                    </RequireGame>
                }
            />

            <Route
                path="/vote/panel"
                element={
                    <RequireGame>
                        <MasterVotePanel />
                    </RequireGame>
                }
            />
            <Route
                path="/vote/result"
                element={
                    <RequireGame>
                        <VoteResult />
                    </RequireGame>
                }
            />
            <Route
                path="/vote/medium-reveal"
                element={
                    <RequireGame>
                        <MediumReveal />
                    </RequireGame>
                }
            />

            <Route
                path="/game-over"
                element={
                    <RequireGame>
                        <GameOver />
                    </RequireGame>
                }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <GameProvider>
            <HashRouter>
                <AppRoutes />
            </HashRouter>
        </GameProvider>
    );
}
