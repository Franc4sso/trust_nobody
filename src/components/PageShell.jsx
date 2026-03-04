import React from 'react';

export default function PageShell({ children, className = '', vignette = false }) {
    return (
        <div className={`min-h-screen bg-noir noise-bg relative ${vignette ? 'vignette' : ''} ${className}`}>
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
