import React from 'react';
import { RefreshCw, Settings, CheckCircle2, CloudOff, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  isSynced: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isSynced,
  isRefreshing,
  onRefresh,
  onOpenSettings,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-800/80 px-4 pt-3 pb-3 safe-top">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-[1px] shadow-lg shadow-emerald-950/50">
            <div className="w-full h-full bg-[#090d16] rounded-[11px] flex items-center justify-center font-bold text-emerald-400 text-lg">
              ₹
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">Finance Tracker</h1>
              <a
                href="https://docs.google.com/spreadsheets/d/1al3dZQcq-FOASXxkfYKt_-gvbolvGMqLjTS32EWvXjQ/edit?gid=11885255#gid=11885255"
                target="_blank"
                rel="noreferrer"
                title="Open Google Sheet"
                className="text-slate-400 hover:text-emerald-400 transition-colors p-0.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isSynced ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Synced with Sheets
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Local / Offline
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="w-8 h-8 rounded-lg bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-slate-300 active:scale-95 transition-all hover:bg-slate-700/60"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-lg bg-slate-800/70 border border-slate-700/60 flex items-center justify-center text-slate-300 active:scale-95 transition-all hover:bg-slate-700/60"
            title="Settings & Setup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
