import React from 'react';
import PageTransition from './PageTransition';

const phaseGradients = {
    night: 'from-[#0a0c18] via-noir to-noir',
    morning: 'from-noir via-noir to-[#141210]',
    day: 'from-noir via-noir to-[#12130f]',
    vote: 'from-noir via-noir to-[#140d10]',
    default: '',
};

export default function PageShell({ children, className = '', vignette = false, phase = 'default' }) {
    const gradient = phaseGradients[phase] || phaseGradients.default;

    return (
        <PageTransition>
            <div className={`min-h-screen bg-noir noise-bg relative ${vignette ? 'vignette' : ''} ${className}`}>
                {gradient && (
                    <div className={`absolute inset-0 bg-gradient-to-b ${gradient} pointer-events-none`} />
                )}
                <div className="relative z-10">
                    {children}
                </div>
            </div>
        </PageTransition>
    );
}
