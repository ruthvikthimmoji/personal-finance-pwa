import React from 'react';
import { Eye, EyeOff, RefreshCw, Settings } from 'lucide-react';

interface HeaderProps {
  isSynced: boolean;
  isOffline: boolean;
  isRefreshing: boolean;
  isPrivate: boolean;
  syncTimeText: string;
  isStale: boolean;
  onTogglePrivacy: () => void;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSynced,
  isOffline,
  isRefreshing,
  isPrivate,
  syncTimeText,
  isStale,
  onTogglePrivacy,
  onRefresh,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#0D1B2A]/95 backdrop-blur-md border-b border-[#223854] px-4 pt-3 pb-3 safe-top">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {/* Left: App title and subtle sync status */}
        <div>
          <h1 className="text-[17px] font-semibold text-[#E6E9EC] tracking-tight">
            Personal Finance
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isOffline ? (
              <span className="flex items-center gap-1 text-xs text-[#F59E0B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                Offline · logs queued
              </span>
            ) : isSynced ? (
              <span
                className={`flex items-center gap-1 text-xs ${
                  isStale ? 'text-[#F59E0B]' : 'text-[#9CADBC]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isStale ? 'bg-[#F59E0B]' : 'bg-[#2BC48A]'
                  }`}
                />
                Synced with your sheet · {syncTimeText}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-[#9CADBC]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9CADBC]" />
                Local mode · {syncTimeText}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions (Privacy toggle, Refresh, Settings) */}
        <div className="flex items-center gap-1">
          {/* Privacy mode toggle button */}
          <button
            type="button"
            onClick={onTogglePrivacy}
            className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[#9CADBC] hover:text-[#E6E9EC] hover:bg-[#1B2D4A] active:scale-[0.98] transition-all"
            aria-label={isPrivate ? 'Reveal numbers' : 'Hide numbers'}
            title={isPrivate ? 'Reveal numbers' : 'Hide numbers'}
          >
            {isPrivate ? (
              <EyeOff className="w-5 h-5 text-[#1A73E8]" strokeWidth={1.75} />
            ) : (
              <Eye className="w-5 h-5" strokeWidth={1.75} />
            )}
          </button>

          {/* Refresh button */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[#9CADBC] hover:text-[#E6E9EC] hover:bg-[#1B2D4A] active:scale-[0.98] transition-all disabled:opacity-50"
            aria-label="Refresh from Google Sheet"
            title="Refresh"
          >
            <RefreshCw
              className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-[#1A73E8]' : ''}`}
              strokeWidth={1.75}
            />
          </button>

          {/* Settings button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="w-11 h-11 rounded-[14px] flex items-center justify-center text-[#9CADBC] hover:text-[#E6E9EC] hover:bg-[#1B2D4A] active:scale-[0.98] transition-all"
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  );
};
