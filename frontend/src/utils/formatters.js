/**
 * ============================================================================
 * FILE: src/utils/formatters.js
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Formatting raw numbers into currency strings (e.g. 4520 -> "$4,520.00") or 
 *   dates is a repetitive task. Placing formatting logic in a shared utility file 
 *   ensures consistent formatting across the entire app and makes localization easy.
 *
 * WHAT THIS FILE DOES:
 *   1. `formatCurrency(amount, currencyCode)` - Formats numbers to localized currency.
 *   2. `formatPercent(value)` - Formats decimals into percentage strings.
 *   3. `formatHours(hours)` - Formats raw hours into human readable "X hrs Y mins".
 *
 * FOLDER RESPONSIBILITY (src/utils/):
 *   Houses pure stateless helper functions and formatting algorithms.
 * ============================================================================
 */

/**
 * Map of standard currency symbols
 */
export const CURRENCY_SYMBOLS = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'AU$',
  AED: 'AED ',
  SGD: 'SG$',
  CNY: '¥',
};

/**
 * Formats a number into a localized currency string. Defaults to Indian Rupee (₹ / INR).
 * @param {number} amount - The numerical value to format.
 * @param {string} currency - Currency symbol or ISO code (default: 'INR').
 * @param {string} [locale] - Optional locale (e.g. 'en-IN', 'en-US').
 * @returns {string} Formatted currency string (e.g. "₹4,520.00").
 */
export const formatCurrency = (amount, currency = 'INR', locale) => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  const code = (currency || 'INR').toUpperCase();
  const symbol = CURRENCY_SYMBOLS[code] || (code.length <= 3 ? code + ' ' : '₹');

  if (isNaN(num)) {
    return `${symbol}0.00`;
  }

  const loc = locale || (code === 'INR' ? 'en-IN' : code === 'EUR' ? 'de-DE' : code === 'GBP' ? 'en-GB' : code === 'JPY' ? 'ja-JP' : 'en-US');

  try {
    return new Intl.NumberFormat(loc, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${symbol}${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
};

/**
 * Formats a number to a percentage string with a leading '+' sign for positive values.
 * @param {number} value - Percentage value (e.g., 12.4).
 * @returns {string} Formatted string like "+12.4%".
 */
export const formatPercent = (value) => {
  if (value === undefined || value === null) return '0%';
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value}%`;
};

/**
 * Converts decimal study hours into a readable "Xh Ym" string.
 * @param {number} decimalHours - Hours in decimal (e.g. 2.5 -> "2h 30m").
 * @returns {string} Formatted duration.
 */
export const formatHours = (decimalHours) => {
  if (!decimalHours) return '0h';
  const hrs = Math.floor(decimalHours);
  const mins = Math.round((decimalHours - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
};
