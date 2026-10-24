import React, { useState, useRef, useEffect } from 'react';
import { FinanceData } from '../types';
import {
  formatMoney,
  formatIndianNumber,
  getTodayDateInputString,
  MINUS_SIGN,
} from '../utils/format';
import { saveBalanceLog } from '../services/api';
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';

interface BalanceLoggerSheetProps {
  isOpen: boolean;
  data: FinanceData;
  onClose: () => void;
  onSaved: (message: string) => void;
}

export const BalanceLoggerSheet: React.FC<BalanceLoggerSheetProps> = ({
  isOpen,
  data,
  onClose,
  onSaved,
}) => {
  const [date, setDate] = useState<string>(getTodayDateInputString());
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputs({});
      setDate(getTodayDateInputString());
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Previous total bank & cash balance
  const prevTotal = data.accountCards.reduce((sum, acc) => sum + (acc.latestBalance || 0), 0);

  let newTotal = 0;
  data.accountCards.forEach((acc) => {
    const valStr = inputs[acc.name]?.trim();
    if (valStr && valStr !== '') {
      const parsed = parseFloat(valStr.replace(/,/g, ''));
      newTotal += isNaN(parsed) ? acc.latestBalance : parsed;
    } else {
      newTotal += acc.latestBalance;
    }
  });

  const delta = newTotal - prevTotal;

  const handleInputChange = (accountName: string, rawVal: string) => {
    const clean = rawVal.replace(/[^\d.]/g, '');
    setInputs((prev) => ({
      ...prev,
      [accountName]: clean,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }

      const balancesToSave: Record<string, number> = {};
      data.accountCards.forEach((acc) => {
        const valStr = inputs[acc.name]?.trim();
        if (valStr && valStr !== '') {
          const parsed = parseFloat(valStr.replace(/,/g, ''));
          balancesToSave[acc.name] = isNaN(parsed) ? acc.latestBalance : parsed;
        } else {
          balancesToSave[acc.name] = acc.latestBalance;
        }
      });

      await saveBalanceLog(date, balancesToSave);

      if (delta > 0) {
        confetti({
          particleCount: 50,
          spread: 55,
          origin: { y: 0.8 },
          colors: ['#1A73E8', '#2BC48A', '#4285F4'],
          disableForReducedMotion: true,
        });
      }

      let successMessage = 'Balances saved.';
      if (delta > 0) {
        successMessage = `Balances saved. Net worth up ₹${formatIndianNumber(delta)}`;
      } else if (delta < 0) {
        successMessage = `Balances saved. Net worth down ₹${formatIndianNumber(Math.abs(delta))}`;
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
        className="w-full max-w-lg bg-[#132238] border-t border-[#223854] rounded-t-[24px] max-h-[90vh] flex flex-col shadow-2xl sheet-transition"
        role="dialog"
        aria-modal="true"
        aria-labelledby="balance-sheet-title"
      >
        {/* Drag handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1 cursor-grab">
          <div className="w-10 h-1 bg-[#223854] rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#223854]">
          <div>
            <h2 id="balance-sheet-title" className="typography-title text-[#E6E9EC]">
              Update balances
            </h2>
            <p className="typography-caption text-[#9CADBC] mt-0.5">
              Empty fields carry forward previous values
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-[14px] bg-[#1B2D4A] border border-[#223854] flex items-center justify-center text-[#9CADBC] hover:text-[#E6E9EC] active:scale-[0.98]"
            aria-label="Close"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Date Selector */}
          <div>
            <label className="typography-label text-[#9CADBC] block mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-[56px] px-4 rounded-[14px] bg-[#1B2D4A] border border-[#223854] text-[16px] text-[#E6E9EC] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20"
              required
            />
          </div>

          {/* Account Fields */}
          <div className="space-y-3 pt-1">
            {data.accountCards.map((account, index) => {
              const prevAmount = account.latestBalance;
              const currentInput = inputs[account.name] ?? '';

              return (
                <div key={account.name} className="space-y-1">
                  <div className="flex items-center justify-between px-1">
                    <span className="typography-label text-[#E6E9EC]">
                      {account.name}
                    </span>
                    <span className="typography-caption text-[#9CADBC]">
                      Previous: {formatMoney(prevAmount)}
                    </span>
                  </div>

                  {/* 56px input with fixed ₹ prefix */}
                  <div className="relative flex items-center">
                    <span className="absolute left-4 typography-body text-[#9CADBC] pointer-events-none select-none">
                      ₹
                    </span>
                    <input
                      ref={index === 0 ? firstInputRef : undefined}
                      type="text"
                      inputMode="decimal"
                      placeholder={formatIndianNumber(prevAmount, true)}
                      value={currentInput}
                      onChange={(e) => handleInputChange(account.name, e.target.value)}
                      className="w-full h-[56px] pl-9 pr-4 rounded-[14px] bg-[#1B2D4A] border border-[#223854] text-[16px] text-[#E6E9EC] placeholder-[#607387] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/20 transition-all font-variant-numeric: tabular-nums"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </form>

        {/* Sticky Footer: Live Delta & Save Button */}
        <div className="p-4 border-t border-[#223854] bg-[#132238] safe-bottom space-y-3">
          {/* Live delta */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[#9CADBC]">
              Net change:
            </span>
            <span
              className={`font-semibold flex items-center gap-1 ${
                delta > 0
                  ? 'text-[#2BC48A]'
                  : delta < 0
                  ? 'text-[#FF6E8A]'
                  : 'text-[#9CADBC]'
              }`}
            >
              {delta > 0
                ? `▲ +₹${formatIndianNumber(delta)}`
                : delta < 0
                ? `▼ ${MINUS_SIGN}₹${formatIndianNumber(Math.abs(delta))}`
                : '— No change'}
            </span>
          </div>

          {/* Primary Action Button: 52px solid Primary Blue (#1A73E8) */}
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
