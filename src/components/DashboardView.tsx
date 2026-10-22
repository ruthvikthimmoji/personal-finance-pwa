import React from 'react';
import { FinanceData } from '../types';
import { formatINR, formatPercent } from '../utils/format';
import {
  TrendingUp,
  Wallet,
  Landmark,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  ChevronRight,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';

interface DashboardViewProps {
  data: FinanceData;
  onNavigateToTab: (tab: 'dashboard' | 'update-balance' | 'update-invest' | 'history' | 'settings') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ data, onNavigateToTab }) => {
  const { summary, accountCards, investmentsMeta } = data;

  const totalLiquid = summary.bankBalance + summary.cashInHand;
  const netWorth = summary.netWorth || totalLiquid + summary.currentInvestmentValue;

  const bankPct = netWorth > 0 ? (summary.bankBalance / netWorth) * 100 : 0;
  const cashPct = netWorth > 0 ? (summary.cashInHand / netWorth) * 100 : 0;
  const invPct = netWorth > 0 ? (summary.currentInvestmentValue / netWorth) * 100 : 0;

  return (
    <div className="space-y-5 pb-24 px-4 pt-1 max-w-lg mx-auto">
      {/* Net Worth Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950 border border-slate-800 shadow-2xl p-5">
        <div className="absolute -right-8 -top-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-44 h-44 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Total Net Worth</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-3 h-3" />
              {formatPercent(summary.overallReturnPct)} Returns
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {formatINR(netWorth)}
            </h2>
          </div>

          {/* Allocation Bar */}
          <div className="mt-4">
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${bankPct}%` }}
                className="bg-blue-500 transition-all duration-500"
                title={`Bank: ${bankPct.toFixed(1)}%`}
              />
              <div
                style={{ width: `${cashPct}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Cash: ${cashPct.toFixed(1)}%`}
              />
              <div
                style={{ width: `${invPct}%` }}
                className="bg-emerald-400 transition-all duration-500"
                title={`Investments: ${invPct.toFixed(1)}%`}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Bank ({bankPct.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Cash ({cashPct.toFixed(0)}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Invested ({invPct.toFixed(0)}%)</span>
              </div>
            </div>
          </div>

          {/* Two Sub-Pills */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-800/40 rounded-xl p-2.5 border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Wallet className="w-3.5 h-3.5 text-blue-400" />
                <span>Bank & Cash</span>
              </div>
              <div className="text-sm font-bold text-slate-100 mt-1">
                {formatINR(totalLiquid)}
              </div>
            </div>

            <div className="bg-slate-800/40 rounded-xl p-2.5 border border-slate-800/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>Investments</span>
              </div>
              <div className="text-sm font-bold text-emerald-300 mt-1">
                {formatINR(summary.currentInvestmentValue)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigateToTab('update-balance')}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition-all hover:brightness-110"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs text-emerald-100 font-medium">Log Today</div>
              <div className="text-sm font-bold">Balances</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-emerald-200" />
        </button>

        <button
          onClick={() => onNavigateToTab('update-invest')}
          className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-medium shadow-lg shadow-cyan-950/40 active:scale-[0.98] transition-all hover:brightness-110"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs text-cyan-100 font-medium">Log Today</div>
              <div className="text-sm font-bold">Investments</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-200" />
        </button>
      </div>

      {/* Bank & Cash Accounts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Landmark className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bank & Cash Accounts</h3>
          </div>
          <button
            onClick={() => onNavigateToTab('update-balance')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Update
          </button>
        </div>

        <div className="space-y-2">
          {accountCards.map((account) => {
            const isCash = account.name.toLowerCase().includes('cash');
            return (
              <div
                key={account.name}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isCash
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                    }`}
                  >
                    {isCash ? <Coins className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{account.name}</div>
                    <div className="text-xs text-slate-400">
                      {isCash ? 'Physical Cash' : 'Bank Balance'}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm font-bold text-slate-100">{formatINR(account.latestBalance)}</div>
                  {(account.totalAdded > 0 || account.totalDeducted > 0) && (
                    <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                      <span className="text-emerald-400">+{formatINR(account.totalAdded).replace('₹', '')}</span>
                      <span>/</span>
                      <span className="text-rose-400">-{formatINR(account.totalDeducted).replace('₹', '')}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Investment Portfolio Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Investments</h3>
          </div>
          <button
            onClick={() => onNavigateToTab('update-invest')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            Update
          </button>
        </div>

        <div className="space-y-2">
          {investmentsMeta.map((inv) => {
            const isProfit = inv.latestEarnings >= 0;
            return (
              <div
                key={inv.name}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      {inv.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">{inv.name}</div>
                      <div className="text-xs text-slate-400">
                        {inv.platform ? `${inv.platform} • ` : ''}
                        {inv.type || 'Investment'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{formatINR(inv.currentValue)}</div>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
                        isProfit ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isProfit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {formatPercent(inv.returnPct)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60 grid grid-cols-2 text-xs">
                  <div>
                    <span className="text-slate-400">Invested: </span>
                    <span className="text-slate-200 font-medium">{formatINR(inv.latestInvested)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Earnings: </span>
                    <span className={`font-medium ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatINR(inv.latestEarnings)}
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
