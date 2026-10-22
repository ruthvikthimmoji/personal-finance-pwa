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
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#17231E] text-[#9AA9A2] border border-[#223029]">
        ••••••
      </span>
    );
  }

  if (amount === undefined || amount === null || amount === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#17231E] text-[#64736C]">
        —
      </span>
    );
  }

  const isPositive = amount > 0;
  const isNegative = amount < 0;

  // Format amount with Indian grouping
  const formattedAmount = formatMoney(amount, { isChange: false });

  // Token colors from Page 4:
  // positive: #10B981
  // negative: #F87171 (soft red)
  const colorClasses = isPositive
    ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/25'
    : 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/25';

  const arrow = isPositive ? '▲' : '▼';
  const sign = isPositive ? PLUS_SIGN : MINUS_SIGN;
  const displayAmount = formattedAmount.replace('-', '').replace(MINUS_SIGN, '');

  let labelText = `${arrow} ${sign}${displayAmount}`;
  if (percent !== undefined && percent !== null) {
    const pctStr = `${Math.abs(percent).toFixed(1)}%`;
    labelText = `${arrow} ${sign}${displayAmount} (${sign}${pctStr})`;
  }

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
