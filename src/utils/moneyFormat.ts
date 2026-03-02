// utils/moneyFormat.ts

/**
 * Formats a number as currency using Intl.NumberFormat
 * @param value - The numeric value to format
 * @param currency - The currency code (e.g. 'NGN', 'USD')
 * @param locale - The locale string (e.g. 'en-US', 'en-NG')
 * @returns Formatted currency string
 */
export function formatMoney(value: number, currency: string = 'USD', locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
