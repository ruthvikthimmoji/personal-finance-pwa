export interface FinanceSummary {
  bankBalance: number;
  cashInHand: number;
  totalInvested: number;
  totalEarnings: number;
  currentInvestmentValue: number;
  overallReturnPct: number;
  netWorth: number;
}

export interface AccountCard {
  name: string;
  latestBalance: number;
  totalAdded: number;
  totalDeducted: number;
}

export interface AccountMeta {
  name: string;
  bank?: string;
  type?: string;
  latestBalance: number;
  latestLogDate: string;
  totalAdded: number;
  totalDeducted: number;
  netChange: number;
  lastChange: number;
}

export interface BalanceLogEntry {
  date: string;
  balances: Record<string, number>;
  total: number;
  totalChange?: number;
}

export interface InvestmentMeta {
  name: string;
  type?: string;
  platform?: string;
  latestInvested: number;
  latestEarnings: number;
  currentValue: number;
  returnPct: number;
  latestLogDate: string;
}

export interface InvestmentLogEntry {
  date: string;
  invested: Record<string, number>;
  earnings: Record<string, number>;
  totalInvested: number;
  totalEarnings: number;
  totalValue: number;
}

export interface FinanceData {
  summary: FinanceSummary;
  accountCards: AccountCard[];
  accountsMeta: AccountMeta[];
  balanceColumns: string[];
  balanceLogs: BalanceLogEntry[];
  investmentsMeta: InvestmentMeta[];
  investmentColumns: string[];
  investmentLogs: InvestmentLogEntry[];
  lastUpdated: string;
}
