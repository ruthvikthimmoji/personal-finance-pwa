import React, { useState } from 'react';
import { FinanceData } from '../types';
import { formatINR, formatPercent, formatDateDisplay } from '../utils/format';
import {
  History,
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Landmark,
  PiggyBank,
} from 'lucide-react';

interface HistoryViewProps {
  data: FinanceData;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ data }) => {
  const [activeSubTab, setActiveSubTab] = useState<'balance' | 'investment'>('balance');
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  // Reverse logs to show most recent first
  const balanceLogsReversed = [...data.balanceLogs].reverse();
  const investmentLogsReversed = [...data.investmentLogs].reverse();

  const toggleExpand = (date: string) => {
    setExpandedDate((prev) => (prev === date ? null : date));
  };

  return (
    <div className="space-y-4 pb-24 px-4 pt-1 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">History & Logs</h2>
          <p className="text-xs text-slate-400">Past updates recorded in your Google Sheet</p>
        </div>
      </div>

      {/* Segmented Sub Tabs */}
      <div className="flex p-1 bg-slate-900/80 rounded-2xl border border-slate-800">
        <button
          onClick={() => setActiveSubTab('balance')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'balance'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Balance Logs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('investment')}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'investment'
              ? 'bg-cyan-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <PiggyBank className="w-3.5 h-3.5" />
          <span>Investment Logs</span>
        </button>
      </div>

      {/* Balance History List */}
      {activeSubTab === 'balance' && (
        <div className="space-y-2.5">
          {balanceLogsReversed.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">No balance logs found.</div>
          ) : (
            balanceLogsReversed.map((entry, idx) => {
              const isExpanded = expandedDate === entry.date;
              const change = entry.totalChange || 0;
              const hasChange = idx < balanceLogsReversed.length - 1 || change !== 0;

              return (
                <div
                  key={`${entry.date}-${idx}`}
                  className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleExpand(entry.date)}
                    className="w-full p-3.5 text-left flex items-center justify-between hover:bg-slate-800/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300">
                        <Calendar className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {formatDateDisplay(entry.date)}
                        </div>
                        <div className="text-xs text-slate-400">Total Balance</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="text-sm font-mono font-bold text-slate-100">
                          {formatINR(entry.total)}
                        </div>
                        {hasChange && (
                          <div
                            className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${
                              change > 0
                                ? 'text-emerald-400'
                                : change < 0
                                ? 'text-rose-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {change > 0 ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : change < 0 ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : null}
                            {change > 0 ? '+' : ''}
                            {formatINR(change)}
                          </div>
                        )}
                      </div>

                      <div className="text-slate-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Account Breakdown */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Breakdown by Account
                      </div>
                      {Object.entries(entry.balances).map(([acc, val]) => (
                        <div key={acc} className="flex items-center justify-between text-xs py-1">
                          <span className="text-slate-400">{acc}:</span>
                          <span className="font-mono text-slate-200 font-medium">
                            {formatINR(val)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Investment History List */}
      {activeSubTab === 'investment' && (
        <div className="space-y-2.5">
          {investmentLogsReversed.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">No investment logs found.</div>
          ) : (
            investmentLogsReversed.map((entry, idx) => {
              const isExpanded = expandedDate === `inv-${entry.date}`;
              const returnPct = entry.totalInvested > 0 ? (entry.totalEarnings / entry.totalInvested) * 100 : 0;

              return (
                <div
                  key={`inv-${entry.date}-${idx}`}
                  className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleExpand(`inv-${entry.date}`)}
                    className="w-full p-3.5 text-left flex items-center justify-between hover:bg-slate-800/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {formatDateDisplay(entry.date)}
                        </div>
                        <div className="text-xs text-slate-400">Portfolio Value</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="text-sm font-mono font-bold text-slate-100">
                          {formatINR(entry.totalValue)}
                        </div>
                        <div
                          className={`text-[11px] font-semibold ${
                            entry.totalEarnings >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {formatPercent(returnPct)} return
                        </div>
                      </div>

                      <div className="text-slate-500">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-2">
                      <div className="grid grid-cols-2 text-xs py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Total Invested:</span>
                        <span className="font-mono text-slate-200 text-right">{formatINR(entry.totalInvested)}</span>
                        <span className="text-slate-400">Total Profit/Loss:</span>
                        <span
                          className={`font-mono text-right font-semibold ${
                            entry.totalEarnings >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {entry.totalEarnings >= 0 ? '+' : ''}
                          {formatINR(entry.totalEarnings)}
                        </span>
                      </div>

                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Assets
                      </div>
                      {Object.keys(entry.invested).map((name) => {
                        const invVal = entry.invested[name] || 0;
                        const earnVal = entry.earnings[name] || 0;
                        return (
                          <div key={name} className="flex items-center justify-between text-xs py-1">
                            <span className="text-slate-300 font-medium">{name}</span>
                            <div className="text-right">
                              <span className="font-mono text-slate-200">{formatINR(invVal + earnVal)}</span>
                              <span
                                className={`text-[10px] ml-1.5 font-semibold ${
                                  earnVal >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                ({earnVal >= 0 ? '+' : ''}
                                {formatINR(earnVal).replace('₹', '')})
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
