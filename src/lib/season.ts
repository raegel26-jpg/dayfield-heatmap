import type { MonthKey, Season } from '../types';

const SEASON_MAP: Record<MonthKey, Season> = {
  jan: 'winter', feb: 'winter', mar: 'spring',
  apr: 'spring', may: 'spring', jun: 'summer',
  jul: 'summer', aug: 'summer', sep: 'autumn',
  oct: 'autumn', nov: 'autumn', dec: 'winter',
};

export function getSeason(month: MonthKey): Season {
  return SEASON_MAP[month];
}

export function resolveBranch(
  month: MonthKey,
  correctMonth: MonthKey,
  branches: Record<string, string>,
): string {
  if (month === correctMonth && branches.correct) return branches.correct;
  return branches[SEASON_MAP[month]];
}
