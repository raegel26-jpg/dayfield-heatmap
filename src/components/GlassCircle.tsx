import { useEffect, useState } from 'react';

type GlassCircleProps = {
  value: number;
  label: string;
  visible: boolean;
  spinning: boolean;
  spinKey: number;
  revealed: boolean;
};

export default function GlassCircle({ value, label, visible, spinning, spinKey, revealed }: GlassCircleProps) {
  const [displayValue, setDisplayValue] = useState<string>('?');

  // Swap display value mid-spin or on reveal
  useEffect(() => {
    if (!revealed) {
      setDisplayValue('?');
      return;
    }
    // Revealed: show accuracy — if spinning, swap at midpoint
    if (spinning) {
      const t = setTimeout(() => setDisplayValue(`${value}%`), 600);
      return () => clearTimeout(t);
    }
    setDisplayValue(`${value}%`);
  }, [revealed, value, spinning]);

  return (
    <div
      className="flex flex-col items-center gap-2"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.85)',
        transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1), transform 700ms cubic-bezier(0.4, 0, 0.2, 1)',
        perspective: '600px',
      }}
    >
      <div
        key={spinKey}
        className="relative w-[48px] h-[48px] sm:w-[72px] sm:h-[72px] rounded-full flex items-center justify-center"
        style={{
          transformStyle: 'preserve-3d',
          animation: spinning ? 'coin-spin 1800ms cubic-bezier(0.2, 0, 0.2, 1) forwards' : 'none',
        }}
      >
        {/* Liquid glass shadow */}
        <div className="absolute inset-0 z-0 rounded-full
          shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)]
          dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]"
        />
        {/* Liquid glass backdrop */}
        <div
          className="absolute inset-0 isolate -z-10 rounded-full overflow-hidden"
          style={{ backdropFilter: 'url("#container-glass")' }}
        />

        {/* Specular highlight */}
        <div
          className="absolute inset-0 z-20 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
            animation: spinning ? 'coin-highlight 1800ms cubic-bezier(0.2, 0, 0.2, 1) forwards' : 'none',
            opacity: 0,
          }}
        />

        {/* Edge shadow */}
        <div
          className="absolute inset-0 z-20 rounded-full pointer-events-none"
          style={{
            boxShadow: 'inset 3px 0 6px rgba(255,255,255,0.15), inset -3px 0 6px rgba(0,0,0,0.4)',
            animation: spinning ? 'coin-edge 1800ms cubic-bezier(0.2, 0, 0.2, 1) forwards' : 'none',
            opacity: 0,
          }}
        />

        {/* Value */}
        <span
          className="relative z-10 font-semibold pointer-events-none"
          style={{
            fontSize: revealed ? '12px' : '18px',
            color: revealed ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
            transition: 'color 400ms cubic-bezier(0.4, 0, 0.2, 1), font-size 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {displayValue}
        </span>
      </div>
      {label && (
        <span className="text-[10px] text-white/30 uppercase tracking-wider">
          {label}
        </span>
      )}
    </div>
  );
}
