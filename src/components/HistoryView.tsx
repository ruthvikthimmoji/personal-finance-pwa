import React, { useState } from 'react';
import { FinanceData } from '../types';
import {
  formatMoney,
  formatDateLabel,
  getMonthHeader,
} from '../utils/format';
import { MonogramAvatar } from './MonogramAvatar';
import { ChangeChip } from './ChangeChip';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface HistoryViewProps {
  data: FinanceData;
  isPrivate: boolean;
  onOpenBalanceLogger: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  data,
  isPrivate,
  onOpenBalanceLogger,
}) => {
  const [filter, setFilter] = useState<'all' | 'balance' | 'investment'>('all');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  const balanceEntries = [...data.balanceLogs].reverse().map((b) => ({
    type: 'balance' as const,
    date: b.date,
    total: b.total,
    change: b.totalChange || 0,
    breakdown: b.balances,
  }));

  const investmentEntries = [...data.investmentLogs].reverse().map((inv) => ({
    type: 'investment' as const,
    date: inv.date,
    total: inv.totalValue,
    change: inv.totalEarnings,
    invested: inv.invested,
    earnings: inv.earnings,
  }));

  let combinedEntries = [];
  if (filter === 'all') {
    combinedEntries = [...balanceEntries, ...investmentEntries].sort((a, b) =>
      b.date.localeCompare(a.date)
    );
  } else if (filter === 'balance') {
    combinedEntries = balanceEntries;
  } else {
    combinedEntries = investmentEntries;
  }

  const groupedByMonth: Record<string, typeof combinedEntries> = {};
  combinedEntries.forEach((entry) => {
    const month = getMonthHeader(entry.date);
    if (!groupedByMonth[month]) {
      groupedByMonth[month] = [];
    }
    groupedByMonth[month].push(entry);
  });

  const toggleExpand = (id: string) => {
    setExpandedDate((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4 pb-28 px-4 max-w-lg mx-auto">
      {/* Screen Title */}
      <div className="px-1 pt-1">
        <h2 className="typography-title text-[#E6E9EC]">History</h2>
        <p className="typography-caption text-[#9CADBC] mt-0.5">
          Recorded updates from your Google Sheet
        </p>
      </div>

      {/* Segmented Control at Top: All · Balances · Investments */}
      <div className="flex p-1 bg-[#132238] border border-[#223854] rounded-[14px]">
        {(['all', 'balance', 'investment'] as const).map((tab) => {
          const isActive = filter === tab;
          const label =
            tab === 'all'
              ? 'All'
              : tab === 'balance'
              ? 'Balances'
              : 'Investments';

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`flex-1 h-9 rounded-[10px] text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#1A73E8] text-white shadow-sm'
                  : 'text-[#9CADBC] hover:text-[#E6E9EC]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {combinedEntries.length === 0 ? (
        <div className="bg-[#132238] border border-[#223854] rounded-[20px] p-8 text-center space-y-3 mt-6">
          <p className="typography-body text-[#9CADBC]">
            Nothing logged yet. Add your first balance to start your timeline.
          </p>
          <button
            type="button"
            onClick={onOpenBalanceLogger}
            className="h-[52px] px-6 rounded-[14px] bg-[#1A73E8] text-white font-semibold text-sm inline-flex items-center gap-2 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-white" strokeWidth={2} />
            <span>Add balance</span>
          </button>
        </div>
      ) : (
        /* Month Groups with Sticky Headers */
        <div className="space-y-6">
          {Object.entries(groupedByMonth).map(([month, entries]) => (
            <div key={month} className="space-y-2.5">
              {/* Sticky Month Header */}
              <div className="sticky top-[60px] z-10 bg-[#0D1B2A]/95 py-1 px-1 backdrop-blur-md">
                <span className="typography-caption uppercase tracking-wider text-[#9CADBC] font-semibold">
                  {month}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {entries.map((entry, idx) => {
                  const entryId = `${entry.type}-${entry.date}-${idx}`;
                  const isExpanded = expandedDate === entryId;

                  return (
                    <div
                      key={entryId}
                      className="bg-[#132238] border border-[#223854] rounded-[20px] overflow-hidden transition-all"
                    >
                      {/* Tappable Card Header */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(entryId)}
                        className="w-full p-4 flex items-center justify-between text-left hover:bg-[#1B2D4A]/40 active:bg-[#1B2D4A] transition-colors"
                      >
                        <div>
                          <div className="typography-body font-semibold text-[#E6E9EC]">
                            {formatDateLabel(entry.date)}
                          </div>
                          <div className="typography-caption text-[#9CADBC] mt-0.5">
                            {entry.type === 'balance' ? 'Bank & Cash balances' : 'Portfolio valuation'}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <div className="typography-amount-l text-[#E6E9EC]">
                              {formatMoney(entry.total, { isPrivate })}
                            </div>
                            <div className="mt-0.5">
                              {entry.type === 'balance' ? (
                                <ChangeChip
                                  amount={entry.change}
                                  isPrivate={isPrivate}
                                  size="sm"
                                />
                              ) : (
                                <span className="typography-caption text-[#2BC48A] font-medium">
                                  {formatMoney(entry.change, { isPrivate })} profit
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-[#9CADBC]">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" strokeWidth={1.75} />
                            ) : (
                              <ChevronDown className="w-5 h-5" strokeWidth={1.75} />
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Expanded Breakdown */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-[#223854] bg-[#1B2D4A]/40 space-y-2">
                          <div className="typography-caption uppercase tracking-wider text-[#9CADBC] mb-1">
                            Breakdown
                          </div>
                          {entry.type === 'balance' && entry.breakdown && (
                            <div className="space-y-1.5">
                              {Object.entries(entry.breakdown).map(([accName, val]) => (
                                <div
                                  key={accName}
                                  className="flex items-center justify-between typography-caption py-0.5"
                                >
                                  <div className="flex items-center gap-2">
                                    <MonogramAvatar
                                      name={accName}
                                      category={accName.toLowerCase().includes('cash') ? 'cash' : 'bank'}
                                      size="sm"
                                    />
                                    <span className="text-[#E6E9EC]">{accName}</span>
                                  </div>
                                  <span className="text-[#E6E9EC] font-medium">
                                    {formatMoney(val, { isPrivate, alwaysIncludePaise: val < 1000 })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {entry.type === 'investment' && entry.invested && (
                            <div className="space-y-1.5">
                              {Object.keys(entry.invested).map((name) => {
                                const invAmount = entry.invested?.[name] || 0;
                                const earnAmount = entry.earnings?.[name] || 0;
                                const totalVal = invAmount + earnAmount;

                                return (
                                  <div
                                    key={name}
                                    className="flex items-center justify-between typography-caption py-0.5"
                                  >
                                    <div className="flex items-center gap-2">
                                      <MonogramAvatar name={name} category="investment" size="sm" />
                                      <span className="text-[#E6E9EC]">{name}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-[#E6E9EC] font-medium">
                                        {formatMoney(totalVal, { isPrivate })}
                                      </span>
                                      <span
                                        className={`ml-1.5 ${
                                          earnAmount >= 0 ? 'text-[#2BC48A]' : 'text-[#FF6E8A]'
                                        }`}
                                      >
                                        ({earnAmount >= 0 ? '+' : ''}{formatMoney(earnAmount, { isPrivate })})
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
