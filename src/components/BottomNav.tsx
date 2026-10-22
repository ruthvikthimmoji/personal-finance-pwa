import React from 'react';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  History,
  Settings,
  PlusCircle,
} from 'lucide-react';

export type TabType = 'dashboard' | 'update-balance' | 'update-invest' | 'history' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onChangeTab }) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'update-balance' as TabType, label: '+ Balance', icon: Wallet },
    { id: 'update-invest' as TabType, label: '+ Invest', icon: TrendingUp },
    { id: 'history' as TabType, label: 'History', icon: History },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800/90 safe-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isAccent = tab.id === 'update-balance' || tab.id === 'update-invest';

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 active:scale-90 ${
                isActive
                  ? isAccent
                    ? 'text-emerald-400 font-bold'
                    : 'text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`w-6 h-6 flex items-center justify-center rounded-lg transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
