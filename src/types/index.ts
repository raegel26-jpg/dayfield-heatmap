export type Vibe = 'rgb';

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

export type MonthKey =
  | 'jan' | 'feb' | 'mar' | 'apr' | 'may' | 'jun'
  | 'jul' | 'aug' | 'sep' | 'oct' | 'nov' | 'dec';

export type Phase = 'landing' | 'guess' | 'reveal' | 'end';

export type GuessRecord = {
  questionId: string;
  guessedMonth: MonthKey;
  correctMonth: MonthKey;
  wasCorrect: boolean;
  accuracy: number;
};

export type Dataset = Record<MonthKey, number[]>;

export type Question = {
  id: string;
  isEntry?: boolean;
  isFinal?: boolean;
  text: string;
  narrative: string;
  dataset: Dataset;
  correctMonth: MonthKey;
  revealCorrect: string;
  revealWrong: string;
  source: string;
  branches?: Record<string, string>;
};

export type QuestionsData = {
  questions: Question[];
};

export type VibeConfig = {
  label: string;
  emoji: string;
  lowColor: string;
  highColor: string;
  shaderUniforms: { xScale: number; yScale: number; distortion: number };
};

export const MONTH_DAYS: Record<MonthKey, number> = {
  jan: 31, feb: 28, mar: 31, apr: 30, may: 31, jun: 30,
  jul: 31, aug: 31, sep: 30, oct: 31, nov: 30, dec: 31,
};

export const MONTH_LABELS: Record<MonthKey, string> = {
  jan: 'January', feb: 'February', mar: 'March', apr: 'April',
  may: 'May', jun: 'June', jul: 'July', aug: 'August',
  sep: 'September', oct: 'October', nov: 'November', dec: 'December',
};

export const MONTH_ORDER: MonthKey[] = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
];

export const VIBE_CONFIGS: Record<Vibe, VibeConfig> = {
  rgb: {
    label: 'RGB',
    emoji: '🌈',
    lowColor: '#1a1a2e',
    highColor: '#ffffff',
    shaderUniforms: { xScale: 1.0, yScale: 0.35, distortion: 0.03 },
  },
};
