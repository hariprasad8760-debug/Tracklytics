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
 * Formats a number into a localized currency string.
 * @param {number} amount - The numerical value to format.
 * @param {string} currency - Currency symbol or ISO code (default: 'USD').
 * @returns {string} Formatted currency string.
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
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
