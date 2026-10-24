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
        <h2 className="typography-title text-[#111827]">Accounts & Assets</h2>
        <p className="typography-caption text-[#5E6A75] mt-0.5">
          Breakdown of your banks, cash and investments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-[#E8E3DA] rounded-[20px] p-4 space-y-1 shadow-sm">
          <span className="typography-caption text-[#5E6A75]">Total Bank & Cash</span>
          <div className="typography-amount-l text-[#111827]">
            {formatMoney(totalLiquid, { isPrivate })}
          </div>
          <div className="typography-caption text-[#1A73E8] font-medium pt-0.5">
            {accountCards.length} accounts
          </div>
        </div>

        <div className="bg-white border border-[#E8E3DA] rounded-[20px] p-4 space-y-1 shadow-sm">
          <span className="typography-caption text-[#5E6A75]">Total Investments</span>
          <div className="typography-amount-l text-[#111827]">
            {formatMoney(summary.currentInvestmentValue, { isPrivate })}
          </div>
          <div className="typography-caption text-[#16A34A] font-medium pt-0.5">
            {formatPercent(summary.overallReturnPct, isPrivate)} returns
          </div>
        </div>
      </div>

      {/* Bank & Cash Accounts */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="typography-label uppercase tracking-wider text-[#5E6A75]">
            Bank & Cash Accounts
          </h3>
          <span className="typography-caption text-[#5E6A75]">
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
                className="bg-white border border-[#E8E3DA] rounded-[20px] p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <MonogramAvatar
                      name={account.name}
                      category={isCash ? 'cash' : 'bank'}
                    />
                    <div className="min-w-0">
                      <div className="typography-body font-semibold text-[#111827] truncate max-w-[170px]">
                        {account.name}
                      </div>
                      <div className="typography-caption text-[#5E6A75]">
                        {isCash ? 'Physical Cash' : meta?.bank || meta?.type || 'Savings'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="typography-amount-l text-[#111827]">
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
                  <div className="pt-2 border-t border-[#E8E3DA] flex items-center justify-between typography-caption text-[#5E6A75]">
                    <span>Total activity:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#16A34A]">
                        +{formatMoney(account.totalAdded, { isPrivate })}
                      </span>
                      <span>/</span>
                      <span className="text-[#DC2626]">
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
          <h3 className="typography-label uppercase tracking-wider text-[#5E6A75]">
            Investments Portfolio
          </h3>
          <span className="typography-caption text-[#5E6A75]">
            {formatMoney(summary.currentInvestmentValue, { isPrivate })}
          </span>
        </div>

        <div className="space-y-2">
          {investmentsMeta.map((inv) => {
            const isProfit = inv.latestEarnings >= 0;

            return (
              <div
                key={inv.name}
                className="bg-white border border-[#E8E3DA] rounded-[20px] p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <MonogramAvatar name={inv.name} category="investment" />
                    <div className="min-w-0">
                      <div className="typography-body font-semibold text-[#111827] truncate max-w-[170px]">
                        {inv.name}
                      </div>
                      <div className="typography-caption text-[#5E6A75]">
                        {inv.platform ? `${inv.platform} · ` : ''}
                        {inv.type || 'Investment'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="typography-amount-l text-[#111827]">
                      {formatMoney(inv.currentValue, { isPrivate })}
                    </div>
                    <div
                      className={`typography-caption font-medium mt-0.5 ${
                        isProfit ? 'text-[#16A34A]' : 'text-[#DC2626]'
                      }`}
                    >
                      {formatPercent(inv.returnPct, isPrivate)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8E3DA] grid grid-cols-2 typography-caption text-[#5E6A75]">
                  <div>
                    <span>Invested: </span>
                    <span className="text-[#111827] font-medium">
                      {formatMoney(inv.latestInvested, { isPrivate })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span>Profit/loss: </span>
                    <span
                      className={`font-medium ${
                        isProfit ? 'text-[#16A34A]' : 'text-[#DC2626]'
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
