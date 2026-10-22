import React, { useEffect } from 'react';
import { Check, AlertCircle, WifiOff } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  type?: 'success' | 'error' | 'info';
}

export const ToastBanner: React.FC<ToastProps> = ({
  message,
  onDismiss,
  type = 'success',
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="fixed bottom-[80px] left-0 right-0 z-50 flex justify-center px-4 pointer-events-none animate-slide-up">
      <div className="pointer-events-auto max-w-sm w-full bg-[#17231E] border border-[#223029] rounded-[14px] px-4 py-3 shadow-xl flex items-center gap-3">
        {type === 'success' ? (
          <div className="w-6 h-6 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-[#F87171]/20 text-[#F87171] flex items-center justify-center shrink-0">
            <AlertCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
          </div>
        )}
        <p className="typography-caption text-[#F1F5F3] font-medium flex-1">
          {message}
        </p>
      </div>
    </div>
  );
};
