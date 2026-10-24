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
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F3EFE6] text-[#5E6A75] border border-[#E8E3DA]">
        ••••••
      </span>
    );
  }

  if (amount === undefined || amount === null || amount === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#F3EFE6] text-[#8C9BA8]">
        —
      </span>
    );
  }

  const isPositive = amount > 0;

  // Format amount with Indian grouping
  const formattedAmount = formatMoney(amount, { isChange: false });

  // Semantic tokens:
  // positive: #16A34A (Fintech green)
  // negative: #DC2626 (Fintech red)
  const colorClasses = isPositive
    ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20'
    : 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20';

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
