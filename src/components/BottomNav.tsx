import React from 'react';
import { Home, History, Wallet, Settings, Plus } from 'lucide-react';

export type MainTab = 'home' | 'history' | 'accounts' | 'settings';

interface BottomNavProps {
  activeTab: MainTab;
  onChangeTab: (tab: MainTab) => void;
  onOpenQuickAction: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenQuickAction,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0A0F0D]/95 backdrop-blur-md border-t border-[#223029] safe-bottom">
      <div className="grid grid-cols-5 items-center max-w-lg mx-auto h-[64px] px-1">
        {/* Col 1: Home */}
        <button
          type="button"
          onClick={() => onChangeTab('home')}
          className="relative h-full flex flex-col items-center justify-center transition-all group"
        >
          {activeTab === 'home' && (
            <div className="absolute top-0 w-8 h-[2px] bg-[#10B981] rounded-full" />
          )}
          <Home
            className={`w-5 h-5 ${
              activeTab === 'home' ? 'text-[#10B981]' : 'text-[#9AA9A2] group-hover:text-[#F1F5F3]'
            }`}
            strokeWidth={1.75}
          />
          <span
            className={`typography-caption text-[11px] mt-1 ${
              activeTab === 'home' ? 'text-[#10B981] font-semibold' : 'text-[#9AA9A2]'
            }`}
          >
            Home
          </span>
        </button>

        {/* Col 2: History */}
        <button
          type="button"
          onClick={() => onChangeTab('history')}
          className="relative h-full flex flex-col items-center justify-center transition-all group"
        >
          {activeTab === 'history' && (
            <div className="absolute top-0 w-8 h-[2px] bg-[#10B981] rounded-full" />
          )}
          <History
            className={`w-5 h-5 ${
              activeTab === 'history' ? 'text-[#10B981]' : 'text-[#9AA9A2] group-hover:text-[#F1F5F3]'
            }`}
            strokeWidth={1.75}
          />
          <span
            className={`typography-caption text-[11px] mt-1 ${
              activeTab === 'history' ? 'text-[#10B981] font-semibold' : 'text-[#9AA9A2]'
            }`}
          >
            History
          </span>
        </button>

        {/* Col 3: Center-Raised + Action Button (Dead Center at 50%) */}
        <div className="flex items-center justify-center h-full relative">
          <button
            type="button"
            onClick={onOpenQuickAction}
            className="w-[50px] h-[50px] -mt-5 rounded-full bg-[#10B981] hover:bg-[#34D399] active:bg-[#047857] active:scale-[0.95] text-[#0A0F0D] flex items-center justify-center shadow-lg shadow-[#10B981]/25 border-4 border-[#0A0F0D] transition-all"
            aria-label="Add balance or investment"
          >
            <Plus className="w-6 h-6 text-[#0A0F0D]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Col 4: Accounts */}
        <button
          type="button"
          onClick={() => onChangeTab('accounts')}
          className="relative h-full flex flex-col items-center justify-center transition-all group"
        >
          {activeTab === 'accounts' && (
            <div className="absolute top-0 w-8 h-[2px] bg-[#10B981] rounded-full" />
          )}
          <Wallet
            className={`w-5 h-5 ${
              activeTab === 'accounts' ? 'text-[#10B981]' : 'text-[#9AA9A2] group-hover:text-[#F1F5F3]'
            }`}
            strokeWidth={1.75}
          />
          <span
            className={`typography-caption text-[11px] mt-1 ${
              activeTab === 'accounts' ? 'text-[#10B981] font-semibold' : 'text-[#9AA9A2]'
            }`}
          >
            Accounts
          </span>
        </button>

        {/* Col 5: Settings */}
        <button
          type="button"
          onClick={() => onChangeTab('settings')}
          className="relative h-full flex flex-col items-center justify-center transition-all group"
        >
          {activeTab === 'settings' && (
            <div className="absolute top-0 w-8 h-[2px] bg-[#10B981] rounded-full" />
          )}
          <Settings
            className={`w-5 h-5 ${
              activeTab === 'settings' ? 'text-[#10B981]' : 'text-[#9AA9A2] group-hover:text-[#F1F5F3]'
            }`}
            strokeWidth={1.75}
          />
          <span
            className={`typography-caption text-[11px] mt-1 ${
              activeTab === 'settings' ? 'text-[#10B981] font-semibold' : 'text-[#9AA9A2]'
            }`}
          >
            Settings
          </span>
        </button>
      </div>
    </nav>
  );
};
