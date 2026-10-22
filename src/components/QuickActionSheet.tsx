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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-[#121830] border-t border-[#262F57] rounded-t-[24px] p-5 shadow-2xl sheet-transition safe-bottom space-y-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between pb-1">
          <h3 className="typography-title text-[#F4F6FF]">Update</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-[14px] bg-[#1A2142] border border-[#262F57] flex items-center justify-center text-[#A3ACD1] hover:text-[#F4F6FF]"
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
            className="p-4 rounded-[20px] bg-[#1A2142] border border-[#262F57] hover:border-[#5B6CFF]/50 active:scale-[0.98] text-left space-y-2 transition-all"
          >
            <div className="w-10 h-10 rounded-[14px] bg-[#5B6CFF]/15 text-[#5B6CFF] flex items-center justify-center">
              <Landmark className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="typography-body font-semibold text-[#F4F6FF]">
                Bank & cash
              </div>
              <div className="typography-caption text-[#A3ACD1]">
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
            className="p-4 rounded-[20px] bg-[#1A2142] border border-[#262F57] hover:border-[#223029] active:scale-[0.98] text-left space-y-2 transition-all"
          >
            <div className="w-10 h-10 rounded-[14px] bg-[#22D3EE]/15 text-[#22D3EE] flex items-center justify-center">
              <TrendingUp className="w-5 h-5" strokeWidth={1.75} />
            </div>
            <div>
              <div className="typography-body font-semibold text-[#F4F6FF]">
                Investments
              </div>
              <div className="typography-caption text-[#A3ACD1]">
                Update values
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
