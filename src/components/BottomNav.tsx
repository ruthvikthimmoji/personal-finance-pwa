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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-t border-[#E8E3DA] safe-bottom">
      <div className="grid grid-cols-5 items-center max-w-lg mx-auto h-[64px] px-1">
        {/* Col 1: Home */}
        <button
          type="button"
          onClick={() => onChangeTab('home')}
          className="relative h-full flex flex-col items-center justify-center transition-all group"
        >
          {activeTab === 'home' && (
            <div className="absolute top-0 w-8 h-[2px] bg-[#1A73E8] rounded-full" />
          )}
          <Home
            className={`w-5 h-5 ${
              activeTab === 'home' ? 'text-[#1A73E8]' : 'text-[#6B7280] group-hover:text-[#111827]'
            }`}
            strokeWidth={1.75}
          />
          <span
            className={`typography-caption text-[11px] mt-1 ${
              activeTab === 'home' ? 'text-[#1A73E8] font-semibold' : 'text-[#6B7280]'
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
            <div className="absolute top-0 w-8 h-[2px] bg-[#1A73E8] rounded-full" />
          )}
          <History
            className={`w-5 h-5 ${
              activeTab === 'history' ? 'text-[#1A73E8]' : 'text-[#6B7280] group-hover:text-[#111827]'
            }`}
            strokeWidth={1.75}
          />
          <span
            className={`typography-caption text-[11px] mt-1 ${
              activeTab === 'history' ? 'text-[#1A73E8] font-semibold' : 'text-[#6B7280]'
            }`}
          >
            History
          </span>
        </button>

        {/* Col 3: Center-Raised + Action Button (Dead Center at 50%, Primary Blue: #1A73E8) */}
        <div className="flex items-center justify-center h-full relative">
          <button
            type="button"
            onClick={onOpenQuickAction}
            className="w-[50px] h-[50px] -mt-5 rounded-full bg-[#1A73E8] hover:bg-[#2B82F6] active:bg-[#1558B0] active:scale-[0.95] text-white flex items-center justify-center shadow-lg shadow-[#1A73E8]/25 border-4 border-[#FAF8F5] transition-all"
            aria-label="Add balance or investment"
          >
            <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Col 4: Accounts */}
        <button
          type="button"
          onClick={() => onChangeTab('accounts')}
          className="relative h-full flex flex-col items-center justify-center transition-all group"
        >
          {activeTab === 'accounts' && (
            <div className="absolute top-0 w-8 h-[2px] bg-[#1A73E8] rounded-full" />
          )}
          <Wallet
            className={`w-5 h-5 ${
              activeTab === 'accounts' ? 'text-[#1A73E8]' : 'text-[#6B7280] group-hover:text-[#111827]'
            }`}
            strokeWidth={1.75}
          />
          <span
            className={`typography-caption text-[11px] mt-1 ${
              activeTab === 'accounts' ? 'text-[#1A73E8] font-semibold' : 'text-[#6B7280]'
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
            <div className="absolute top-0 w-8 h-[2px] bg-[#1A73E8] rounded-full" />
          )}
          <Settings
            className={`w-5 h-5 ${
              activeTab === 'settings' ? 'text-[#1A73E8]' : 'text-[#6B7280] group-hover:text-[#111827]'
            }`}
            strokeWidth={1.75}
          />
          <span
            className={`typography-caption text-[11px] mt-1 ${
              activeTab === 'settings' ? 'text-[#1A73E8] font-semibold' : 'text-[#6B7280]'
            }`}
          >
            Settings
          </span>
        </button>
      </div>
    </nav>
  );
};
