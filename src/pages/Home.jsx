import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@/engine/gameState';
import { Skull, Users, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import PageShell from '@/components/PageShell';
import NeonButton from '@/components/NeonButton';

function HowToPlay() {
    const [open, setOpen] = useState(false);

    const rules = [
        { icon: Skull, color: '#d4364b', title: 'Serial Killer', desc: 'Di notte sceglie un NPC da uccidere o minacciare. Vince eliminando tutti gli NPC.' },
        { icon: Shield, color: '#3ecf8e', title: 'Guardiano', desc: "Di notte protegge un NPC dall'attacco del killer." },
        { icon: Users, color: '#e8dcc8', title: 'Cittadini', desc: 'Di giorno discutono gli indizi e votano per eliminare chi sospettano.' },
    ];

    return (
        <div className="mt-8">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-center gap-2 text-cream/40 text-sm hover:text-cream/60 transition-colors py-2"
            >
                <span className="text-ui">Come si gioca</span>
                {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-3 pt-4">
                            {rules.map((rule, i) => (
                                <motion.div
                                    key={rule.title}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="card-glass p-4 flex gap-4 items-start"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0">
                                        <rule.icon size={20} color={rule.color} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <p className="text-ui text-sm font-semibold text-cream/90">{rule.title}</p>
                                        <p className="text-ui text-xs text-cream/50 mt-1 leading-relaxed">{rule.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function Home() {
    const navigate = useNavigate();
    const { state, dispatch, ACTIONS } = useGame();

    const startNewGame = () => {
        dispatch({ type: ACTIONS.INIT_GAME });
        navigate('/setup/names');
    };

    const continueGame = () => {
        if (state.id) {
            navigate(`/setup/names`);
        }
    };

    return (
        <PageShell className="flex items-center justify-center p-4">
            {/* Soft ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-80 h-80 bg-blood/10 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-neon-pink/5 rounded-full blur-[140px]" />
                <div className="absolute top-[30%] right-[10%] w-40 h-40 bg-taxi/8 rounded-full blur-[100px]" />
            </div>

            <div className="relative max-w-md w-full text-center z-10">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-14"
                >
                    <h1 className="text-headline text-8xl text-blood glow-red leading-none mb-1">
                        TRUST
                    </h1>
                    <h1 className="text-headline text-8xl text-taxi glow-yellow leading-none mb-6">
                        NOBODY
                    </h1>
                    <p className="text-quote text-cream/50 text-lg">
                        Un gioco di bugie e sospetti
                    </p>
                </motion.div>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-3 mb-8"
                >
                    <button className="btn-blood w-full text-base py-4" onClick={startNewGame}>
                        Nuova Partita
                    </button>

                    {state.id && (
                        <NeonButton color="blue" onClick={continueGame}>
                            Continua Partita
                        </NeonButton>
                    )}
                </motion.div>

                {/* How to play accordion */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <HowToPlay />
                </motion.div>

                {/* Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-14 pt-6 border-t border-tobacco/20"
                >
                    <p className="text-headline text-cream/25 text-sm tracking-widest">Master di partita</p>
                    <p className="text-ui text-cream/25 text-xs mt-2">
                        Il telefono rimane con il master durante tutto il gioco.
                    </p>
                </motion.div>
            </div>
        </PageShell>
    );
}
