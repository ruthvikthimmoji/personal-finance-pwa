import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  getSavedScriptUrl,
  saveScriptUrl,
  testConnection,
  cacheFinanceData,
  INITIAL_FINANCE_DATA,
} from '../services/api';
import {
  Check,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
} from 'lucide-react';

interface SettingsViewProps {
  onRefreshData: () => void;
  isPrivate: boolean;
  onTogglePrivacy: () => void;
}

const APPS_SCRIPT_SOURCE = `/**
 * Personal Finance Tracker - Google Apps Script Backend
 * Paste this in your Google Sheet: Extensions > Apps Script > Deploy as Web App ("Anyone")
 */

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getData';
    if (action === 'ping') {
      return jsonResponse({ success: true, message: 'Connected to Google Sheet!' });
    }
    if (action === 'getData') {
      return jsonResponse({ success: true, data: fetchAllFinanceData() });
    }
    return jsonResponse({ success: false, error: 'Unknown GET action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      try { payload = JSON.parse(e.postData.contents); } catch(ex) { payload = e.parameter || {}; }
    } else {
      payload = e.parameter || {};
    }
    if (payload.action === 'addBalance') {
      return jsonResponse({ success: true, result: addBalanceLogEntry(payload.date, payload.balances) });
    }
    if (payload.action === 'addInvestment') {
      return jsonResponse({ success: true, result: addInvestmentLogEntry(payload.date, payload.investments) });
    }
    return jsonResponse({ success: false, error: 'Unknown POST action' });
  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function fetchAllFinanceData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName('Dashboard');
  const summary = { bankBalance: 0, cashInHand: 0, totalInvested: 0, totalEarnings: 0, currentInvestmentValue: 0, overallReturnPct: 0, netWorth: 0 };
  const accountCards = [];

  if (dashSheet) {
    const d = dashSheet.getDataRange().getValues();
    for (let r = 4; r < d.length; r++) {
      const label = String(d[r][0] || '').trim().toLowerCase();
      const val = parseNum(d[r][1]);
      if (label.includes('bank balance')) summary.bankBalance = val;
      else if (label.includes('cash in hand')) summary.cashInHand = val;
      else if (label.includes('amount invested')) summary.totalInvested = val;
      else if (label.includes('investment earnings')) summary.totalEarnings = val;
      else if (label.includes('current investment value')) summary.currentInvestmentValue = val;
      else if (label.includes('investment return')) summary.overallReturnPct = val;
      else if (label.includes('net worth')) summary.netWorth = val;

      const accName = String(d[r][3] || '').trim();
      if (accName && accName.toUpperCase() !== 'TOTAL') {
        accountCards.push({ name: accName, latestBalance: parseNum(d[r][4]), totalAdded: parseNum(d[r][5]), totalDeducted: parseNum(d[r][6]) });
      }
    }
  }

  const accSheet = ss.getSheetByName('Accounts');
  const accountsMeta = [];
  if (accSheet) {
    const av = accSheet.getDataRange().getValues();
    for (let r = 5; r < av.length; r++) {
      const name = String(av[r][0] || '').trim();
      if (name && name.toUpperCase() !== 'TOTAL') {
        accountsMeta.push({ name: name, bank: String(av[r][1] || '').trim(), type: String(av[r][2] || '').trim(), latestBalance: parseNum(av[r][3]), latestLogDate: formatDate(av[r][4]), totalAdded: parseNum(av[r][6]), totalDeducted: parseNum(av[r][7]), netChange: parseNum(av[r][8]), lastChange: parseNum(av[r][9]) });
      }
    }
  }

  const balSheet = ss.getSheetByName('Balance Log');
  const balanceLogs = [];
  let balanceColumns = [];
  if (balSheet) {
    const bv = balSheet.getDataRange().getValues();
    if (bv.length >= 4) {
      const headers = bv[3];
      for (let c = 1; c <= 6; c++) {
        const h = String(headers[c] || '').trim();
        if (h && !h.toLowerCase().includes('name it')) balanceColumns.push(h);
      }
      for (let r = 4; r < bv.length; r++) {
        const row = bv[r];
        if (!row[0]) continue;
        const balances = {};
        for (let c = 1; c <= 6; c++) {
          const colName = String(headers[c] || '').trim();
          if (colName && !colName.toLowerCase().includes('name it')) balances[colName] = parseNum(row[c]);
        }
        balanceLogs.push({ date: formatDate(row[0]), balances: balances, total: parseNum(row[7]), totalChange: parseNum(row[14]) });
      }
    }
  }

  const invSheet = ss.getSheetByName('Investments');
  const investmentsMeta = [];
  if (invSheet) {
    const iv = invSheet.getDataRange().getValues();
    for (let r = 5; r < iv.length; r++) {
      const name = String(iv[r][0] || '').trim();
      if (name && name.toUpperCase() !== 'TOTAL' && !name.toLowerCase().includes('name it')) {
        investmentsMeta.push({ name: name, type: String(iv[r][1] || '').trim(), platform: String(iv[r][2] || '').trim(), latestInvested: parseNum(iv[r][3]), latestEarnings: parseNum(iv[r][4]), currentValue: parseNum(iv[r][5]), returnPct: parseNum(iv[r][6]), latestLogDate: formatDate(iv[r][7]) });
      }
    }
  }

  const invLogSheet = ss.getSheetByName('Investment Log');
  const investmentLogs = [];
  let investmentColumns = [];
  if (invLogSheet) {
    const ilv = invLogSheet.getDataRange().getValues();
    if (ilv.length >= 4) {
      const headers = ilv[3];
      for (let c = 1; c <= 8; c++) {
        const h = String(headers[c] || '').trim();
        if (h && !h.toLowerCase().includes('name it')) investmentColumns.push(h);
      }
      for (let r = 4; r < ilv.length; r++) {
        const row = ilv[r];
        if (!row[0]) continue;
        const invested = {}, earnings = {};
        for (let c = 1; c <= 8; c++) {
          const colName = String(headers[c] || '').trim();
          if (colName && !colName.toLowerCase().includes('name it')) invested[colName] = parseNum(row[c]);
        }
        for (let c = 10; c <= 17; c++) {
          const colName = String(headers[c] || '').trim();
          if (colName && !colName.toLowerCase().includes('name it')) earnings[colName] = parseNum(row[c]);
        }
        investmentLogs.push({ date: formatDate(row[0]), invested: invested, earnings: earnings, totalInvested: parseNum(row[9]), totalEarnings: parseNum(row[18]), totalValue: parseNum(row[19]) });
      }
    }
  }

  return { summary, accountCards, accountsMeta, balanceColumns, balanceLogs, investmentsMeta, investmentColumns, investmentLogs, lastUpdated: new Date().toISOString() };
}

function addBalanceLogEntry(dateStr, balancesObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Balance Log');
  const data = sheet.getDataRange().getValues();
  const headers = data[3];
  let lastRowWithDate = 4;
  for (let r = 4; r < data.length; r++) { if (data[r][0]) lastRowWithDate = r + 1; }
  const targetRow = lastRowWithDate + 1;
  if (targetRow > sheet.getMaxRows()) sheet.insertRowAfter(sheet.getMaxRows());
  sheet.getRange(targetRow, 1).setValue(parseInputDate(dateStr)).setNumberFormat('dd-mmm-yyyy');
  for (let c = 1; c <= 6; c++) {
    const colName = String(headers[c] || '').trim();
    if (colName && balancesObj && balancesObj.hasOwnProperty(colName)) {
      sheet.getRange(targetRow, c + 1).setValue(Number(balancesObj[colName]) || 0);
    }
  }
  const prevRow = targetRow - 1;
  sheet.getRange(prevRow, 8, 1, 8).copyTo(sheet.getRange(targetRow, 8, 1, 8), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);
  sheet.getRange(prevRow, 8, 1, 8).copyTo(sheet.getRange(targetRow, 8, 1, 8), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  SpreadsheetApp.flush();
  return { success: true, row: targetRow };
}

function addInvestmentLogEntry(dateStr, investmentsObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Investment Log');
  const data = sheet.getDataRange().getValues();
  const headers = data[3];
  let lastRowWithDate = 4;
  for (let r = 4; r < data.length; r++) { if (data[r][0]) lastRowWithDate = r + 1; }
  const targetRow = lastRowWithDate + 1;
  if (targetRow > sheet.getMaxRows()) sheet.insertRowAfter(sheet.getMaxRows());
  sheet.getRange(targetRow, 1).setValue(parseInputDate(dateStr)).setNumberFormat('dd-mmm-yyyy');
  for (let c = 1; c <= 8; c++) {
    const colName = String(headers[c] || '').trim();
    if (colName && investmentsObj && investmentsObj[colName]) {
      sheet.getRange(targetRow, c + 1).setValue(Number(investmentsObj[colName].invested) || 0);
    }
  }
  const prevRow = targetRow - 1;
  sheet.getRange(prevRow, 10).copyTo(sheet.getRange(targetRow, 10), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);
  for (let c = 10; c <= 17; c++) {
    const colName = String(headers[c] || '').trim();
    if (colName && investmentsObj && investmentsObj[colName]) {
      sheet.getRange(targetRow, c + 1).setValue(Number(investmentsObj[colName].earnings) || 0);
    }
  }
  sheet.getRange(prevRow, 19, 1, 2).copyTo(sheet.getRange(targetRow, 19, 1, 2), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);
  sheet.getRange(prevRow, 2, 1, 19).copyTo(sheet.getRange(targetRow, 2, 1, 19), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);
  SpreadsheetApp.flush();
  return { success: true, row: targetRow };
}

function parseNum(val) {
  if (val === null || val === undefined || val === '' || val === '-') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/,/g, '').replace(/[^\\d.-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) return Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd-MMM-yyyy');
  return String(val);
}

function parseInputDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr.includes('-') && dateStr.length === 10 && dateStr.indexOf('-') === 4) {
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return new Date(dateStr);
}`;

export const SettingsView: React.FC<SettingsViewProps> = ({
  onRefreshData,
  isPrivate,
  onTogglePrivacy,
}) => {
  const [url, setUrl] = useState(getSavedScriptUrl());
  const [isUrlRevealed, setIsUrlRevealed] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://192.168.1.4:5174';
  const phoneUrl = currentOrigin.includes('localhost') ? 'http://192.168.1.4:5174' : currentOrigin;

  const handleSave = () => {
    saveScriptUrl(url);
    setStatusMessage('URL saved');
    setSyncStatus('idle');
    onRefreshData();
  };

  const handleTestConnection = async () => {
    if (!url.trim()) {
      setStatusMessage('Enter an amount in rupees, for example 25,000');
      setSyncStatus('error');
      return;
    }

    setIsTesting(true);
    setStatusMessage('');

    const res = await testConnection(url.trim());
    setIsTesting(false);

    if (res.success) {
      setSyncStatus('connected');
      setStatusMessage('Connected. Your sheet is ready.');
      saveScriptUrl(url.trim());
      onRefreshData();
    } else {
      setSyncStatus('error');
      setStatusMessage(res.message);
    }
  };

  const handleCopyScript = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_SOURCE);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleClearData = () => {
    cacheFinanceData(INITIAL_FINANCE_DATA);
    setShowClearConfirm(false);
    onRefreshData();
  };

  return (
    <div className="space-y-4 pb-28 px-4 max-w-lg mx-auto">
      {/* Title */}
      <div className="px-1 pt-1">
        <h2 className="typography-title text-[#111827]">Settings</h2>
        <p className="typography-caption text-[#5E6A75] mt-0.5">
          Sync, privacy and configuration
        </p>
      </div>

      {/* Spreadsheet Quick Link */}
      <a
        href="https://docs.google.com/spreadsheets/d/1al3dZQcq-FOASXxkfYKt_-gvbolvGMqLjTS32EWvXjQ/edit?gid=11885255#gid=11885255"
        target="_blank"
        rel="noreferrer"
        className="bg-white border border-[#E8E3DA] rounded-[20px] p-4 flex items-center justify-between hover:bg-[#FAF8F5] active:bg-[#F3EFE6] transition-all shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1A73E8]/10 border border-[#1A73E8]/20 flex items-center justify-center text-[#1A73E8]">
            <FileSpreadsheet className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="typography-body font-semibold text-[#111827]">
              Open Google Sheet
            </div>
            <div className="typography-caption text-[#5E6A75]">
              Personal Finance Tracker
            </div>
          </div>
        </div>
        <ExternalLink className="w-5 h-5 text-[#5E6A75]" strokeWidth={1.75} />
      </a>

      {/* Sync Card */}
      <div className="bg-white border border-[#E8E3DA] rounded-[20px] p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="typography-label uppercase tracking-wider text-[#5E6A75]">
            Google Sheets sync
          </h3>
          {syncStatus === 'connected' && (
            <span className="inline-flex items-center gap-1 text-xs text-[#16A34A] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              Connected
            </span>
          )}
        </div>

        {/* Masked URL Input */}
        <div className="space-y-2">
          <div className="relative flex items-center">
            <input
              type={isUrlRevealed ? 'text' : 'password'}
              placeholder="https://script.google.com/macros/s/.../exec"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full h-[56px] pl-4 pr-12 rounded-[14px] bg-[#FAF8F5] border border-[#E8E3DA] text-[16px] text-[#111827] placeholder-[#8C9BA8] focus:outline-none focus:border-[#1A73E8] focus:ring-2 focus:ring-[#1A73E8]/20 font-mono text-sm"
            />
            <button
              type="button"
              onClick={() => setIsUrlRevealed(!isUrlRevealed)}
              className="absolute right-3 p-1.5 text-[#5E6A75] hover:text-[#111827]"
              title={isUrlRevealed ? 'Hide URL' : 'Reveal URL'}
            >
              {isUrlRevealed ? (
                <EyeOff className="w-4 h-4" strokeWidth={1.75} />
              ) : (
                <Eye className="w-4 h-4" strokeWidth={1.75} />
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="h-[44px] rounded-[14px] bg-[#F3EFE6] hover:bg-[#EAE4D7] active:scale-[0.98] border border-[#E8E3DA] text-[#111827] font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              {isTesting ? (
                <span className="w-4 h-4 border-2 border-[#111827] border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>Test connection</span>
              )}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="h-[44px] rounded-[14px] bg-[#1A73E8] hover:bg-[#2B82F6] active:scale-[0.98] active:bg-[#1558B0] text-white font-semibold text-xs flex items-center justify-center transition-all"
            >
              Save
            </button>
          </div>

          {statusMessage && (
            <p
              className={`typography-caption pt-1 ${
                syncStatus === 'connected'
                  ? 'text-[#16A34A]'
                  : syncStatus === 'error'
                  ? 'text-[#DC2626]'
                  : 'text-[#5E6A75]'
              }`}
            >
              {statusMessage}
            </p>
          )}
        </div>
      </div>

      {/* 1-Minute Setup Guide (Collapsible) */}
      <div className="bg-white border border-[#E8E3DA] rounded-[20px] overflow-hidden shadow-sm">
        <button
          type="button"
          onClick={() => setIsGuideOpen(!isGuideOpen)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-[#FAF8F5] transition-colors"
        >
          <div>
            <div className="typography-body font-semibold text-[#111827]">
              Setup guide
            </div>
            <div className="typography-caption text-[#5E6A75]">
              Connect your Google Sheet in 1 minute
            </div>
          </div>
          <div className="text-[#5E6A75]">
            {isGuideOpen ? (
              <ChevronUp className="w-5 h-5" strokeWidth={1.75} />
            ) : (
              <ChevronDown className="w-5 h-5" strokeWidth={1.75} />
            )}
          </div>
        </button>

        {isGuideOpen && (
          <div className="px-4 pb-4 pt-1 border-t border-[#E8E3DA] bg-[#FAF8F5] space-y-3">
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleCopyScript}
                className="h-9 px-3 rounded-[10px] bg-[#1A73E8] text-white font-semibold text-xs inline-flex items-center gap-1.5 active:scale-95"
              >
                {hasCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{hasCopied ? 'Copied' : 'Copy script code'}</span>
              </button>
            </div>

            <ol className="typography-caption text-[#5E6A75] space-y-2 list-decimal list-inside leading-relaxed">
              <li>In your Google Sheet, open <strong className="text-[#111827]">Extensions &gt; Apps Script</strong>.</li>
              <li>Delete all existing code, paste the copied script, and click <strong className="text-[#111827]">Save</strong>.</li>
              <li>Click <strong className="text-[#111827]">Deploy &gt; New deployment</strong>.</li>
              <li>Select type <strong className="text-[#111827]">Web app</strong>.</li>
              <li>Set Execute as: <strong className="text-[#111827]">Me</strong>, Who has access: <strong className="text-[#111827]">Anyone</strong>.</li>
              <li>Click Deploy, approve permissions (click Advanced &gt; Go to project), and paste your Web App URL above.</li>
            </ol>
          </div>
        )}
      </div>

      {/* Open on Phone QR Code */}
      <div className="bg-white border border-[#E8E3DA] rounded-[20px] p-4 space-y-3 shadow-sm">
        <h3 className="typography-label uppercase tracking-wider text-[#5E6A75]">
          Open on your phone
        </h3>

        <div className="flex items-center gap-4 bg-[#FAF8F5] p-3 rounded-[14px] border border-[#E8E3DA]">
          <div className="bg-white p-2 rounded-[10px] shrink-0 border border-[#E8E3DA]">
            <QRCodeSVG
              value={phoneUrl}
              size={100}
              bgColor="#ffffff"
              fgColor="#111827"
              level="M"
            />
          </div>
          <div className="space-y-1 typography-caption text-[#5E6A75]">
            <p className="font-semibold text-[#111827]">
              Scan with your camera
            </p>
            <p>
              Instantly opens this app on your phone. Then tap "Add to Home Screen".
            </p>
            <div className="pt-1 text-[11px] font-mono text-[#1A73E8] break-all">
              {phoneUrl}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy & Cache */}
      <div className="bg-white border border-[#E8E3DA] rounded-[20px] p-4 space-y-3 shadow-sm">
        <h3 className="typography-label uppercase tracking-wider text-[#5E6A75]">
          Privacy & Data
        </h3>

        <div className="flex items-center justify-between py-1">
          <div>
            <div className="typography-body text-[#111827]">Privacy mode</div>
            <div className="typography-caption text-[#5E6A75]">
              Masks money amounts as ₹•••••• in public
            </div>
          </div>
          <button
            type="button"
            onClick={onTogglePrivacy}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              isPrivate ? 'bg-[#1A73E8]' : 'bg-[#E8E3DA]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isPrivate ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="pt-2 border-t border-[#E8E3DA] flex items-center justify-between">
          <div>
            <div className="typography-body text-[#111827]">Local cache</div>
            <div className="typography-caption text-[#5E6A75]">
              Reset cached entries to sheet defaults
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="h-9 px-3 rounded-[10px] border border-[#DC2626]/30 text-[#DC2626] hover:bg-[#DC2626]/10 text-xs font-medium active:scale-[0.98]"
          >
            Clear data
          </button>
        </div>
      </div>

      {/* Clear Cache Confirmation Dialog */}
      {showClearConfirm && (
        <div className="p-4 rounded-[14px] bg-[#FEF2F2] border border-[#FECACA] space-y-2.5">
          <p className="typography-body text-[#991B1B]">
            Clear local cache? Your Google Sheet data will not be affected.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearData}
              className="h-9 px-4 rounded-[10px] bg-[#DC2626] text-white font-semibold text-xs"
            >
              Yes, clear
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm(false)}
              className="h-9 px-4 rounded-[10px] bg-[#E8E3DA] text-[#111827] font-semibold text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* About & Trust Section */}
      <div className="p-4 bg-white border border-[#E8E3DA] rounded-[20px] space-y-2 shadow-sm">
        <h3 className="typography-label uppercase tracking-wider text-[#5E6A75]">
          About & Trust
        </h3>
        <p className="typography-caption text-[#5E6A75] leading-relaxed">
          Data lives in your own Google Sheet and on this device. There are no third-party servers, no analytics, no ads, and no data sales.
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-[#E8E3DA] typography-caption text-[#8C9BA8]">
          <span>Personal Finance Tracker</span>
          <span>Version 1.0</span>
        </div>
      </div>
    </div>
  );
};
