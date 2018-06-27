export function currencyFormat(currency?: number, points: number = 2): string {
  if (currency === null || typeof currency === 'undefined') {
    return '';
  }
  return currency.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    // minimumFractionDigits: points,
    // maximumFractionDigits: points
  });
}

export function numberFormat(value: number): string {
  return value.toLocaleString();
}
