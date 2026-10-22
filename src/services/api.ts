import { FinanceData } from '../types';

export const INITIAL_FINANCE_DATA: FinanceData = {
  summary: {
    bankBalance: 24189.88,
    cashInHand: 6646.0,
    totalInvested: 22248.63,
    totalEarnings: 34205.21,
    currentInvestmentValue: 56453.84,
    overallReturnPct: 1.537,
    netWorth: 87289.72,
  },
  accountCards: [
    { name: 'HDFC', latestBalance: 5000.0, totalAdded: 5000.0, totalDeducted: 0 },
    { name: 'SBI', latestBalance: 2871.0, totalAdded: 2452.11, totalDeducted: 0 },
    { name: 'Indian Bank', latestBalance: 16271.42, totalAdded: 18695.1, totalDeducted: 2441.82 },
    { name: 'Canra Bank', latestBalance: 47.46, totalAdded: 40.0, totalDeducted: 75.0 },
    { name: 'Cash in Hand', latestBalance: 6646.0, totalAdded: 460.0, totalDeducted: 380.0 },
  ],
  accountsMeta: [
    { name: 'HDFC', bank: 'HDFC Bank', type: 'Savings', latestBalance: 5000.0, latestLogDate: '12-Oct-2026', totalAdded: 5000.0, totalDeducted: 0, netChange: 5000.0, lastChange: 0 },
    { name: 'SBI', bank: 'State Bank of India', type: 'Savings', latestBalance: 2871.0, latestLogDate: '12-Oct-2026', totalAdded: 2452.11, totalDeducted: 0, netChange: 2452.11, lastChange: 161.11 },
    { name: 'Indian Bank', bank: 'Indian Bank', type: 'Salary / Main', latestBalance: 16271.42, latestLogDate: '12-Oct-2026', totalAdded: 18695.1, totalDeducted: 2441.82, netChange: 16253.28, lastChange: -2441.82 },
    { name: 'Canra Bank', bank: 'Canara Bank', type: 'Savings', latestBalance: 47.46, latestLogDate: '12-Oct-2026', totalAdded: 40.0, totalDeducted: 75.0, netChange: -35.0, lastChange: 40.0 },
    { name: 'Cash in Hand', bank: 'Physical Wallet', type: 'Cash', latestBalance: 6646.0, latestLogDate: '12-Oct-2026', totalAdded: 460.0, totalDeducted: 380.0, netChange: 80.0, lastChange: 460.0 },
  ],
  balanceColumns: ['HDFC', 'SBI', 'Indian Bank', 'Canra Bank', 'Cash in Hand'],
  balanceLogs: [
    {
      date: '15-Sep-2026',
      balances: { HDFC: 0, SBI: 418.89, 'Indian Bank': 18.14, 'Canra Bank': 82.46, 'Cash in Hand': 6566.0 },
      total: 7085.49,
      totalChange: 0,
    },
    {
      date: '03-Oct-2026',
      balances: { HDFC: 5000.0, SBI: 2709.89, 'Indian Bank': 18713.24, 'Canra Bank': 7.46, 'Cash in Hand': 6186.0 },
      total: 32616.59,
      totalChange: 25531.1,
    },
    {
      date: '12-Oct-2026',
      balances: { HDFC: 5000.0, SBI: 2871.0, 'Indian Bank': 16271.42, 'Canra Bank': 47.46, 'Cash in Hand': 6646.0 },
      total: 30835.88,
      totalChange: -1780.71,
    },
  ],
  investmentsMeta: [
    { name: 'Stocks', type: 'Equity', platform: 'Zerodha', latestInvested: 6356.77, latestEarnings: 11343.21, currentValue: 17699.98, returnPct: 1.784, latestLogDate: '12-Oct-2026' },
    { name: 'Long Term', type: 'Mutual Fund', platform: 'Groww', latestInvested: 1587.0, latestEarnings: 1728.0, currentValue: 3315.0, returnPct: 1.089, latestLogDate: '12-Oct-2026' },
    { name: 'APY', type: 'Pension scheme', platform: 'NPS', latestInvested: 14304.86, latestEarnings: 21134.0, currentValue: 35438.86, returnPct: 1.477, latestLogDate: '12-Oct-2026' },
  ],
  investmentColumns: ['Stocks', 'Long Term', 'APY'],
  investmentLogs: [
    {
      date: '15-Sep-2026',
      invested: { Stocks: 6356.77, 'Long Term': 1587.0, APY: 14304.86 },
      earnings: { Stocks: 11700.33, 'Long Term': 1844.0, APY: 21464.0 },
      totalInvested: 22248.63,
      totalEarnings: 35008.33,
      totalValue: 57256.96,
    },
    {
      date: '03-Oct-2026',
      invested: { Stocks: 6356.77, 'Long Term': 1587.0, APY: 14304.86 },
      earnings: { Stocks: 11346.33, 'Long Term': 1740.0, APY: 21154.0 },
      totalInvested: 22248.63,
      totalEarnings: 34240.33,
      totalValue: 56488.96,
    },
    {
      date: '12-Oct-2026',
      invested: { Stocks: 6356.77, 'Long Term': 1587.0, APY: 14304.86 },
      earnings: { Stocks: 11343.21, 'Long Term': 1728.0, APY: 21134.0 },
      totalInvested: 22248.63,
      totalEarnings: 34205.21,
      totalValue: 56453.84,
    },
  ],
  lastUpdated: new Date().toISOString(),
};

const STORAGE_KEY_DATA = 'finance_pwa_data';
const STORAGE_KEY_SCRIPT_URL = 'finance_pwa_script_url';

export const getSavedScriptUrl = (): string => {
  return localStorage.getItem(STORAGE_KEY_SCRIPT_URL) || '';
};

export const saveScriptUrl = (url: string): void => {
  localStorage.setItem(STORAGE_KEY_SCRIPT_URL, url.trim());
};

export const getCachedFinanceData = (): FinanceData => {
  const saved = localStorage.getItem(STORAGE_KEY_DATA);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return INITIAL_FINANCE_DATA;
};

export const cacheFinanceData = (data: FinanceData): void => {
  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
};

export const testConnection = async (url: string): Promise<{ success: boolean; message: string }> => {
  if (!url) {
    return { success: false, message: 'Apps Script URL cannot be empty.' };
  }
  try {
    const separator = url.includes('?') ? '&' : '?';
    const testUrl = `${url}${separator}action=ping&_t=${Date.now()}`;
    const res = await fetch(testUrl, { method: 'GET', redirect: 'follow' });
    const json = await res.json();
    if (json.success) {
      return { success: true, message: json.message || 'Connected successfully to Google Sheet!' };
    }
    return { success: false, message: json.error || 'Connection failed.' };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Network error or CORS issue. Please check the deployment permissions ("Anyone").',
    };
  }
};

export const fetchFinanceData = async (): Promise<FinanceData> => {
  const scriptUrl = getSavedScriptUrl();

  // If Apps Script URL is set, fetch from live backend
  if (scriptUrl) {
    try {
      const separator = scriptUrl.includes('?') ? '&' : '?';
      const targetUrl = `${scriptUrl}${separator}action=getData&_t=${Date.now()}`;
      const res = await fetch(targetUrl, { method: 'GET', redirect: 'follow' });
      const json = await res.json();
      if (json && json.success && json.data) {
        cacheFinanceData(json.data);
        return json.data;
      }
    } catch (e) {
      console.warn('Failed to fetch from Apps Script, using cache/fallback', e);
    }
  }

  // Fallback to cache or initial data
  return getCachedFinanceData();
};

export const saveBalanceLog = async (
  date: string,
  balances: Record<string, number>
): Promise<{ success: boolean; message: string }> => {
  const scriptUrl = getSavedScriptUrl();

  // Optimistically update local cache
  const currentData = getCachedFinanceData();
  const total = Object.values(balances).reduce((sum, v) => sum + (Number(v) || 0), 0);
  const prevTotal = currentData.summary.bankBalance + currentData.summary.cashInHand;
  const change = total - prevTotal;

  const newLogEntry: { date: string; balances: Record<string, number>; total: number; totalChange?: number } = {
    date: date,
    balances: balances,
    total: total,
    totalChange: change,
  };

  const updatedLogs = [...currentData.balanceLogs, newLogEntry];

  // Update account balances
  const updatedAccountCards = currentData.accountCards.map((card) => {
    if (balances[card.name] !== undefined) {
      const newBal = Number(balances[card.name]) || 0;
      const diff = newBal - card.latestBalance;
      return {
        ...card,
        latestBalance: newBal,
        totalAdded: diff > 0 ? card.totalAdded + diff : card.totalAdded,
        totalDeducted: diff < 0 ? card.totalDeducted + Math.abs(diff) : card.totalDeducted,
      };
    }
    return card;
  });

  const cashAmount = balances['Cash in Hand'] !== undefined ? Number(balances['Cash in Hand']) : currentData.summary.cashInHand;
  const bankAmount = total - cashAmount;

  const updatedSummary = {
    ...currentData.summary,
    bankBalance: bankAmount,
    cashInHand: cashAmount,
    netWorth: bankAmount + cashAmount + currentData.summary.currentInvestmentValue,
  };

  const updatedData: FinanceData = {
    ...currentData,
    summary: updatedSummary,
    accountCards: updatedAccountCards,
    balanceLogs: updatedLogs,
    lastUpdated: new Date().toISOString(),
  };

  cacheFinanceData(updatedData);

  // If Apps Script URL is configured, push to Google Sheets!
  if (scriptUrl) {
    try {
      const res = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'addBalance',
          date: date,
          balances: balances,
        }),
      });
      const json = await res.json();
      if (json && json.success) {
        return { success: true, message: 'Saved and updated directly in your Google Sheet!' };
      }
      return { success: false, message: json.error || 'Failed to update Google Sheet.' };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Network error updating Google Sheet. Saved locally.',
      };
    }
  }

  return {
    success: true,
    message: 'Saved locally! (To sync directly to Google Sheets, configure your Apps Script URL in Settings)',
  };
};

export const saveInvestmentLog = async (
  date: string,
  investments: Record<string, { invested: number; earnings: number }>
): Promise<{ success: boolean; message: string }> => {
  const scriptUrl = getSavedScriptUrl();

  // Optimistically update local data
  const currentData = getCachedFinanceData();
  const investedMap: Record<string, number> = {};
  const earningsMap: Record<string, number> = {};
  let totalInvested = 0;
  let totalEarnings = 0;

  Object.entries(investments).forEach(([key, val]) => {
    investedMap[key] = Number(val.invested) || 0;
    earningsMap[key] = Number(val.earnings) || 0;
    totalInvested += investedMap[key];
    totalEarnings += earningsMap[key];
  });

  const totalValue = totalInvested + totalEarnings;
  const returnPct = totalInvested > 0 ? (totalEarnings / totalInvested) : 0;

  const newLogEntry = {
    date: date,
    invested: investedMap,
    earnings: earningsMap,
    totalInvested: totalInvested,
    totalEarnings: totalEarnings,
    totalValue: totalValue,
  };

  const updatedInvLogs = [...currentData.investmentLogs, newLogEntry];

  const updatedInvMeta = currentData.investmentsMeta.map((meta) => {
    if (investments[meta.name]) {
      const inv = Number(investments[meta.name].invested) || 0;
      const earn = Number(investments[meta.name].earnings) || 0;
      return {
        ...meta,
        latestInvested: inv,
        latestEarnings: earn,
        currentValue: inv + earn,
        returnPct: inv > 0 ? earn / inv : 0,
        latestLogDate: date,
      };
    }
    return meta;
  });

  const updatedSummary = {
    ...currentData.summary,
    totalInvested: totalInvested,
    totalEarnings: totalEarnings,
    currentInvestmentValue: totalValue,
    overallReturnPct: returnPct,
    netWorth: currentData.summary.bankBalance + currentData.summary.cashInHand + totalValue,
  };

  const updatedData: FinanceData = {
    ...currentData,
    summary: updatedSummary,
    investmentsMeta: updatedInvMeta,
    investmentLogs: updatedInvLogs,
    lastUpdated: new Date().toISOString(),
  };

  cacheFinanceData(updatedData);

  if (scriptUrl) {
    try {
      const res = await fetch(scriptUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          action: 'addInvestment',
          date: date,
          investments: investments,
        }),
      });
      const json = await res.json();
      if (json && json.success) {
        return { success: true, message: 'Investment log saved and updated directly in Google Sheets!' };
      }
      return { success: false, message: json.error || 'Failed to update Google Sheet.' };
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Network error updating Google Sheet. Saved locally.',
      };
    }
  }

  return {
    success: true,
    message: 'Saved locally! (To sync directly to Google Sheets, configure your Apps Script URL in Settings)',
  };
};
