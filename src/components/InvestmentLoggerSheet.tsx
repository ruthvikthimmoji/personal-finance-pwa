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

  // Previous total investment value
  const prevTotalValue = data.summary.currentInvestmentValue;

  // Compute live totals
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
          colors: ['#10B981', '#60A5FA', '#34D399'],
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#111A16] border-t border-[#223029] rounded-t-[24px] max-h-[90vh] flex flex-col shadow-2xl sheet-transition"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invest-sheet-title"
      >
        {/* Drag handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1 cursor-grab">
          <div className="w-10 h-1 bg-[#223029] rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#223029]">
          <div>
            <h2 id="invest-sheet-title" className="typography-title text-[#F1F5F3]">
              Update investments
            </h2>
            <p className="typography-caption text-[#9AA9A2] mt-0.5">
              Current values and profit or loss
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-[14px] bg-[#17231E] border border-[#223029] flex items-center justify-center text-[#9AA9A2] hover:text-[#F1F5F3] active:scale-[0.98]"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Date Selector */}
          <div>
            <label className="typography-label text-[#9AA9A2] block mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-[56px] px-4 rounded-[14px] bg-[#17231E] border border-[#223029] text-[16px] text-[#F1F5F3] focus:outline-none focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/20"
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
                  className="bg-[#17231E]/60 border border-[#223029] rounded-[20px] p-3.5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <MonogramAvatar name={inv.name} category="investment" size="sm" />
                      <div>
                        <div className="typography-body font-semibold text-[#F1F5F3]">
                          {inv.name}
                        </div>
                        <div className="typography-caption text-[#9AA9A2]">
                          {inv.platform || inv.type || 'Asset'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="typography-amount-l text-[#F1F5F3]">
                        {formatMoney(itemTotal)}
                      </div>
                      <div
                        className={`typography-caption font-medium ${
                          earnNum >= 0 ? 'text-[#10B981]' : 'text-[#F87171]'
                        }`}
                      >
                        {formatPercent(itemReturn)}
                      </div>
                    </div>
                  </div>

                  {/* Two 56px inputs */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="typography-caption text-[#9AA9A2] block mb-1">
                        Invested amount
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-[#9AA9A2] text-sm pointer-events-none">
                          ₹
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0"
                          value={state.invested}
                          onChange={(e) => handleFieldChange(inv.name, 'invested', e.target.value)}
                          className="w-full h-[56px] pl-7 pr-3 rounded-[14px] bg-[#111A16] border border-[#223029] text-[16px] text-[#F1F5F3] focus:outline-none focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/20 transition-all font-variant-numeric: tabular-nums"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="typography-caption text-[#9AA9A2] block">
                          Profit / Loss
                        </label>
                        {/* Sign toggle button */}
                        <button
                          type="button"
                          onClick={() => toggleSign(inv.name)}
                          className={`text-[11px] font-semibold px-1.5 py-0.5 rounded border ${
                            state.isNegativeEarnings
                              ? 'bg-[#F87171]/15 text-[#F87171] border-[#F87171]/30'
                              : 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30'
                          }`}
                        >
                          {state.isNegativeEarnings ? 'Loss (−)' : 'Profit (+)'}
                        </button>
                      </div>

                      <div className="relative flex items-center">
                        <span
                          className={`absolute left-3 text-sm pointer-events-none font-semibold ${
                            state.isNegativeEarnings ? 'text-[#F87171]' : 'text-[#10B981]'
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
                          className={`w-full h-[56px] pl-9 pr-3 rounded-[14px] bg-[#111A16] border border-[#223029] text-[16px] focus:outline-none focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/20 transition-all font-variant-numeric: tabular-nums ${
                            state.isNegativeEarnings ? 'text-[#F87171]' : 'text-[#10B981]'
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
        <div className="p-4 border-t border-[#223029] bg-[#111A16] safe-bottom space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[#9AA9A2]">
              Total portfolio:
            </span>
            <span className="font-semibold text-[#F1F5F3]">
              {formatMoney(newTotalValue)} ({formatPercent(overallReturn)})
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-[52px] rounded-[14px] bg-[#10B981] hover:bg-[#34D399] active:scale-[0.98] active:bg-[#047857] text-[#0A0F0D] font-semibold text-[16px] flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-40"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-[#0A0F0D] border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
