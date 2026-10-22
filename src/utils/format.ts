/**
 * Money and date formatting standards according to Product Guidelines v1.0
 */

// True unicode minus sign (\u2212)
export const MINUS_SIGN = '−';
export const PLUS_SIGN = '+';

export const formatIndianNumber = (num: number, includePaiseIfNonZero = false): string => {
  const isNegative = num < 0;
  const absVal = Math.abs(num);

  let formattedPaise = '';
  let integerPart = Math.floor(absVal);

  if (includePaiseIfNonZero) {
    const paise = Math.round((absVal - integerPart) * 100);
    if (paise > 0) {
      formattedPaise = '.' + String(paise).padStart(2, '0');
    }
  }

  const intStr = integerPart.toString();
  if (intStr.length <= 3) {
    return (isNegative ? MINUS_SIGN : '') + intStr + formattedPaise;
  }

  // Indian digit grouping: last 3 digits, then groups of 2 digits
  const lastThree = intStr.slice(-3);
  const remaining = intStr.slice(0, -3);
  const grouped = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const result = grouped + ',' + lastThree + formattedPaise;

  return (isNegative ? MINUS_SIGN : '') + result;
};

/**
 * Currency formatting rules:
 * - Currency symbol precedes the amount, no space: ₹1,24,500
 * - Indian digit grouping: ₹12,34,56,789
 * - No decimals for balances at or above ₹1,000 on summaries (e.g. ₹48,250)
 * - Show paise only in detail rows / inputs when non-zero (e.g. ₹250.50)
 * - Negative values use a true minus sign: −₹3,150
 * - In privacy mode, returns ₹••••••
 */
export const formatMoney = (
  value: number | undefined | null,
  options?: {
    isPrivate?: boolean;
    showPaiseIfUnder1000?: boolean;
    alwaysIncludePaise?: boolean;
    isChange?: boolean;
  }
): string => {
  if (options?.isPrivate) {
    return '₹••••••';
  }

  if (value === undefined || value === null || isNaN(value)) {
    return '₹0';
  }

  if (value === 0) {
    return '₹0';
  }

  const isNegative = value < 0;
  const abs = Math.abs(value);
  const isChange = Boolean(options?.isChange);

  // Determine whether to show paise
  let showPaise = false;
  if (options?.alwaysIncludePaise) {
    showPaise = true;
  } else if (abs < 1000 || options?.showPaiseIfUnder1000) {
    const hasPaise = Math.round((abs - Math.floor(abs)) * 100) > 0;
    showPaise = hasPaise;
  }

  const formattedNum = formatIndianNumber(abs, showPaise);

  if (isChange) {
    if (isNegative) {
      return `▼ ${MINUS_SIGN}₹${formattedNum}`;
    } else {
      return `▲ ${PLUS_SIGN}₹${formattedNum}`;
    }
  }

  if (isNegative) {
    return `${MINUS_SIGN}₹${formattedNum}`;
  }

  return `₹${formattedNum}`;
};

/**
 * Percentage formatting:
 * Always to one decimal: +8.4%, −2.1%
 */
export const formatPercent = (
  value: number | undefined | null,
  isPrivate?: boolean
): string => {
  if (isPrivate) return '••••%';
  if (value === undefined || value === null || isNaN(value)) return '0.0%';

  const pct = Math.abs(value) > 2 ? value : value * 100;
  const absPct = Math.abs(pct).toFixed(1);

  if (pct > 0) {
    return `+${absPct}%`;
  } else if (pct < 0) {
    return `${MINUS_SIGN}${absPct}%`;
  }
  return `0.0%`;
};

/**
 * Date formatting:
 * Dates use 22 Oct 2026 in lists, and Today, Yesterday for the last two days.
 */
export const formatDateLabel = (dateStr: string): string => {
  if (!dateStr) return '';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let dateObj: Date | null = null;

  if (dateStr.length === 10 && dateStr.includes('-') && dateStr.indexOf('-') === 4) {
    // YYYY-MM-DD
    const parts = dateStr.split('-');
    dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  } else if (dateStr.includes('-')) {
    // DD-MMM-YYYY (e.g. 12-Oct-2026)
    const parts = dateStr.split('-');
    const mIdx = months.findIndex((m) => m.toLowerCase() === parts[1]?.toLowerCase());
    if (mIdx !== -1) {
      dateObj = new Date(parseInt(parts[2]), mIdx, parseInt(parts[0]));
    }
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return dateStr;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const entryDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  const diffDays = Math.round((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Month header for history: e.g. "October 2026"
 */
export const getMonthHeader = (dateStr: string): string => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (dateStr.includes('-') && dateStr.length === 10 && dateStr.indexOf('-') === 4) {
    const parts = dateStr.split('-');
    const mIdx = parseInt(parts[1], 10) - 1;
    return `${months[mIdx]} ${parts[0]}`;
  }

  if (dateStr.includes('-')) {
    const parts = dateStr.split('-');
    const mIdx = shortMonths.findIndex((m) => m.toLowerCase() === parts[1]?.toLowerCase());
    if (mIdx !== -1) {
      return `${months[mIdx]} ${parts[2]}`;
    }
  }

  return 'Past Entries';
};

/**
 * Returns human relative time for last sync:
 * e.g. "just now", "10m ago", "3 hours ago", "Last updated 3 days ago"
 */
export const getRelativeSyncTime = (dateIso?: string): { text: string; isStale: boolean } => {
  if (!dateIso) return { text: 'Not synced yet', isStale: false };
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return { text: 'just now', isStale: false };

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return { text: 'just now', isStale: false };
  if (diffSec < 3600) return { text: `${Math.floor(diffSec / 60)}m ago`, isStale: false };
  if (diffSec < 86400) return { text: `${Math.floor(diffSec / 3600)}h ago`, isStale: false };

  const days = Math.floor(diffSec / 86400);
  return {
    text: `Last updated ${days} day${days > 1 ? 's' : ''} ago`,
    isStale: true, // Data older than 24h shows subtle amber caption
  };
};

export const getTodayDateInputString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
