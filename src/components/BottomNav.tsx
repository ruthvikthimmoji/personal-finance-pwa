import React from 'react';
import { Home, History, Settings, Plus } from 'lucide-react';

export type MainTab = 'home' | 'history' | 'settings';

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
      <div className="flex items-center justify-around max-w-lg mx-auto px-4 h-[64px]">
        {/* Tab 1: Home */}
        <button
          type="button"
          onClick={() => onChangeTab('home')}
          className="relative min-w-[56px] min-h-[48px] flex flex-col items-center justify-center transition-all group"
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

        {/* Tab 2: History */}
        <button
          type="button"
          onClick={() => onChangeTab('history')}
          className="relative min-w-[56px] min-h-[48px] flex flex-col items-center justify-center transition-all group"
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

        {/* Center-Raised + Action Button (Page 8) */}
        <div className="flex items-center justify-center -mt-5">
          <button
            type="button"
            onClick={onOpenQuickAction}
            className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-[#10B981] hover:bg-[#34D399] active:bg-[#047857] active:scale-[0.95] text-[#0A0F0D] flex items-center justify-center shadow-lg shadow-[#10B981]/25 border-4 border-[#0A0F0D] transition-all"
            aria-label="Add balance or investment"
          >
            <Plus className="w-6 h-6 text-[#0A0F0D]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Tab 3: Settings */}
        <button
          type="button"
          onClick={() => onChangeTab('settings')}
          className="relative min-w-[56px] min-h-[48px] flex flex-col items-center justify-center transition-all group"
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
