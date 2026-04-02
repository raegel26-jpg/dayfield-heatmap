import { memo } from 'react';

type DayDotProps = {
  intensity: number; // 0–1 normalized
  color: string;
  revealed: boolean;
  delay: number;
  idle?: boolean;
};

const DayDot = memo(function DayDot({ intensity, color, revealed, delay }: DayDotProps) {
  const t = intensity;

  const bg = revealed ? color : 'rgba(255,255,255,0.4)';
  const opacity = revealed ? (0.12 + t * 0.88) : 0.06;
  const scale = revealed ? 1 + t * 0.15 : 1;
  const shadow = revealed && t > 0.35
    ? `0 0 ${3 + t * 8}px ${color}, 0 0 ${1 + t * 3}px ${color}`
    : undefined;

  return (
    <div
      className="day-dot rounded-full"
      style={{
        width: 'var(--dot-size)',
        height: 'var(--dot-size)',
        backgroundColor: bg,
        opacity,
        transform: `scale(${scale})`,
        boxShadow: revealed ? shadow : 'var(--beam-shadow, none)',
        filter: !revealed ? 'brightness(calc(1 + var(--beam-glow, 0) * 6))' : undefined,
        transition: revealed
          ? `opacity 200ms ${delay}ms, background-color 200ms ${delay}ms, box-shadow 80ms linear ${delay}ms, transform 200ms ${delay}ms, filter 80ms linear ${delay}ms`
          : 'opacity 80ms, background-color 80ms, box-shadow 40ms, transform 80ms, filter 40ms',
      }}
    />
  );
}, (prev, next) => {
  // Both idle — skip re-render, idle state looks identical regardless of data
  if (!prev.revealed && !next.revealed) return true;
  return prev.intensity === next.intensity && prev.color === next.color &&
         prev.revealed === next.revealed && prev.delay === next.delay;
});

export default DayDot;
