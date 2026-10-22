import React from 'react';

interface MonogramAvatarProps {
  name: string;
  category: 'bank' | 'cash' | 'investment';
  size?: 'sm' | 'md' | 'lg';
}

export const getMonogram = (name: string): string => {
  const clean = name.trim();
  if (!clean) return '••';

  // Specific custom mappings
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

  // Asset allocation colors from Page 4:
  // Bank accounts: #10B981 (emerald)
  // Investments: #60A5FA (blue)
  // Cash in hand: #FBBF24 (amber)
  let bgStyle = 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30';
  if (category === 'cash') {
    bgStyle = 'bg-[#FBBF24]/15 text-[#FBBF24] border-[#FBBF24]/30';
  } else if (category === 'investment') {
    bgStyle = 'bg-[#60A5FA]/15 text-[#60A5FA] border-[#60A5FA]/30';
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
