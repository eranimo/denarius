export const DAYS_PER_MONTH = 30;
export const MONTHS_PER_YEAR = 12;
export const DAYS_PER_YEAR = DAYS_PER_MONTH * MONTHS_PER_YEAR;


export interface IDate {
  years: number;
  months: number;
  days: number;
}

export function calculateDate(rounds: number): IDate {
  const years = Math.floor(rounds / DAYS_PER_YEAR);
  const months = Math.floor((rounds % DAYS_PER_YEAR) / MONTHS_PER_YEAR);
  const days = (rounds % DAYS_PER_YEAR) % DAYS_PER_MONTH;

  return { years, months, days };
}
