export const formatINR = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '₹0.00';
  const isNegative = value < 0;
  const absVal = Math.abs(value);

  // Format with standard Indian numbering system (e.g. 1,00,000.00)
  const parts = absVal.toFixed(2).split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  if (integerPart.length > 3) {
    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    integerPart = formattedOthers + ',' + lastThree;
  }

  return `${isNegative ? '-' : ''}₹${integerPart}.${decimalPart}`;
};

export const formatPercent = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) return '0.0%';
  // Check if value is already a percentage (e.g. 153.7) or decimal (1.537)
  const pct = Math.abs(value) > 2 ? value : value * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
};

export const getTodayDateInputString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateDisplay = (dateStr: string): string => {
  if (!dateStr) return '';
  // If in YYYY-MM-DD
  if (dateStr.length === 10 && dateStr.includes('-')) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = dateStr.split('-');
    const mIdx = parseInt(parts[1], 10) - 1;
    return `${parts[2]}-${months[mIdx] || parts[1]}-${parts[0]}`;
  }
  return dateStr;
};
