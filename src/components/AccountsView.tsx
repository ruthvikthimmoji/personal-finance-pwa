import React from 'react';
import { FinanceData } from '../types';
import { formatMoney, formatPercent } from '../utils/format';
import { MonogramAvatar } from './MonogramAvatar';
import { ChangeChip } from './ChangeChip';

interface AccountsViewProps {
  data: FinanceData;
  isPrivate: boolean;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ data, isPrivate }) => {
  const { accountCards, accountsMeta, investmentsMeta, summary } = data;
  const totalLiquid = summary.bankBalance + summary.cashInHand;

  return (
    <div className="space-y-4 pb-28 px-4 max-w-lg mx-auto">
      {/* Title */}
      <div className="px-1 pt-1">
        <h2 className="typography-title text-[#F1F5F3]">Accounts & Assets</h2>
        <p className="typography-caption text-[#9AA9A2] mt-0.5">
          Breakdown of your banks, cash and investments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#111A16] border border-[#223029] rounded-[20px] p-4 space-y-1">
          <span className="typography-caption text-[#9AA9A2]">Total Bank & Cash</span>
          <div className="typography-amount-l text-[#F1F5F3]">
            {formatMoney(totalLiquid, { isPrivate })}
          </div>
          <div className="typography-caption text-[#10B981] font-medium pt-0.5">
            {accountCards.length} accounts
          </div>
        </div>

        <div className="bg-[#111A16] border border-[#223029] rounded-[20px] p-4 space-y-1">
          <span className="typography-caption text-[#9AA9A2]">Total Investments</span>
          <div className="typography-amount-l text-[#F1F5F3]">
            {formatMoney(summary.currentInvestmentValue, { isPrivate })}
          </div>
          <div className="typography-caption text-[#60A5FA] font-medium pt-0.5">
            {formatPercent(summary.overallReturnPct, isPrivate)} returns
          </div>
        </div>
      </div>

      {/* Bank & Cash Accounts */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="typography-label uppercase tracking-wider text-[#9AA9A2]">
            Bank & Cash Accounts
          </h3>
          <span className="typography-caption text-[#9AA9A2]">
            {formatMoney(totalLiquid, { isPrivate })}
          </span>
        </div>

        <div className="space-y-2">
          {accountCards.map((account) => {
            const isCash = account.name.toLowerCase().includes('cash');
            const meta = accountsMeta.find((m) => m.name === account.name);

            return (
              <div
                key={account.name}
                className="bg-[#111A16] border border-[#223029] rounded-[20px] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <MonogramAvatar
                      name={account.name}
                      category={isCash ? 'cash' : 'bank'}
                    />
                    <div className="min-w-0">
                      <div className="typography-body font-semibold text-[#F1F5F3] truncate max-w-[170px]">
                        {account.name}
                      </div>
                      <div className="typography-caption text-[#9AA9A2]">
                        {isCash ? 'Physical Cash' : meta?.bank || meta?.type || 'Savings'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="typography-amount-l text-[#F1F5F3]">
                      {formatMoney(account.latestBalance, { isPrivate })}
                    </div>
                    <div className="mt-0.5">
                      <ChangeChip
                        amount={meta?.lastChange || 0}
                        isPrivate={isPrivate}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Sub details */}
                {(account.totalAdded > 0 || account.totalDeducted > 0) && (
                  <div className="pt-2 border-t border-[#223029] flex items-center justify-between typography-caption text-[#9AA9A2]">
                    <span>Total activity:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#10B981]">
                        +{formatMoney(account.totalAdded, { isPrivate })}
                      </span>
                      <span>/</span>
                      <span className="text-[#F87171]">
                        −{formatMoney(account.totalDeducted, { isPrivate })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Investments Portfolio */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="typography-label uppercase tracking-wider text-[#9AA9A2]">
            Investments Portfolio
          </h3>
          <span className="typography-caption text-[#9AA9A2]">
            {formatMoney(summary.currentInvestmentValue, { isPrivate })}
          </span>
        </div>

        <div className="space-y-2">
          {investmentsMeta.map((inv) => {
            const isProfit = inv.latestEarnings >= 0;

            return (
              <div
                key={inv.name}
                className="bg-[#111A16] border border-[#223029] rounded-[20px] p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <MonogramAvatar name={inv.name} category="investment" />
                    <div className="min-w-0">
                      <div className="typography-body font-semibold text-[#F1F5F3] truncate max-w-[170px]">
                        {inv.name}
                      </div>
                      <div className="typography-caption text-[#9AA9A2]">
                        {inv.platform ? `${inv.platform} · ` : ''}
                        {inv.type || 'Investment'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="typography-amount-l text-[#F1F5F3]">
                      {formatMoney(inv.currentValue, { isPrivate })}
                    </div>
                    <div
                      className={`typography-caption font-medium mt-0.5 ${
                        isProfit ? 'text-[#10B981]' : 'text-[#F87171]'
                      }`}
                    >
                      {formatPercent(inv.returnPct, isPrivate)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#223029] grid grid-cols-2 typography-caption text-[#9AA9A2]">
                  <div>
                    <span>Invested: </span>
                    <span className="text-[#F1F5F3] font-medium">
                      {formatMoney(inv.latestInvested, { isPrivate })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span>Profit/loss: </span>
                    <span
                      className={`font-medium ${
                        isProfit ? 'text-[#10B981]' : 'text-[#F87171]'
                      }`}
                    >
                      {formatMoney(inv.latestEarnings, { isPrivate, isChange: false })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
