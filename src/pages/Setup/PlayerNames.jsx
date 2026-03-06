import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/engine/gameState';
import { assignRoles, getDistribution, OPTIONAL_ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/engine/roles';
import { generateNpcs } from '@/engine/npcGenerator';
import { Skull, Shield, Eye, Scan, Brain, User, Plus, X, Check, Loader2 } from 'lucide-react';
import PageShell from '@/components/PageShell';
import Headline from '@/components/Headline';
import PulpCard from '@/components/PulpCard';
import NeonButton from '@/components/NeonButton';

const roleConfig = {
    guardian: { icon: Shield, color: '#3ecf8e', text: 'text-poison', border: 'border-poison', bg: 'bg-poison/8' },
    medium: { icon: Eye, color: '#a78bfa', text: 'text-morphine', border: 'border-morphine', bg: 'bg-morphine/8' },
    analyst: { icon: Scan, color: '#60a5fa', text: 'text-neon-blue', border: 'border-neon-blue', bg: 'bg-neon-blue/8' },
    seer: { icon: Brain, color: '#f59e0b', text: 'text-amber-400', border: 'border-amber-400', bg: 'bg-amber-400/8' },
};

export default function PlayerNames() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const [step, setStep] = useState('names');
    const [names, setNames] = useState(['', '', '', '', '', '']);
    const [enabledRoles, setEnabledRoles] = useState(new Set(OPTIONAL_ROLES));
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const validNames = useMemo(() => names.filter((n) => n.trim()), [names]);

    const distribution = useMemo(
        () => getDistribution(validNames.length),
        [validNames.length]
    );

    const updateName = (index, value) => {
        const updated = [...names];
        updated[index] = value;
        setNames(updated);
    };

    const addPlayer = () => {
        if (names.length < 10) {
            setNames([...names, '']);
        }
    };

    const removePlayer = (index) => {
        if (names.length > 4) {
            setNames(names.filter((_, i) => i !== index));
        }
    };

    const goToRoles = () => {
        if (validNames.length < 4) {
            setError('Servono almeno 4 giocatori');
            return;
        }
        setError('');
        setStep('roles');
    };

    const toggleRole = (role) => {
        setEnabledRoles(prev => {
            const next = new Set(prev);
            if (next.has(role)) {
                next.delete(role);
            } else {
                next.add(role);
            }
            return next;
        });
    };

    const submit = async () => {
        setLoading(true);
        setError('');

        try {
            const players = validNames.map((name, i) => ({
                id: crypto.randomUUID(),
                name: name.trim(),
                sort_order: i,
                is_alive: true,
                role: null,
                role_label: null,
                role_description: null,
            }));

            const playersWithRoles = assignRoles(players, [...enabledRoles]);
            const killerIds = playersWithRoles.filter(p => p.role === 'serial_killer').map(p => p.id);
            const npcs = await generateNpcs(playersWithRoles, killerIds);

            dispatch({
                type: ACTIONS.SET_PLAYERS,
                payload: playersWithRoles,
            });

            dispatch({
                type: ACTIONS.SET_NPCS,
                payload: npcs,
            });

            navigate('/roles');
        } catch (err) {
            console.error('Setup error:', err);
            setError('Errore durante la configurazione. Riprova.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageShell>
            <div className="p-6 max-w-2xl mx-auto">

                {/* Step indicator */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    {['Nomi', 'Ruoli'].map((label, i) => {
                        const stepIndex = i === 0 ? 'names' : 'roles';
                        const isActive = step === stepIndex;
                        const isDone = step === 'roles' && i === 0;
                        return (
                            <div key={label} className="flex items-center gap-2">
                                {i > 0 && <div className="w-8 h-px bg-tobacco" />}
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                                    isDone ? 'bg-poison/20 text-poison' :
                                    isActive ? 'bg-taxi/20 text-taxi' : 'bg-tobacco text-cream/30'
                                }`}>
                                    {isDone ? <Check size={14} /> : i + 1}
                                </div>
                                <span className={`text-ui text-xs ${isActive ? 'text-cream/70' : 'text-cream/30'}`}>{label}</span>
                            </div>
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="card-pulp card-danger p-4 mb-6"
                        >
                            <p className="text-ui text-blood font-semibold text-sm">{error}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Step 1: Player Names */}
                {step === 'names' && (
                    <motion.div
                        key="names"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                    >
                        <Headline glow="yellow" subtitle="Inserisci i nomi dei sospetti">
                            SETUP PARTITA
                        </Headline>

                        <div className="space-y-3 mb-6">
                            {names.map((name, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="flex gap-3"
                                >
                                    <div className="flex-1 relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-headline text-cream/20 text-sm">
                                            #{String(i + 1).padStart(2, '0')}
                                        </span>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => updateName(i, e.target.value)}
                                            placeholder={`Sospetto ${i + 1}`}
                                            className="input-typewriter w-full pl-14"
                                            maxLength={30}
                                        />
                                    </div>
                                    {names.length > 4 && (
                                        <button
                                            onClick={() => removePlayer(i)}
                                            className="w-10 h-10 rounded-lg border border-blood/30 bg-blood/8 flex items-center justify-center text-blood hover:bg-blood/15 transition-colors self-center"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex gap-3 mb-8">
                            {names.length < 10 && (
                                <button
                                    onClick={addPlayer}
                                    className="flex-1 btn-neon btn-neon-yellow flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Aggiungi
                                </button>
                            )}
                            <button className="flex-1 btn-blood" onClick={goToRoles}>
                                Avanti
                            </button>
                        </div>

                        <div className="pt-6 border-t border-tobacco/20 text-center">
                            <p className="text-ui text-cream/30 text-xs">
                                Da 4 a 10 giocatori per un'esperienza ottimale
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Role Selection */}
                {step === 'roles' && (
                    <motion.div
                        key="roles"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                    >
                        <Headline glow="red" subtitle={`${validNames.length} giocatori`}>
                            SCEGLI I RUOLI
                        </Headline>

                        {/* Serial Killer - always present */}
                        <PulpCard variant="vintage" className="p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blood/10 flex items-center justify-center flex-shrink-0">
                                    <Skull size={18} color="#d4364b" strokeWidth={1.5} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-headline text-blood text-lg">Serial Killer</p>
                                    <p className="text-ui text-cream/40 text-xs mt-0.5">x{distribution.serial_killer}</p>
                                </div>
                                <span className="text-cream/25 text-xs italic">sempre attivo</span>
                            </div>
                        </PulpCard>

                        {/* Toggleable roles */}
                        <div className="space-y-3 mb-6">
                            {OPTIONAL_ROLES.map((role, i) => {
                                const count = distribution[role];
                                const active = enabledRoles.has(role) && count > 0;
                                const unavailable = count === 0;
                                const config = roleConfig[role];
                                const Icon = config.icon;

                                return (
                                    <motion.button
                                        key={role}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        onClick={() => !unavailable && toggleRole(role)}
                                        disabled={unavailable}
                                        className={`w-full text-left card-pulp p-4 transition-all ${
                                            active
                                                ? `${config.border} ${config.bg} border`
                                                : unavailable
                                                    ? 'opacity-25 cursor-not-allowed'
                                                    : 'opacity-50 hover:opacity-70'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: `${config.color}15` }}
                                            >
                                                <Icon size={18} color={active ? config.color : '#555'} strokeWidth={1.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-headline text-lg ${active ? config.text : 'text-cream/40'}`}>
                                                    {ROLE_LABELS[role]}
                                                </p>
                                                <p className="text-ui text-cream/35 text-xs mt-0.5 line-clamp-1">
                                                    {ROLE_DESCRIPTIONS[role]}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 ml-2 shrink-0">
                                                {!unavailable && (
                                                    <span className={`text-sm ${active ? config.text : 'text-cream/30'}`}>
                                                        x{count}
                                                    </span>
                                                )}
                                                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                                                    active
                                                        ? `${config.border} ${config.bg}`
                                                        : 'border-tobacco'
                                                }`}>
                                                    {active && <Check size={14} color={config.color} />}
                                                </div>
                                            </div>
                                        </div>
                                        {unavailable && (
                                            <p className="text-ui text-cream/25 text-xs mt-2 italic pl-12">
                                                Non disponibile con {validNames.length} giocatori
                                            </p>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Citizen - always present */}
                        <PulpCard variant="vintage" className="p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0">
                                    <User size={18} color="#e8dcc8" strokeWidth={1.5} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-headline text-cream/60 text-lg">Cittadino</p>
                                    <p className="text-ui text-cream/35 text-xs mt-0.5">I posti rimanenti</p>
                                </div>
                                <span className="text-cream/25 text-xs italic">sempre attivo</span>
                            </div>
                        </PulpCard>

                        <div className="flex gap-3">
                            <NeonButton color="yellow" onClick={() => setStep('names')} disabled={loading} className="flex-1">
                                Indietro
                            </NeonButton>
                            <button className="flex-1 btn-blood" onClick={submit} disabled={loading}>
                                {loading ? 'Caricamento...' : 'Inizia Partita'}
                            </button>
                        </div>

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center mt-6 space-y-3"
                            >
                                <p className="text-quote text-taxi text-lg">Generando profili sospetti...</p>
                                <div className="flex justify-center">
                                    <Loader2 size={24} className="text-taxi animate-spin" />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </PageShell>
    );
}
