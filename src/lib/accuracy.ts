import type { Dataset, MonthKey } from '../types';
import { MONTH_ORDER, MONTH_DAYS } from '../types';

/**
 * Calculates how close a guessed month is to the peak day in the dataset.
 * Uses circular day-of-year distance from the guessed month's nearest edge
 * to the single highest-value day across all 365 days.
 *
 * Returns an integer percentage: 100 = peak day is in guessed month, 0 = opposite side of year.
 */
export function calculateAccuracy(dataset: Dataset, guessedMonth: MonthKey): number {
  const totalDays = 365;

  // Find the peak day-of-year (0-indexed)
  let peakDay = 0;
  let peakValue = -Infinity;
  let dayCounter = 0;

  for (const month of MONTH_ORDER) {
    const days = dataset[month];
    for (let i = 0; i < days.length; i++) {
      if (days[i] > peakValue) {
        peakValue = days[i];
        peakDay = dayCounter + i;
      }
    }
    dayCounter += days.length;
  }

  // Find the day range of the guessed month (0-indexed)
  let guessStart = 0;
  for (const month of MONTH_ORDER) {
    if (month === guessedMonth) break;
    guessStart += MONTH_DAYS[month];
  }
  const guessEnd = guessStart + MONTH_DAYS[guessedMonth] - 1;

  // If peak day is within guessed month, accuracy is 100%
  if (peakDay >= guessStart && peakDay <= guessEnd) {
    return 100;
  }

  // Minimum circular distance from guessed month edges to peak day
  const d1 = Math.abs(peakDay - guessStart);
  const d2 = Math.abs(peakDay - guessEnd);
  const linearDist = Math.min(d1, d2);
  const circularDist = totalDays - linearDist;
  const distance = Math.min(linearDist, circularDist);

  const maxDistance = Math.floor(totalDays / 2); // 182
  return Math.max(0, Math.round((1 - distance / maxDistance) * 100));
}
