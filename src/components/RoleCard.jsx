import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Shield, Eye, Brain, Scan, User } from 'lucide-react';

const roleIcons = {
    serial_killer: Skull,
    guardian: Shield,
    medium: Eye,
    analyst: Scan,
    seer: Brain,
    citizen: User,
};

const roleColors = {
    serial_killer: { text: 'text-blood', glow: 'glow-red', border: 'border-blood/40', bg: 'bg-blood/8', iconColor: '#d4364b' },
    guardian: { text: 'text-poison', glow: 'glow-green', border: 'border-poison/40', bg: 'bg-poison/8', iconColor: '#3ecf8e' },
    medium: { text: 'text-morphine', glow: 'glow-purple', border: 'border-morphine/40', bg: 'bg-morphine/8', iconColor: '#a78bfa' },
    analyst: { text: 'text-neon-blue', glow: 'glow-blue', border: 'border-neon-blue/40', bg: 'bg-neon-blue/8', iconColor: '#60a5fa' },
    seer: { text: 'text-amber-400', glow: 'glow-yellow', border: 'border-amber-400/40', bg: 'bg-amber-400/8', iconColor: '#f59e0b' },
    citizen: { text: 'text-cream', glow: '', border: 'border-tobacco', bg: 'bg-surface-2', iconColor: '#e8dcc8' },
};

export default function RoleCard({ player, revealed, onReveal, onNext, isLast }) {
    const role = player?.role || 'citizen';
    const style = roleColors[role] || roleColors.citizen;
    const Icon = roleIcons[role] || User;

    return (
        <div className="perspective-[1200px]">
            <motion.div
                className="relative w-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: revealed ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
                {/* Front - Hidden role */}
                <div
                    className="card-pulp text-center space-y-6 p-8 stamp-confidential"
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className="border border-tobacco rounded-xl p-5">
                        <h2 className="text-headline text-4xl text-cream">{player.name}</h2>
                    </div>

                    <div className="space-y-4 py-4">
                        <div className="w-20 h-20 rounded-full border-2 border-tobacco bg-surface-2 mx-auto flex items-center justify-center">
                            <span className="text-headline text-5xl text-cream/20">?</span>
                        </div>
                        <p className="text-quote text-cream/50 text-lg">Pronto a scoprire il tuo ruolo?</p>
                        <button className="btn-blood w-full py-4" onClick={onReveal}>
                            Rivela Ruolo
                        </button>
                    </div>
                </div>

                {/* Back - Revealed role */}
                <div
                    className={`card-pulp text-center space-y-6 p-8 absolute inset-0 ${style.border} border`}
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                    <div className={`border ${style.border} rounded-xl p-4 ${style.bg}`}>
                        <p className="text-ui text-cream/40 text-xs uppercase tracking-widest mb-1">{player.name}</p>
                    </div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={revealed ? { scale: 1, opacity: 1 } : {}}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="space-y-4 py-2"
                    >
                        <div className={`w-24 h-24 rounded-full border-2 ${style.border} ${style.bg} mx-auto flex items-center justify-center`}>
                            <Icon size={40} color={style.iconColor} strokeWidth={1.5} />
                        </div>

                        <p className={`text-headline text-5xl ${style.text} ${style.glow}`}>
                            {player.role_label}
                        </p>
                    </motion.div>

                    <div className="card-glass p-4">
                        <p className="text-cream/70 text-sm leading-relaxed">
                            {player.role_description}
                        </p>
                    </div>

                    <button
                        className={`btn-neon w-full ${
                            role === 'serial_killer' ? 'btn-neon-red'
                            : role === 'guardian' ? 'btn-neon-green'
                            : role === 'analyst' ? 'btn-neon-blue'
                            : 'btn-neon-yellow'
                        }`}
                        onClick={onNext}
                    >
                        {isLast ? 'Inizia Partita' : 'Giocatore Successivo'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export { roleColors, roleIcons };
