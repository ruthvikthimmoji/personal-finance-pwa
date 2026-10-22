import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { BalanceUpdateView } from './components/BalanceUpdateModal';
import { InvestmentUpdateView } from './components/InvestmentUpdateModal';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import {
  FinanceData,
} from './types';
import {
  fetchFinanceData,
  getCachedFinanceData,
  getSavedScriptUrl,
} from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [data, setData] = useState<FinanceData>(getCachedFinanceData());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSynced, setIsSynced] = useState<boolean>(Boolean(getSavedScriptUrl()));

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await fetchFinanceData();
      setData(refreshed);
      setIsSynced(Boolean(getSavedScriptUrl()));
    } catch (e) {
      console.error('Error refreshing data', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateSuccess = async () => {
    await loadData();
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Header */}
      <Header
        isSynced={isSynced}
        isRefreshing={isRefreshing}
        onRefresh={loadData}
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-lg mx-auto pt-3">
        {activeTab === 'dashboard' && (
          <DashboardView
            data={data}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'update-balance' && (
          <BalanceUpdateView
            data={data}
            onSuccess={handleUpdateSuccess}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'update-invest' && (
          <InvestmentUpdateView
            data={data}
            onSuccess={handleUpdateSuccess}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'history' && <HistoryView data={data} />}

        {activeTab === 'settings' && (
          <SettingsView onRefreshData={loadData} />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
};

export default App;
