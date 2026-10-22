import React from 'react';
import { formatMoney, PLUS_SIGN, MINUS_SIGN } from '../utils/format';

interface ChangeChipProps {
  amount: number | undefined | null;
  percent?: number | null;
  isPrivate?: boolean;
  size?: 'sm' | 'md';
}

export const ChangeChip: React.FC<ChangeChipProps> = ({
  amount,
  percent,
  isPrivate,
  size = 'md',
}) => {
  if (isPrivate) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#1A2142] text-[#A3ACD1] border border-[#262F57]">
        ••••••
      </span>
    );
  }

  if (amount === undefined || amount === null || amount === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#1A2142] text-[#6B7499]">
        —
      </span>
    );
  }

  const isPositive = amount > 0;

  // Format amount with Indian grouping
  const formattedAmount = formatMoney(amount, { isChange: false });

  // Semantic tokens from Page 4:
  // positive: #34D3A0 (mint)
  // negative: #FF6E8A (soft coral)
  const colorClasses = isPositive
    ? 'bg-[#34D3A0]/15 text-[#34D3A0] border-[#34D3A0]/25'
    : 'bg-[#FF6E8A]/15 text-[#FF6E8A] border-[#FF6E8A]/25';

  const arrow = isPositive ? '▲' : '▼';
  const sign = isPositive ? PLUS_SIGN : MINUS_SIGN;
  const displayAmount = formattedAmount.replace('-', '').replace(MINUS_SIGN, '');

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium border ${colorClasses} ${
        size === 'sm' ? 'text-[11px] leading-4' : 'text-xs leading-4'
      }`}
    >
      <span>{arrow}</span>
      <span>{sign}{displayAmount}</span>
      {percent !== undefined && percent !== null && (
        <span className="opacity-90">({sign}{Math.abs(percent).toFixed(1)}%)</span>
      )}
    </span>
  );
};
