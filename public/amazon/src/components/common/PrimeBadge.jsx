import React from 'react';

const PrimeBadge = ({ size = 'sm' }) => {
  const cls = size === 'lg'
    ? 'text-sm px-1.5 py-0.5'
    : 'text-xs px-1 py-0.5';
  return (
    <span
      className={`inline-flex items-center font-bold rounded-sm ${cls}`}
      style={{ background: '#00A8E1', color: '#fff', letterSpacing: '0.5px' }}
    >
      prime
    </span>
  );
};

export default PrimeBadge;
