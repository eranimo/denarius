export function currencyFormat(currency: ?number): string {
  if (currency === null || typeof currency === 'undefined') {
    return '';
  }
  return currency.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
