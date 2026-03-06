import React from 'react';

const variants = {
    default: 'card-pulp',
    danger: 'card-pulp card-danger',
    neon: 'card-pulp card-neon',
    info: 'card-pulp card-info',
    vintage: 'card-pulp card-vintage',
};

export default function PulpCard({ children, variant = 'default', className = '', ...props }) {
    return (
        <div className={`${variants[variant] || variants.default} ${className}`} {...props}>
            {children}
        </div>
    );
}
