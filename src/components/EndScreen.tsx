import { useRef, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import EndHeatmapCard from './EndHeatmapCard';
import { GlowCard } from './ui/spotlight-card';
import { LiquidButton } from './ui/liquid-glass-button';
import type { MonthKey } from '../types';

export default function EndScreen() {
  const { guessHistory, vibe, reset } = useSession();
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const setGlow = (x: number, y: number) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty('--gx', `${x - rect.left}px`);
      el.style.setProperty('--gy', `${y - rect.top}px`);
    };

    const onMove = (e: PointerEvent) => setGlow(e.clientX, e.clientY);
    window.addEventListener('pointermove', onMove);

    // Gyroscope fallback for mobile
    const onOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0;
      const beta = e.beta ?? 0;
      const x = Math.max(0, Math.min(window.innerWidth, ((gamma + 30) / 60) * window.innerWidth));
      const y = Math.max(0, Math.min(window.innerHeight, ((Math.min(Math.max(beta, 40), 100) - 40) / 60) * window.innerHeight));
      setGlow(x, y);
    };
    window.addEventListener('deviceorientation', onOrientation);

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, []);

  const monthClickMap = guessHistory.reduce(
    (acc, record) => {
      acc[record.guessedMonth] = (acc[record.guessedMonth] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const sorted = Object.entries(monthClickMap).sort(([, a], [, b]) => b - a);
  const dominantMonth = (sorted[0]?.[0] ?? 'jan') as MonthKey;

  if (!vibe || guessHistory.length === 0) return null;

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12 gap-8">
      <h2
        ref={titleRef}
        className="text-2xl sm:text-4xl font-bold text-white relative"
        style={{
          backgroundImage: `radial-gradient(circle 120px at var(--gx, 50%) var(--gy, 50%), rgba(255,255,255,1), rgba(255,255,255,0.85) 40%, rgba(255,255,255,0.6) 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        My Personalised Dayfield
      </h2>

      <GlowCard
        glowColor="white"
        customSize
        width={496}
        height="auto"
        className="[--border:0] [--bg-spot-opacity:0] [--backdrop:transparent] !p-0 !backdrop-blur-none [&>div:first-child]:!backdrop-blur-none !w-[340px] sm:!w-[496px]"
      >
        <EndHeatmapCard
          guessHistory={guessHistory}
          vibe={vibe}
          dominantMonth={dominantMonth}
        />
      </GlowCard>

      <LiquidButton
        size="xl"
        onClick={reset}
        className="text-white/70 border border-white/10 rounded-full"
      >
        Play Again
      </LiquidButton>
    </div>
  );
}
