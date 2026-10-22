import React, { useState } from 'react';
import { formatMoney } from '../utils/format';

interface AllocationBarProps {
  bankTotal: number;
  cashTotal: number;
  investmentsTotal: number;
  isPrivate?: boolean;
}

export const AllocationBar: React.FC<AllocationBarProps> = ({
  bankTotal,
  cashTotal,
  investmentsTotal,
  isPrivate,
}) => {
  const [highlightedCategory, setHighlightedCategory] = useState<
    'bank' | 'cash' | 'investment' | null
  >(null);

  const total = bankTotal + cashTotal + investmentsTotal;
  const bankPct = total > 0 ? (bankTotal / total) * 100 : 0;
  const cashPct = total > 0 ? (cashTotal / total) * 100 : 0;
  const invPct = total > 0 ? (investmentsTotal / total) * 100 : 0;

  const toggleHighlight = (cat: 'bank' | 'cash' | 'investment') => {
    setHighlightedCategory((prev) => (prev === cat ? null : cat));
  };

  return (
    <div className="space-y-2.5">
      {/* 8px tall segmented bar with 2px gaps */}
      <div className="h-2 w-full bg-[#17231E] rounded-full overflow-hidden flex gap-[2px]">
        {bankPct > 0 && (
          <div
            style={{ width: `${bankPct}%` }}
            className={`h-full bg-[#10B981] rounded-l-full transition-all duration-300 ${
              highlightedCategory && highlightedCategory !== 'bank'
                ? 'opacity-30'
                : 'opacity-100'
            }`}
            title={`Bank accounts: ${bankPct.toFixed(1)}%`}
          />
        )}
        {cashPct > 0 && (
          <div
            style={{ width: `${cashPct}%` }}
            className={`h-full bg-[#FBBF24] transition-all duration-300 ${
              highlightedCategory && highlightedCategory !== 'cash'
                ? 'opacity-30'
                : 'opacity-100'
            }`}
            title={`Cash in hand: ${cashPct.toFixed(1)}%`}
          />
        )}
        {invPct > 0 && (
          <div
            style={{ width: `${invPct}%` }}
            className={`h-full bg-[#60A5FA] rounded-r-full transition-all duration-300 ${
              highlightedCategory && highlightedCategory !== 'investment'
                ? 'opacity-30'
                : 'opacity-100'
            }`}
            title={`Investments: ${invPct.toFixed(1)}%`}
          />
        )}
      </div>

      {/* Legend with interactive highlight on tap */}
      <div className="flex items-center justify-between text-xs text-[#9AA9A2] pt-0.5">
        <button
          type="button"
          onClick={() => toggleHighlight('bank')}
          className={`flex items-center gap-1.5 transition-opacity active:opacity-75 ${
            highlightedCategory && highlightedCategory !== 'bank' ? 'opacity-40' : 'opacity-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>Bank ({bankPct.toFixed(0)}%)</span>
        </button>

        <button
          type="button"
          onClick={() => toggleHighlight('cash')}
          className={`flex items-center gap-1.5 transition-opacity active:opacity-75 ${
            highlightedCategory && highlightedCategory !== 'cash' ? 'opacity-40' : 'opacity-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
          <span>Cash ({cashPct.toFixed(0)}%)</span>
        </button>

        <button
          type="button"
          onClick={() => toggleHighlight('investment')}
          className={`flex items-center gap-1.5 transition-opacity active:opacity-75 ${
            highlightedCategory && highlightedCategory !== 'investment' ? 'opacity-40' : 'opacity-100'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
          <span>Invested ({invPct.toFixed(0)}%)</span>
        </button>
      </div>
    </div>
  );
};
