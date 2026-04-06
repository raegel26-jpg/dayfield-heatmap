import { memo, useMemo } from 'react';
import DayDot from './DayDot';
import { interpolateColor } from '../lib/utils';
import type { MonthKey, VibeConfig } from '../types';
import { MONTH_LABELS } from '../types';

type MonthClusterProps = {
  month: MonthKey;
  dailyValues: number[];
  vibeConfig: VibeConfig;
  revealed: boolean;
  rowIndex: number;
  disabled: boolean;
  onClick: (month: MonthKey) => void;
  globalMin: number;
  globalMax: number;
  isMobile: boolean;
};

const MonthCluster = memo(function MonthCluster({
  month,
  dailyValues,
  vibeConfig,
  revealed,
  rowIndex,
  disabled,
  onClick,
  globalMin,
  globalMax,
  isMobile,
}: MonthClusterProps) {
  const dots = useMemo(() => {
    const range = globalMax - globalMin || 1;

    return dailyValues.map((val, i) => {
      const t = (val - globalMin) / range;
      const color = interpolateColor(vibeConfig.lowColor, vibeConfig.highColor, t);
      // Desktop: left-to-right per row; Mobile: bottom-to-top per column
      // Both use staggered offsets for organic wave
      const rowOffsets = [0, 80, 30, 120, 60, 150, 20, 100, 50, 140, 70, 110];
      const progress = isMobile ? (dailyValues.length - 1 - i) / 31 : i / 31;
      const delay = progress * 1800 + (rowOffsets[rowIndex] ?? 0);
      return { key: i, intensity: t, color, delay };
    });
  }, [dailyValues, vibeConfig, rowIndex, globalMin, globalMax, isMobile]);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onClick(month)}
      className={`
        group relative flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-0.5 sm:py-[2px] px-0.5 sm:px-1 rounded-lg
        transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] cursor-pointer
        ${disabled ? 'pointer-events-none' : ''}
      `}
    >
      {/* Label — below dots on mobile, left of dots on desktop */}
      <span className="order-last sm:order-first text-[8px] sm:text-[9px] tracking-wider uppercase text-white/50 group-hover:text-white/70 transition-colors duration-300 w-auto sm:w-7 text-center sm:text-right shrink-0 leading-tight mt-0.5 sm:mt-0">
        {MONTH_LABELS[month].slice(0, 3)}
      </span>
      <div className="flex flex-col sm:flex-row" style={{ gap: 'var(--dot-gap)' }}>
        {dots.map((dot) => (
          <DayDot
            key={dot.key}
            intensity={dot.intensity}
            color={dot.color}
            revealed={revealed}
            delay={dot.delay}
            idle={!revealed}
          />
        ))}
      </div>
    </button>
  );
});

export default MonthCluster;
