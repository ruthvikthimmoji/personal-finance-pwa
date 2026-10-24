import React from 'react';
import { Landmark, TrendingUp, X } from 'lucide-react';

interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBalance: () => void;
  onSelectInvest: () => void;
}

export const QuickActionSheet: React.FC<QuickActionSheetProps> = ({
  isOpen,
  onClose,
  onSelectBalance,
  onSelectInvest,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white border-t border-[#E8E3DA] rounded-t-[24px] p-5 shadow-2xl sheet-transition safe-bottom space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-1">
          <h3 className="typography-title text-[#111827]">Update</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-[14px] bg-[#F3EFE6] border border-[#E8E3DA] flex items-center justify-center text-[#5E6A75] hover:text-[#111827]"
            aria-label="Close"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectBalance();
            }}
            className="p-4 rounded-[20px] bg-[#FAF8F5] border border-[#E8E3DA] hover:border-[#1A73E8]/50 active:scale-[0.98] text-left space-y-2 transition-all shadow-sm"
          >
            <div className="w-10 h-10 rounded-[14px] bg-[#1A73E8]/10 text-[#1A73E8] flex items-center justify-center">
              <Landmark className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="typography-body font-semibold text-[#111827]">
                Bank & cash
              </div>
              <div className="typography-caption text-[#5E6A75]">
                Update balances
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectInvest();
            }}
            className="p-4 rounded-[20px] bg-[#FAF8F5] border border-[#E8E3DA] hover:border-[#16A34A]/50 active:scale-[0.98] text-left space-y-2 transition-all shadow-sm"
          >
            <div className="w-10 h-10 rounded-[14px] bg-[#16A34A]/10 text-[#16A34A] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="typography-body font-semibold text-[#111827]">
                Investments
              </div>
              <div className="typography-caption text-[#5E6A75]">
                Update values
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
