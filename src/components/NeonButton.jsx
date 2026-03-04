import React from 'react';

const colorClasses = {
    red: 'btn-neon btn-neon-red',
    blue: 'btn-neon btn-neon-blue',
    yellow: 'btn-neon btn-neon-yellow',
    green: 'btn-neon btn-neon-green',
    pink: 'btn-neon',
};

export default function NeonButton({ children, color = 'pink', className = '', ...props }) {
    return (
        <button className={`${colorClasses[color] || colorClasses.pink} w-full ${className}`} {...props}>
            {children}
        </button>
    );
}
