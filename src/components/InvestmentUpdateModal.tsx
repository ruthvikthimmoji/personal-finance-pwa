import React, { useState } from 'react';
import { FinanceData } from '../types';
import { formatINR, formatPercent, getTodayDateInputString } from '../utils/format';
import { saveInvestmentLog } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  PiggyBank,
} from 'lucide-react';

interface InvestmentUpdateProps {
  data: FinanceData;
  onSuccess: () => void;
  onCancel: () => void;
}

export const InvestmentUpdateView: React.FC<InvestmentUpdateProps> = ({
  data,
  onSuccess,
  onCancel,
}) => {
  const [date, setDate] = useState<string>(getTodayDateInputString());

  // Initialize values
  const initialInvestments: Record<string, { invested: string; earnings: string }> = {};
  data.investmentsMeta.forEach((inv) => {
    initialInvestments[inv.name] = {
      invested: inv.latestInvested > 0 ? String(inv.latestInvested) : '',
      earnings: inv.latestEarnings !== 0 ? String(inv.latestEarnings) : '',
    };
  });

  const [investments, setInvestments] = useState(initialInvestments);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFieldChange = (name: string, field: 'invested' | 'earnings', value: string) => {
    setInvestments((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: value,
      },
    }));
  };

  const handleReset = () => {
    setInvestments(initialInvestments);
  };

  // Live calculations
  let totalInvested = 0;
  let totalEarnings = 0;

  Object.values(investments).forEach((item) => {
    const inv = parseFloat(item.invested);
    const earn = parseFloat(item.earnings);
    if (!isNaN(inv)) totalInvested += inv;
    if (!isNaN(earn)) totalEarnings += earn;
  });

  const totalCurrentValue = totalInvested + totalEarnings;
  const overallReturn = totalInvested > 0 ? (totalEarnings / totalInvested) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload: Record<string, { invested: number; earnings: number }> = {};
      Object.entries(investments).forEach(([k, v]) => {
        payload[k] = {
          invested: parseFloat(v.invested) || 0,
          earnings: parseFloat(v.earnings) || 0,
        };
      });

      const res = await saveInvestmentLog(date, payload);

      if (res.success) {
        setSuccessMsg(res.message);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
        setTimeout(() => {
          onSuccess();
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error updating investments.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 px-4 pt-1 max-w-lg mx-auto">
      {/* Title Card */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Log Investments</h2>
          <p className="text-xs text-slate-400">Updates Investment Log in your Google Sheet</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 p-1.5 rounded-lg bg-slate-800/50 border border-slate-700/60 transition-colors"
          title="Reset to previous"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Date Picker Bar */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <Calendar className="w-5 h-5 text-cyan-400 shrink-0" />
        <div className="flex-1">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Entry Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer mt-0.5"
            required
          />
        </div>
      </div>

      {/* Investment Inputs */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-3">
          {data.investmentsMeta.map((inv) => {
            const currentItem = investments[inv.name] || { invested: '', earnings: '' };
            const invVal = parseFloat(currentItem.invested) || 0;
            const earnVal = parseFloat(currentItem.earnings) || 0;
            const valTotal = invVal + earnVal;
            const itemReturn = invVal > 0 ? (earnVal / invVal) * 100 : 0;

            return (
              <div
                key={inv.name}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/90 focus-within:border-cyan-500/60 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                      <PiggyBank className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white">{inv.name}</span>
                      <span className="text-[11px] text-slate-400 ml-1.5">
                        ({inv.platform || inv.type || 'Asset'})
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      earnVal >= 0
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {itemReturn >= 0 ? '+' : ''}
                    {itemReturn.toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">
                      Invested Amount
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-slate-500 font-medium text-xs">₹</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={currentItem.invested}
                        onChange={(e) => handleFieldChange(inv.name, 'invested', e.target.value)}
                        className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-6 pr-2 py-1.5 text-sm font-mono font-semibold text-white focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 font-medium mb-1">
                      Earnings (Profit/Loss)
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-slate-500 font-medium text-xs">₹</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0.00"
                        value={currentItem.earnings}
                        onChange={(e) => handleFieldChange(inv.name, 'earnings', e.target.value)}
                        className={`w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-6 pr-2 py-1.5 text-sm font-mono font-semibold focus:outline-none focus:border-cyan-500 transition-colors ${
                          earnVal >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Current Value:</span>
                  <span className="font-mono font-bold text-slate-200">{formatINR(valTotal)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Portfolio Totals Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Invested:</span>
            <span className="font-mono text-slate-300">{formatINR(totalInvested)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Earnings:</span>
            <span
              className={`font-mono font-semibold ${
                totalEarnings >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {totalEarnings >= 0 ? '+' : ''}
              {formatINR(totalEarnings)}
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-bold text-white">
            <span>Total Investment Value:</span>
            <span className="font-mono text-cyan-400 text-base">{formatINR(totalCurrentValue)}</span>
          </div>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/3 py-3.5 px-4 rounded-2xl bg-slate-800/80 text-slate-300 font-semibold text-sm hover:bg-slate-700/80 active:scale-[0.98] transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Saving to Sheets...
              </span>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save to Google Sheet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
