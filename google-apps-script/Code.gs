/**
 * Personal Finance Tracker - Google Apps Script Backend
 * 
 * Instructions:
 * 1. In your Google Sheet, click "Extensions" > "Apps Script".
 * 2. Delete any code in Code.gs, paste this entire file, and click Save (Floppy icon / Cmd+S).
 * 3. Click "Deploy" > "New deployment".
 * 4. Select type: "Web app".
 * 5. Description: "Finance App API".
 * 6. Execute as: "Me" (your email).
 * 7. Who has access: "Anyone".
 * 8. Click "Deploy", authorize permissions when prompted.
 * 9. Copy the generated Web App URL and paste it into the mobile app's Settings!
 */

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'getData';
    
    if (action === 'ping') {
      return jsonResponse({
        success: true,
        message: 'Successfully connected to Google Sheet!',
        timestamp: new Date().toISOString(),
        sheetName: SpreadsheetApp.getActiveSpreadsheet().getName()
      });
    }

    if (action === 'getData') {
      const data = fetchAllFinanceData();
      return jsonResponse({
        success: true,
        data: data
      });
    }

    return jsonResponse({
      success: false,
      error: 'Unknown GET action: ' + action
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.toString(),
      stack: err.stack
    });
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (ex) {
        payload = e.parameter || {};
      }
    } else {
      payload = e.parameter || {};
    }

    const action = payload.action;

    if (action === 'addBalance') {
      const result = addBalanceLogEntry(payload.date, payload.balances);
      return jsonResponse({ success: true, result: result });
    }

    if (action === 'addInvestment') {
      const result = addInvestmentLogEntry(payload.date, payload.investments);
      return jsonResponse({ success: true, result: result });
    }

    if (action === 'addBoth') {
      let bResult = null;
      let iResult = null;
      if (payload.balances) {
        bResult = addBalanceLogEntry(payload.date, payload.balances);
      }
      if (payload.investments) {
        iResult = addInvestmentLogEntry(payload.date, payload.investments);
      }
      return jsonResponse({
        success: true,
        balanceResult: bResult,
        investmentResult: iResult
      });
    }

    return jsonResponse({
      success: false,
      error: 'Unknown POST action: ' + action
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.toString(),
      stack: err.stack
    });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Reads all data from Dashboard, Accounts, Balance Log, Investments, Investment Log
 */
function fetchAllFinanceData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Dashboard summary
  const dashSheet = ss.getSheetByName('Dashboard');
  const summary = {
    bankBalance: 0,
    cashInHand: 0,
    totalInvested: 0,
    totalEarnings: 0,
    currentInvestmentValue: 0,
    overallReturnPct: 0,
    netWorth: 0,
  };

  const accountCards = [];

  if (dashSheet) {
    const dashVals = dashSheet.getDataRange().getValues();
    // Rows 4 to 10 contain summary and account stats
    for (let r = 4; r < dashVals.length; r++) {
      const label = String(dashVals[r][0] || '').trim().toLowerCase();
      const val = parseNum(dashVals[r][1]);

      if (label.includes('bank balance')) summary.bankBalance = val;
      else if (label.includes('cash in hand')) summary.cashInHand = val;
      else if (label.includes('amount invested')) summary.totalInvested = val;
      else if (label.includes('investment earnings')) summary.totalEarnings = val;
      else if (label.includes('current investment value')) summary.currentInvestmentValue = val;
      else if (label.includes('investment return')) summary.overallReturnPct = val;
      else if (label.includes('net worth')) summary.netWorth = val;

      const accName = String(dashVals[r][3] || '').trim();
      if (accName && accName.toUpperCase() !== 'TOTAL') {
        accountCards.push({
          name: accName,
          latestBalance: parseNum(dashVals[r][4]),
          totalAdded: parseNum(dashVals[r][5]),
          totalDeducted: parseNum(dashVals[r][6]),
        });
      }
    }
  }

  // 2. Accounts sheet metadata
  const accSheet = ss.getSheetByName('Accounts');
  const accountsMeta = [];
  if (accSheet) {
    const accVals = accSheet.getDataRange().getValues();
    // Header is row 5 (0-indexed: 4)
    for (let r = 5; r < accVals.length; r++) {
      const name = String(accVals[r][0] || '').trim();
      if (name && name.toUpperCase() !== 'TOTAL') {
        accountsMeta.push({
          name: name,
          bank: String(accVals[r][1] || '').trim(),
          type: String(accVals[r][2] || '').trim(),
          latestBalance: parseNum(accVals[r][3]),
          latestLogDate: formatDate(accVals[r][4]),
          totalAdded: parseNum(accVals[r][6]),
          totalDeducted: parseNum(accVals[r][7]),
          netChange: parseNum(accVals[r][8]),
          lastChange: parseNum(accVals[r][9]),
        });
      }
    }
  }

  // 3. Balance Log history
  const balSheet = ss.getSheetByName('Balance Log');
  const balanceLogs = [];
  let balanceColumns = [];
  if (balSheet) {
    const balVals = balSheet.getDataRange().getValues();
    if (balVals.length >= 4) {
      // Row 4 (index 3) is headers: Date, HDFC, SBI, Indian Bank, Canra Bank, Account 5, Cash in Hand, TOTAL, ...
      const headers = balVals[3];
      // Account headers are from col 1 to 6 (col index 1 to 6)
      balanceColumns = [];
      for (let c = 1; c <= 6; c++) {
        const h = String(headers[c] || '').trim();
        if (h && !h.toLowerCase().includes('name it')) {
          balanceColumns.push(h);
        }
      }

      for (let r = 4; r < balVals.length; r++) {
        const row = balVals[r];
        const dateRaw = row[0];
        if (!dateRaw) continue;

        const dateStr = formatDate(dateRaw);
        const balances = {};
        for (let c = 1; c <= 6; c++) {
          const colName = String(headers[c] || '').trim();
          if (colName && !colName.toLowerCase().includes('name it')) {
            balances[colName] = parseNum(row[c]);
          }
        }
        const total = parseNum(row[7]); // Col H is Total
        const totalChange = parseNum(row[14]); // Col O is Total Change

        balanceLogs.push({
          date: dateStr,
          balances: balances,
          total: total,
          totalChange: totalChange
        });
      }
    }
  }

  // 4. Investments sheet metadata
  const invSheet = ss.getSheetByName('Investments');
  const investmentsMeta = [];
  if (invSheet) {
    const invVals = invSheet.getDataRange().getValues();
    for (let r = 5; r < invVals.length; r++) {
      const name = String(invVals[r][0] || '').trim();
      if (name && name.toUpperCase() !== 'TOTAL' && !name.toLowerCase().includes('name it')) {
        investmentsMeta.push({
          name: name,
          type: String(invVals[r][1] || '').trim(),
          platform: String(invVals[r][2] || '').trim(),
          latestInvested: parseNum(invVals[r][3]),
          latestEarnings: parseNum(invVals[r][4]),
          currentValue: parseNum(invVals[r][5]),
          returnPct: parseNum(invVals[r][6]),
          latestLogDate: formatDate(invVals[r][7]),
        });
      }
    }
  }

  // 5. Investment Log history
  const invLogSheet = ss.getSheetByName('Investment Log');
  const investmentLogs = [];
  let investmentColumns = [];
  if (invLogSheet) {
    const invLogVals = invLogSheet.getDataRange().getValues();
    if (invLogVals.length >= 4) {
      const headers = invLogVals[3];
      // Invested columns: B to I (cols 1 to 8)
      investmentColumns = [];
      for (let c = 1; c <= 8; c++) {
        const h = String(headers[c] || '').trim();
        if (h && !h.toLowerCase().includes('name it')) {
          investmentColumns.push(h);
        }
      }

      for (let r = 4; r < invLogVals.length; r++) {
        const row = invLogVals[r];
        const dateRaw = row[0];
        if (!dateRaw) continue;

        const dateStr = formatDate(dateRaw);
        const invested = {};
        const earnings = {};

        for (let c = 1; c <= 8; c++) {
          const colName = String(headers[c] || '').trim();
          if (colName && !colName.toLowerCase().includes('name it')) {
            invested[colName] = parseNum(row[c]);
          }
        }

        // Earnings columns: K to R (cols 10 to 17)
        for (let c = 10; c <= 17; c++) {
          const colName = String(headers[c] || '').trim();
          if (colName && !colName.toLowerCase().includes('name it')) {
            earnings[colName] = parseNum(row[c]);
          }
        }

        investmentLogs.push({
          date: dateStr,
          invested: invested,
          earnings: earnings,
          totalInvested: parseNum(row[9]),    // Col J
          totalEarnings: parseNum(row[18]),   // Col S
          totalValue: parseNum(row[19])       // Col T
        });
      }
    }
  }

  return {
    summary: summary,
    accountCards: accountCards,
    accountsMeta: accountsMeta,
    balanceColumns: balanceColumns,
    balanceLogs: balanceLogs,
    investmentsMeta: investmentsMeta,
    investmentColumns: investmentColumns,
    investmentLogs: investmentLogs,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Appends a new entry to Balance Log
 */
function addBalanceLogEntry(dateStr, balancesObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Balance Log');
  if (!sheet) throw new Error('Balance Log sheet not found');

  const data = sheet.getDataRange().getValues();
  const headerRowIdx = 4; // 1-based row 4
  const headers = data[headerRowIdx - 1];

  // Find last row with date
  let lastRowWithDate = 4;
  for (let r = 4; r < data.length; r++) {
    if (data[r][0]) {
      lastRowWithDate = r + 1; // 1-based
    }
  }

  const targetRow = lastRowWithDate + 1;
  if (targetRow > sheet.getMaxRows()) {
    sheet.insertRowAfter(sheet.getMaxRows());
  }

  // Format date
  const entryDate = parseInputDate(dateStr);
  sheet.getRange(targetRow, 1).setValue(entryDate).setNumberFormat('dd-mmm-yyyy');

  // Fill account values for cols 2 to 7 (B to G)
  for (let c = 1; c <= 6; c++) {
    const colName = String(headers[c] || '').trim();
    if (colName) {
      if (balancesObj && balancesObj.hasOwnProperty(colName)) {
        const val = balancesObj[colName];
        sheet.getRange(targetRow, c + 1).setValue(val === '' || val === null ? '-' : Number(val));
      }
    }
  }

  // Copy formulas from row above for columns H to O (cols 8 to 15)
  // E.g. Total (Col H) and Differences (Col I to O)
  const prevRow = targetRow - 1;
  const formulaRangePrev = sheet.getRange(prevRow, 8, 1, 8);
  const formulaRangeTarget = sheet.getRange(targetRow, 8, 1, 8);
  formulaRangePrev.copyTo(formulaRangeTarget, SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);

  // Copy formatting
  formulaRangePrev.copyTo(formulaRangeTarget, SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);

  SpreadsheetApp.flush();
  return { success: true, row: targetRow, date: dateStr };
}

/**
 * Appends a new entry to Investment Log
 */
function addInvestmentLogEntry(dateStr, investmentsObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Investment Log');
  if (!sheet) throw new Error('Investment Log sheet not found');

  const data = sheet.getDataRange().getValues();
  const headerRowIdx = 4;
  const headers = data[headerRowIdx - 1];

  let lastRowWithDate = 4;
  for (let r = 4; r < data.length; r++) {
    if (data[r][0]) {
      lastRowWithDate = r + 1;
    }
  }

  const targetRow = lastRowWithDate + 1;
  if (targetRow > sheet.getMaxRows()) {
    sheet.insertRowAfter(sheet.getMaxRows());
  }

  const entryDate = parseInputDate(dateStr);
  sheet.getRange(targetRow, 1).setValue(entryDate).setNumberFormat('dd-mmm-yyyy');

  // Fill invested amounts: cols 2 to 9 (B to I)
  for (let c = 1; c <= 8; c++) {
    const colName = String(headers[c] || '').trim();
    if (colName && investmentsObj && investmentsObj[colName]) {
      const invVal = investmentsObj[colName].invested;
      if (invVal !== undefined && invVal !== '') {
        sheet.getRange(targetRow, c + 1).setValue(Number(invVal));
      }
    }
  }

  // Copy formula for Col J (Col 10: Total Invested)
  const prevRow = targetRow - 1;
  sheet.getRange(prevRow, 10).copyTo(sheet.getRange(targetRow, 10), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);

  // Fill earnings: cols 11 to 18 (K to R)
  for (let c = 10; c <= 17; c++) {
    const colName = String(headers[c] || '').trim();
    if (colName && investmentsObj && investmentsObj[colName]) {
      const earnVal = investmentsObj[colName].earnings;
      if (earnVal !== undefined && earnVal !== '') {
        sheet.getRange(targetRow, c + 1).setValue(Number(earnVal));
      }
    }
  }

  // Copy formulas for Col S (Col 19: Total Earnings) and Col T (Col 20: Total Value)
  sheet.getRange(prevRow, 19, 1, 2).copyTo(sheet.getRange(targetRow, 19, 1, 2), SpreadsheetApp.CopyPasteType.PASTE_FORMULA, false);

  // Copy formatting across the row
  sheet.getRange(prevRow, 2, 1, 19).copyTo(sheet.getRange(targetRow, 2, 1, 19), SpreadsheetApp.CopyPasteType.PASTE_FORMAT, false);

  SpreadsheetApp.flush();
  return { success: true, row: targetRow, date: dateStr };
}

// Helpers
function parseNum(val) {
  if (val === null || val === undefined || val === '' || val === '-') return 0;
  if (typeof val === 'number') return val;
  const cleaned = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function formatDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd-MMM-yyyy');
  }
  return String(val);
}

function parseInputDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr.includes('-') && dateStr.length === 10 && dateStr.indexOf('-') === 4) {
    // YYYY-MM-DD from HTML date input
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }
  return new Date(dateStr);
}
