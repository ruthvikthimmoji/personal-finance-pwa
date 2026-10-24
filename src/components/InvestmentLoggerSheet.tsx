import React, { useState, useEffect } from 'react';
import { FinanceData } from '../types';
import {
  formatMoney,
  formatIndianNumber,
  formatPercent,
  getTodayDateInputString,
  PLUS_SIGN,
  MINUS_SIGN,
} from '../utils/format';
import { saveInvestmentLog } from '../services/api';
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';
import { MonogramAvatar } from './MonogramAvatar';

interface InvestmentLoggerSheetProps {
  isOpen: boolean;
  data: FinanceData;
  onClose: () => void;
  onSaved: (message: string) => void;
}

interface AssetState {
  invested: string;
  earnings: string;
  isNegativeEarnings: boolean;
}

export const InvestmentLoggerSheet: React.FC<InvestmentLoggerSheetProps> = ({
  isOpen,
  data,
  onClose,
  onSaved,
}) => {
  const [date, setDate] = useState<string>(getTodayDateInputString());
  const [assetStates, setAssetStates] = useState<Record<string, AssetState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, AssetState> = {};
      data.investmentsMeta.forEach((inv) => {
        initial[inv.name] = {
          invested: String(inv.latestInvested || ''),
          earnings: String(Math.abs(inv.latestEarnings) || ''),
          isNegativeEarnings: inv.latestEarnings < 0,
        };
      });
      setAssetStates(initial);
      setDate(getTodayDateInputString());
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const prevTotalValue = data.summary.currentInvestmentValue;

  let newTotalInvested = 0;
  let newTotalEarnings = 0;

  data.investmentsMeta.forEach((inv) => {
    const state = assetStates[inv.name] || {
      invested: String(inv.latestInvested),
      earnings: String(Math.abs(inv.latestEarnings)),
      isNegativeEarnings: inv.latestEarnings < 0,
    };

    const invNum = parseFloat(state.invested.replace(/,/g, '')) || 0;
    const rawEarn = parseFloat(state.earnings.replace(/,/g, '')) || 0;
    const earnNum = state.isNegativeEarnings ? -rawEarn : rawEarn;

    newTotalInvested += invNum;
    newTotalEarnings += earnNum;
  });

  const newTotalValue = newTotalInvested + newTotalEarnings;
  const overallReturn = newTotalInvested > 0 ? (newTotalEarnings / newTotalInvested) * 100 : 0;
  const valueDelta = newTotalValue - prevTotalValue;

  const handleFieldChange = (
    name: string,
    field: 'invested' | 'earnings',
    value: string
  ) => {
    const clean = value.replace(/[^\d.]/g, '');
    setAssetStates((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [field]: clean,
      },
    }));
  };

  const toggleSign = (name: string) => {
    setAssetStates((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        isNegativeEarnings: !prev[name]?.isNegativeEarnings,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }

      const payload: Record<string, { invested: number; earnings: number }> = {};
      data.investmentsMeta.forEach((inv) => {
        const state = assetStates[inv.name];
        if (state) {
          const invNum = parseFloat(state.invested.replace(/,/g, '')) || 0;
          const rawEarn = parseFloat(state.earnings.replace(/,/g, '')) || 0;
          const earnNum = state.isNegativeEarnings ? -rawEarn : rawEarn;
          payload[inv.name] = { invested: invNum, earnings: earnNum };
        }
      });

      await saveInvestmentLog(date, payload);

      if (valueDelta > 0) {
        confetti({
          particleCount: 50,
          spread: 55,
          origin: { y: 0.8 },
          colors: ['#1A73E8', '#16A34A', '#D97706', '#4285F4'],
          disableForReducedMotion: true,
        });
      }

      let successMessage = 'Investments saved.';
      if (valueDelta > 0) {
        successMessage = `Investments saved. Net worth up ₹${formatIndianNumber(valueDelta)}`;
      } else if (valueDelta < 0) {
        successMessage = `Investments saved. Net worth down ₹${formatIndianNumber(Math.abs(valueDelta))}`;
      }

      onSaved(successMessage);
      onClose();
    } catch {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white border-t border-[#E8E3DA] rounded-t-[24px] max-h-[90vh] flex flex-col shadow-2xl sheet-transition"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invest-sheet-title"
      >
        {/* Drag handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1 cursor-grab">
          <div className="w-10 h-1 bg-[#D5D0C7] rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E8E3DA]">
          <div>
            <h2 id="invest-sheet-title" className="typography-title text-[#111827]">
              Update investments
            </h2>
            <p className="typography-caption text-[#5E6A75] mt-0.5">
              Current values and profit or loss
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-[14px] bg-[#F3EFE6] border border-[#E8E3DA] flex items-center justify-center text-[#5E6A75] hover:text-[#111827] active:scale-[0.98]"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Date Selector */}
          <div>
            <label className="typography-label text-[#5E6A75] block mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-[56px] px-4 rounded-[14px] bg-[#FAF8F5] border border-[#E8E3DA] text-[16px] text-[#111827] focus:outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20"
              required
            />
          </div>

          {/* Investment Asset Inputs */}
          <div className="space-y-4 pt-1">
            {data.investmentsMeta.map((inv) => {
              const state = assetStates[inv.name] || {
                invested: '',
                earnings: '',
                isNegativeEarnings: false,
              };

              const invNum = parseFloat(state.invested.replace(/,/g, '')) || 0;
              const rawEarn = parseFloat(state.earnings.replace(/,/g, '')) || 0;
              const earnNum = state.isNegativeEarnings ? -rawEarn : rawEarn;
              const itemTotal = invNum + earnNum;
              const itemReturn = invNum > 0 ? (earnNum / invNum) * 100 : 0;

              return (
                <div
                  key={inv.name}
                  className="bg-[#FAF8F5] border border-[#E8E3DA] rounded-[20px] p-3.5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <MonogramAvatar name={inv.name} category="investment" size="sm" />
                      <div>
                        <div className="typography-body font-semibold text-[#111827]">
                          {inv.name}
                        </div>
                        <div className="typography-caption text-[#5E6A75]">
                          {inv.platform || inv.type || 'Asset'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="typography-amount-l text-[#111827]">
                        {formatMoney(itemTotal)}
                      </div>
                      <div
                        className={`typography-caption font-medium ${
                          earnNum >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'
                        }`}
                      >
                        {formatPercent(itemReturn)}
                      </div>
                    </div>
                  </div>

                  {/* Two 56px inputs */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="typography-caption text-[#5E6A75] block mb-1">
                        Invested amount
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-[#5E6A75] text-sm pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0"
                          value={state.invested}
                          onChange={(e) => handleFieldChange(inv.name, 'invested', e.target.value)}
                          className="w-full h-[56px] pl-7 pr-3 rounded-[14px] bg-white border border-[#E8E3DA] text-[16px] text-[#111827] focus:outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition-all font-variant-numeric: tabular-nums"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="typography-caption text-[#5E6A75] block">
                          Profit / Loss
                        </label>
                        {/* Sign toggle button */}
                        <button
                          type="button"
                          onClick={() => toggleSign(inv.name)}
                          className={`text-[11px] font-semibold px-1.5 py-0.5 rounded border ${
                            state.isNegativeEarnings
                              ? 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/20'
                              : 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20'
                          }`}
                        >
                          {state.isNegativeEarnings ? 'Loss (−)' : 'Profit (+)'}
                        </button>
                      </div>

                      <div className="relative flex items-center">
                        <span
                          className={`absolute left-3 text-sm pointer-events-none font-semibold ${
                            state.isNegativeEarnings ? 'text-[#DC2626]' : 'text-[#16A34A]'
                          }`}
                        >
                          {state.isNegativeEarnings ? MINUS_SIGN + '₹' : PLUS_SIGN + '₹'}
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0"
                          value={state.earnings}
                          onChange={(e) => handleFieldChange(inv.name, 'earnings', e.target.value)}
                          className={`w-full h-[56px] pl-9 pr-3 rounded-[14px] bg-white border border-[#E8E3DA] text-[16px] focus:outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 transition-all font-variant-numeric: tabular-nums ${
                            state.isNegativeEarnings ? 'text-[#DC2626]' : 'text-[#16A34A]'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="p-4 border-t border-[#E8E3DA] bg-[#FAF8F5] safe-bottom space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[#5E6A75]">
              Total portfolio:
            </span>
            <span className="font-semibold text-[#111827]">
              {formatMoney(newTotalValue)} ({formatPercent(overallReturn)})
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-[52px] rounded-[14px] bg-[#1A73E8] hover:bg-[#2B82F6] active:scale-[0.98] active:bg-[#1558B0] text-white font-semibold text-[16px] flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-40"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
