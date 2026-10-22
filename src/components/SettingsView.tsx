import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  getSavedScriptUrl,
  saveScriptUrl,
  testConnection,
} from '../services/api';
import {
  Settings,
  Link2,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Smartphone,
  Sparkles,
  ShieldCheck,
  FileSpreadsheet,
  QrCode,
  Globe,
} from 'lucide-react';

interface SettingsViewProps {
  onRefreshData: () => void;
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

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefreshData }) => {
  const [url, setUrl] = useState(getSavedScriptUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);

  // Compute mobile access URL (either current browser URL or local WiFi URL)
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://192.168.1.4:5173';
  const mobileAccessUrl = currentOrigin.includes('localhost')
    ? 'http://192.168.1.4:5173'
    : currentOrigin;

  const handleSaveUrl = () => {
    saveScriptUrl(url);
    setTestResult({ success: true, message: 'URL saved to app settings!' });
    onRefreshData();
  };

  const handleTestConnection = async () => {
    if (!url.trim()) {
      setTestResult({ success: false, message: 'Please enter a Web App URL first.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    const res = await testConnection(url.trim());
    setTestResult(res);
    setIsTesting(false);

    if (res.success) {
      saveScriptUrl(url.trim());
      onRefreshData();
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_SOURCE);
      setHasCopiedCode(true);
      setTimeout(() => setHasCopiedCode(false), 2500);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-5 pb-24 px-4 pt-1 max-w-lg mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">Settings & Sync</h2>
        <p className="text-xs text-slate-400">Connect directly to your Google Spreadsheet</p>
      </div>

      {/* Spreadsheet Quick Link Card */}
      <a
        href="https://docs.google.com/spreadsheets/d/1al3dZQcq-FOASXxkfYKt_-gvbolvGMqLjTS32EWvXjQ/edit?gid=11885255#gid=11885255"
        target="_blank"
        rel="noreferrer"
        className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
              Open Google Spreadsheet
            </div>
            <div className="text-xs text-slate-400">Personal Finance Tracker</div>
          </div>
        </div>
        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
      </a>

      {/* Open on Phone via QR Code Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Open on Your Phone
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
          <div className="bg-white p-2 rounded-xl shadow-md shrink-0">
            <QRCodeSVG
              value={mobileAccessUrl}
              size={130}
              bgColor="#ffffff"
              fgColor="#090d16"
              level="M"
            />
          </div>

          <div className="space-y-1.5 text-center sm:text-left">
            <div className="text-xs font-semibold text-white">Scan with Phone Camera</div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Scan this code with your iPhone or Android camera to immediately open the app on your phone.
            </p>
            <div className="pt-1">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-md border border-emerald-800/40 inline-block break-all">
                {mobileAccessUrl}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Card */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-3">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Google Apps Script Web App URL
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Paste the Web App URL generated from Extensions &gt; Apps Script in your spreadsheet to sync data in real time.
        </p>

        <div className="space-y-2">
          <input
            type="url"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
          />

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isTesting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Test Connection
                </>
              )}
            </button>

            <button
              onClick={handleSaveUrl}
              className="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 active:scale-[0.98] transition-all"
            >
              Save
            </button>
          </div>
        </div>

        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
              testResult.success
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <span className="break-all">{testResult.message}</span>
          </div>
        )}
      </div>

      {/* 60-Second Setup Guide */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              1-Minute Setup Guide
            </h3>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
          >
            {hasCopiedCode ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Script Code
              </>
            )}
          </button>
        </div>

        <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
          <li>
            Open your <span className="text-emerald-400 font-semibold">Google Sheet</span>.
          </li>
          <li>
            In the top menu, click <span className="text-white font-semibold">Extensions &gt; Apps Script</span>.
          </li>
          <li>
            Delete any sample code in <code className="text-emerald-300 bg-slate-800 px-1 py-0.5 rounded">Code.gs</code>, tap <strong>Copy Script Code</strong> above, and paste it.
          </li>
          <li>
            Click the <span className="text-white font-semibold">Save icon</span> (Floppy / Cmd+S).
          </li>
          <li>
            Click <span className="text-white font-semibold">Deploy &gt; New deployment</span>.
          </li>
          <li>
            Click the gear icon &gt; Select <span className="text-emerald-300 font-semibold">Web app</span>.
          </li>
          <li>
            Set <strong>Execute as:</strong> <code className="text-slate-200">Me</code> and <strong>Who has access:</strong> <code className="text-emerald-300 font-bold">Anyone</code>.
          </li>
          <li>
            Click <strong>Deploy</strong>, grant Google permissions, then copy the <strong>Web App URL</strong> and paste it above!
          </li>
        </ol>
      </div>

      {/* How to Install on Phone Card */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-2.5">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Install on Your Phone
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/70">
            <div className="font-bold text-white mb-1">📱 iPhone (Safari)</div>
            <p className="text-slate-400">
              Tap the <strong>Share</strong> icon (square with arrow pointing up) at the bottom, then scroll down and tap <strong>"Add to Home Screen"</strong>.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/70">
            <div className="font-bold text-white mb-1">🤖 Android (Chrome)</div>
            <p className="text-slate-400">
              Tap the <strong>three dots</strong> (⋮) in the top right corner, then tap <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
