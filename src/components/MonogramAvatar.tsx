import React from 'react';

interface MonogramAvatarProps {
  name: string;
  category: 'bank' | 'cash' | 'investment';
  size?: 'sm' | 'md' | 'lg';
}

export const getMonogram = (name: string): string => {
  const clean = name.trim();
  if (!clean) return '••';

  const lower = clean.toLowerCase();
  if (lower.includes('cash')) return 'CH';
  if (lower.includes('hdfc')) return 'HD';
  if (lower.includes('sbi')) return 'SB';
  if (lower.includes('indian')) return 'IB';
  if (lower.includes('canra') || lower.includes('canara')) return 'CB';
  if (lower.includes('stock')) return 'ST';
  if (lower.includes('long term')) return 'LT';
  if (lower.includes('apy')) return 'AP';
  if (lower.includes('zerodha')) return 'ZE';
  if (lower.includes('groww')) return 'GR';
  if (lower.includes('nps')) return 'NP';

  const parts = clean.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

export const MonogramAvatar: React.FC<MonogramAvatarProps> = ({
  name,
  category,
  size = 'md',
}) => {
  const monogram = getMonogram(name);

  // New Asset allocation colors from Page 4:
  // Bank accounts: #5B6CFF (indigo)
  // Investments: #22D3EE (cyan)
  // Cash in hand: #F5C76B (gold)
  let bgStyle = 'bg-[#5B6CFF]/15 text-[#5B6CFF] border-[#5B6CFF]/30';
  if (category === 'cash') {
    bgStyle = 'bg-[#F5C76B]/15 text-[#F5C76B] border-[#F5C76B]/30';
  } else if (category === 'investment') {
    bgStyle = 'bg-[#22D3EE]/15 text-[#22D3EE] border-[#22D3EE]/30';
  }

  const sizeClass =
    size === 'sm'
      ? 'w-7 h-7 text-[11px] rounded-lg'
      : size === 'lg'
      ? 'w-11 h-11 text-sm rounded-xl'
      : 'w-9 h-9 text-xs rounded-xl';

  return (
    <div
      className={`${sizeClass} ${bgStyle} font-semibold border flex items-center justify-center shrink-0 tracking-wider`}
      aria-hidden="true"
    >
      {monogram}
    </div>
  );
};
