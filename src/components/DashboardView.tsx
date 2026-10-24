import React, { useState, useEffect } from 'react';
import { FinanceData } from '../types';
import { formatMoney, formatPercent, getRelativeSyncTime } from '../utils/format';
import { MonogramAvatar } from './MonogramAvatar';
import { ChangeChip } from './ChangeChip';
import { AllocationBar } from './AllocationBar';
import { Sparkline } from './Sparkline';
import { Plus } from 'lucide-react';

interface DashboardViewProps {
  data: FinanceData;
  isPrivate: boolean;
  onOpenBalanceLogger: () => void;
  onOpenInvestmentLogger: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  isPrivate,
  onOpenBalanceLogger,
  onOpenInvestmentLogger,
}) => {
  const { summary, accountCards, investmentsMeta, balanceLogs } = data;

  const totalLiquid = summary.bankBalance + summary.cashInHand;
  const netWorth = summary.netWorth || totalLiquid + summary.currentInvestmentValue;

  // Calculate historical net worth points for sparkline
  const sparklinePoints: number[] = balanceLogs.map((entry, idx) => {
    const invVal = data.investmentLogs[idx]?.totalValue || summary.currentInvestmentValue;
    return entry.total + invVal;
  });
  if (sparklinePoints.length === 1) {
    sparklinePoints.unshift(sparklinePoints[0] * 0.95);
  }

  // Net worth change since last update
  const latestLog = balanceLogs[balanceLogs.length - 1];
  const netWorthChange = latestLog?.totalChange || 0;
  const netWorthChangePct = netWorth > 0 ? (netWorthChange / (netWorth - netWorthChange)) * 100 : 0;

  const syncStatus = getRelativeSyncTime(data.lastUpdated);

  // Number count-up for net worth (600ms ease-out)
  const [displayValue, setDisplayValue] = useState<number>(netWorth);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(netWorth);
      return;
    }

    const duration = 600;
    const startVal = displayValue;
    const endVal = netWorth;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (endVal - startVal) * ease;
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [netWorth]);

  return (
    <div className="space-y-4 pb-28 px-4 max-w-lg mx-auto">
      {/* 1. Net worth hero card (Deep navy surface: #132238, border: #223854) */}
      <div className="bg-[#132238] border border-[#223854] rounded-[20px] p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="typography-label text-[#9CADBC] uppercase tracking-wider">
            Net worth
          </span>
          <span
            className={`typography-caption ${
              syncStatus.isStale ? 'text-[#F59E0B]' : 'text-[#607387]'
            }`}
          >
            {syncStatus.text}
          </span>
        </div>

        {/* Display-size total: 40px bold in Soft Gray (#E6E9EC) */}
        <div className="flex items-baseline justify-between gap-2">
          <div className="typography-display text-[#E6E9EC]">
            {formatMoney(displayValue, { isPrivate, alwaysIncludePaise: false })}
          </div>
          {sparklinePoints.length >= 2 && !isPrivate && (
            <div className="shrink-0 pt-1">
              <Sparkline dataPoints={sparklinePoints} width={80} height={32} />
            </div>
          )}
        </div>

        {/* Change since last update */}
        <div className="flex items-center gap-2 pt-0.5">
          <ChangeChip
            amount={netWorthChange}
            percent={netWorthChangePct}
            isPrivate={isPrivate}
          />
          <span className="typography-caption text-[#9CADBC]">since last update</span>
        </div>

        {/* 2. Allocation Bar */}
        <div className="pt-2 border-t border-[#223854]">
          <AllocationBar
            bankTotal={summary.bankBalance}
            cashTotal={summary.cashInHand}
            investmentsTotal={summary.currentInvestmentValue}
            isPrivate={isPrivate}
          />
        </div>
      </div>

      {/* 5. Quick Actions: Exactly two persistent buttons (Primary blue: #1A73E8) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Primary button: solid Primary blue (#1A73E8), white text, 52px tall, 14px radius */}
        <button
          type="button"
          onClick={onOpenBalanceLogger}
          className="h-[52px] rounded-[14px] bg-[#1A73E8] hover:bg-[#2B82F6] active:scale-[0.98] active:bg-[#1558B0] text-white font-semibold text-[15px] flex items-center justify-center gap-2 shadow-sm shadow-[#1A73E8]/20 transition-all"
        >
          <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
          <span>Balance</span>
        </button>

        {/* Secondary button: elevated surface (#1B2D4A), subtle border (#223854), light text (#E6E9EC), 52px tall */}
        <button
          type="button"
          onClick={onOpenInvestmentLogger}
          className="h-[52px] rounded-[14px] bg-[#1B2D4A] hover:bg-[#223854] active:scale-[0.98] border border-[#223854] text-[#E6E9EC] font-semibold text-[15px] flex items-center justify-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5 text-[#9CADBC]" strokeWidth={2} />
          <span>Invest</span>
        </button>
      </div>

      {/* 3. Bank Accounts Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="typography-label uppercase tracking-wider text-[#9CADBC]">
            Bank & Cash
          </h2>
          <span className="typography-caption text-[#9CADBC]">
            {formatMoney(totalLiquid, { isPrivate })}
          </span>
        </div>

        <div className="space-y-2">
          {accountCards.map((account) => {
            const isCash = account.name.toLowerCase().includes('cash');
            const meta = data.accountsMeta.find((m) => m.name === account.name);
            const lastChange = meta?.lastChange || 0;

            return (
              <div
                key={account.name}
                className="bg-[#132238] border border-[#223854] rounded-[20px] p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <MonogramAvatar
                    name={account.name}
                    category={isCash ? 'cash' : 'bank'}
                  />
                  <div className="min-w-0">
                    <div className="typography-body font-semibold text-[#E6E9EC] truncate max-w-[170px]">
                      {account.name}
                    </div>
                    <div className="typography-caption text-[#9CADBC]">
                      {isCash ? 'Physical Cash' : meta?.type || 'Savings'}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="typography-amount-l text-[#E6E9EC]">
                    {formatMoney(account.latestBalance, { isPrivate })}
                  </div>
                  <div className="mt-0.5">
                    <ChangeChip
                      amount={lastChange}
                      isPrivate={isPrivate}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Investments Section */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="typography-label uppercase tracking-wider text-[#9CADBC]">
            Investments
          </h2>
          <span className="typography-caption text-[#9CADBC]">
            {formatMoney(summary.currentInvestmentValue, { isPrivate })}
          </span>
        </div>

        <div className="space-y-2">
          {investmentsMeta.map((inv) => {
            const isProfit = inv.latestEarnings >= 0;

            return (
              <div
                key={inv.name}
                className="bg-[#132238] border border-[#223854] rounded-[20px] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <MonogramAvatar name={inv.name} category="investment" />
                    <div className="min-w-0">
                      <div className="typography-body font-semibold text-[#E6E9EC] truncate max-w-[170px]">
                        {inv.name}
                      </div>
                      <div className="typography-caption text-[#9CADBC]">
                        {inv.platform ? `${inv.platform} · ` : ''}
                        {inv.type || 'Asset'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="typography-amount-l text-[#E6E9EC]">
                      {formatMoney(inv.currentValue, { isPrivate })}
                    </div>
                    <div className="mt-0.5 flex items-center justify-end">
                      <span
                        className={`typography-caption font-medium ${
                          isProfit ? 'text-[#2BC48A]' : 'text-[#FF6E8A]'
                        }`}
                      >
                        {formatPercent(inv.returnPct, isPrivate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#223854] flex items-center justify-between typography-caption text-[#9CADBC]">
                  <div>
                    <span>Invested: </span>
                    <span className="text-[#E6E9EC] font-medium">
                      {formatMoney(inv.latestInvested, { isPrivate })}
                    </span>
                  </div>
                  <div>
                    <span>Profit/loss: </span>
                    <span
                      className={`font-medium ${
                        isProfit ? 'text-[#2BC48A]' : 'text-[#FF6E8A]'
                      }`}
                    >
                      {formatMoney(inv.latestEarnings, { isPrivate, isChange: false })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
