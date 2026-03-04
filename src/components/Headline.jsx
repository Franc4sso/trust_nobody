import React from 'react';

const glowMap = {
    red: 'glow-red text-blood',
    pink: 'glow-pink text-neon-pink',
    blue: 'glow-blue text-neon-blue',
    yellow: 'glow-yellow text-taxi',
    green: 'glow-green text-poison',
    purple: 'glow-purple text-morphine',
    cream: 'text-cream',
};

export default function Headline({ children, subtitle, glow = 'yellow', className = '', as: Tag = 'h1' }) {
    return (
        <div className={`text-center mb-8 animate-fade-in-up ${className}`}>
            <Tag className={`text-headline text-5xl ${glowMap[glow] || glowMap.yellow}`}>
                {children}
            </Tag>
            {subtitle && (
                <p className="text-quote text-cream/70 text-lg mt-2">
                    {subtitle}
                </p>
            )}
        </div>
    );
}
