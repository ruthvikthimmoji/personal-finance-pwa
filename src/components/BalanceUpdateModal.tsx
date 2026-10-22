import React, { useState } from 'react';
import { FinanceData } from '../types';
import { formatINR, getTodayDateInputString } from '../utils/format';
import { saveBalanceLog } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Coins,
  Landmark,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RotateCcw,
} from 'lucide-react';

interface BalanceUpdateProps {
  data: FinanceData;
  onSuccess: () => void;
  onCancel: () => void;
}

export const BalanceUpdateView: React.FC<BalanceUpdateProps> = ({
  data,
  onSuccess,
  onCancel,
}) => {
  const [date, setDate] = useState<string>(getTodayDateInputString());

  // Initialize values from latest balances
  const initialBalances: Record<string, string> = {};
  data.accountCards.forEach((acc) => {
    initialBalances[acc.name] = acc.latestBalance > 0 ? String(acc.latestBalance) : '';
  });

  const [balances, setBalances] = useState<Record<string, string>>(initialBalances);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Compute previous total
  const prevTotal = data.accountCards.reduce((sum, acc) => sum + (acc.latestBalance || 0), 0);

  // Compute new total
  const newTotal = Object.values(balances).reduce((sum, v) => {
    const val = parseFloat(v);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const diff = newTotal - prevTotal;

  const handleInputChange = (accountName: string, value: string) => {
    setBalances((prev) => ({
      ...prev,
      [accountName]: value,
    }));
  };

  const handleResetToPrevious = () => {
    setBalances(initialBalances);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const parsedBalances: Record<string, number> = {};
      Object.entries(balances).forEach(([k, v]) => {
        parsedBalances[k] = v === '' ? 0 : parseFloat(v) || 0;
      });

      const res = await saveBalanceLog(date, parsedBalances);

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
      setErrorMsg(err instanceof Error ? err.message : 'Error updating balances.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-24 px-4 pt-1 max-w-lg mx-auto">
      {/* Title Card */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Log Today's Balances</h2>
          <p className="text-xs text-slate-400">Updates Balance Log in your Google Sheet</p>
        </div>
        <button
          type="button"
          onClick={handleResetToPrevious}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 p-1.5 rounded-lg bg-slate-800/50 border border-slate-700/60 transition-colors"
          title="Reset to previous balances"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Date Picker Bar */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
        <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
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

      {/* Account Balances Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-2.5">
          {data.accountCards.map((acc) => {
            const isCash = acc.name.toLowerCase().includes('cash');
            const prevVal = acc.latestBalance;
            const currentVal = parseFloat(balances[acc.name] || '0') || 0;
            const itemDiff = currentVal - prevVal;

            return (
              <div
                key={acc.name}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/90 focus-within:border-emerald-500/60 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs ${
                        isCash ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {isCash ? <Coins className="w-3.5 h-3.5" /> : <Landmark className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm font-medium text-slate-200">{acc.name}</span>
                  </div>

                  <span className="text-xs text-slate-400">
                    Last: <span className="text-slate-300 font-mono">{formatINR(prevVal)}</span>
                  </span>
                </div>

                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-semibold text-base">₹</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={balances[acc.name] ?? ''}
                    onChange={(e) => handleInputChange(acc.name, e.target.value)}
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-base font-mono font-semibold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                {itemDiff !== 0 && (
                  <div className="mt-1.5 flex items-center justify-end text-[11px] font-semibold">
                    <span
                      className={`inline-flex items-center gap-0.5 ${
                        itemDiff > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {itemDiff > 0 ? '+' : ''}
                      {formatINR(itemDiff)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Live Change Summary Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Previous Total:</span>
            <span className="font-mono text-slate-300">{formatINR(prevTotal)}</span>
          </div>

          <div className="flex items-center justify-between text-sm font-bold text-white">
            <span>New Total Balance:</span>
            <span className="font-mono text-emerald-400 text-base">{formatINR(newTotal)}</span>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Net Change:</span>
            <span
              className={`font-semibold inline-flex items-center gap-1 ${
                diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {diff > 0 ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5" />
                  +{formatINR(diff)}
                </>
              ) : diff < 0 ? (
                <>
                  <TrendingDown className="w-3.5 h-3.5" />
                  {formatINR(diff)}
                </>
              ) : (
                '₹0.00'
              )}
            </span>
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

        {/* Submit Button */}
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
            className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
