import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, MainTab } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { AccountsView } from './components/AccountsView';
import { SettingsView } from './components/SettingsView';
import { BalanceLoggerSheet } from './components/BalanceLoggerSheet';
import { InvestmentLoggerSheet } from './components/InvestmentLoggerSheet';
import { QuickActionSheet } from './components/QuickActionSheet';
import { ToastBanner } from './components/ToastBanner';
import { FinanceData } from './types';
import {
  fetchFinanceData,
  getCachedFinanceData,
  getSavedScriptUrl,
} from './services/api';
import { getRelativeSyncTime } from './utils/format';
import { WifiOff } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [data, setData] = useState<FinanceData>(getCachedFinanceData());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSynced, setIsSynced] = useState<boolean>(Boolean(getSavedScriptUrl()));
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  // Privacy mode: persisted between sessions (Page 6 & 11)
  const [isPrivate, setIsPrivate] = useState<boolean>(() => {
    return localStorage.getItem('finance_privacy_mode') === 'true';
  });

  // Bottom sheets
  const [isBalanceSheetOpen, setIsBalanceSheetOpen] = useState(false);
  const [isInvestSheetOpen, setIsInvestSheetOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const togglePrivacy = () => {
    setIsPrivate((prev) => {
      const next = !prev;
      localStorage.setItem('finance_privacy_mode', String(next));
      return next;
    });
  };

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await fetchFinanceData();
      setData(refreshed);
      setIsSynced(Boolean(getSavedScriptUrl()));
    } catch {
      // Offline fallback
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleOnline = () => {
      setIsOffline(false);
      setToastMessage('Back online. Syncing...');
      loadData();
    };
    const handleOffline = () => {
      setIsOffline(true);
      setToastMessage("You're offline. You can still log. We'll sync when you're back.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSaved = (message: string) => {
    setToastMessage(message);
    loadData();
  };

  const syncInfo = getRelativeSyncTime(data.lastUpdated);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#111827] flex flex-col font-sans">
      {/* Persistent Offline Banner */}
      {isOffline && (
        <div className="bg-[#FEF3C7] border-b border-[#FDE68A] px-4 py-2 flex items-center justify-center gap-2 text-xs text-[#92400E]">
          <WifiOff className="w-3.5 h-3.5" />
          <span>You're offline. You can still log. We'll sync when you're back.</span>
        </div>
      )}

      {/* Header */}
      <Header
        isSynced={isSynced}
        isOffline={isOffline}
        isRefreshing={isRefreshing}
        isPrivate={isPrivate}
        syncTimeText={syncInfo.text}
        isStale={syncInfo.isStale}
        onTogglePrivacy={togglePrivacy}
        onRefresh={loadData}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Screen Content */}
      <main className="flex-1 w-full max-w-lg mx-auto pt-3">
        {activeTab === 'home' && (
          <DashboardView
            data={data}
            isPrivate={isPrivate}
            onOpenBalanceLogger={() => setIsBalanceSheetOpen(true)}
            onOpenInvestmentLogger={() => setIsInvestSheetOpen(true)}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            data={data}
            isPrivate={isPrivate}
            onOpenBalanceLogger={() => setIsBalanceSheetOpen(true)}
          />
        )}

        {activeTab === 'accounts' && (
          <AccountsView
            data={data}
            isPrivate={isPrivate}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            onRefreshData={loadData}
            isPrivate={isPrivate}
            onTogglePrivacy={togglePrivacy}
          />
        )}
      </main>

      {/* Bottom Sheets for Quick 10-Second Updates */}
      <BalanceLoggerSheet
        isOpen={isBalanceSheetOpen}
        data={data}
        onClose={() => setIsBalanceSheetOpen(false)}
        onSaved={handleSaved}
      />

      <InvestmentLoggerSheet
        isOpen={isInvestSheetOpen}
        data={data}
        onClose={() => setIsInvestSheetOpen(false)}
        onSaved={handleSaved}
      />

      <QuickActionSheet
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSelectBalance={() => setIsBalanceSheetOpen(true)}
        onSelectInvest={() => setIsInvestSheetOpen(true)}
      />

      {/* Toast Notification Banner */}
      <ToastBanner
        message={toastMessage}
        onDismiss={() => setToastMessage(null)}
      />

      {/* Symmetrical Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
      />
    </div>
  );
};

export default App;
