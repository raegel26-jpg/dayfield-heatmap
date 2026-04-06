import { useMemo, useEffect, useRef, useState, type RefObject } from 'react';
import MonthCluster from './MonthCluster';
import { useSession } from '../context/SessionContext';
import { MONTH_ORDER, VIBE_CONFIGS } from '../types';
import type { MonthKey, Dataset } from '../types';
import type { ShaderRef } from './ui/web-gl-shader';

type HeatmapFieldProps = {
  dataset: Dataset;
  revealed: boolean;
  onGuess: (month: MonthKey) => void;
  shaderRef?: RefObject<ShaderRef | null>;
};

export default function HeatmapField({
  dataset,
  revealed,
  onGuess,
  shaderRef,
}: HeatmapFieldProps) {
  const { vibe } = useSession();
  const vibeConfig = VIBE_CONFIGS[vibe ?? 'rgb'];
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 639px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const globalRange = useMemo(() => {
    const allValues = MONTH_ORDER.flatMap((m) => dataset[m]);
    return { min: Math.min(...allValues), max: Math.max(...allValues) };
  }, [dataset]);

  // Beam reactivity: compute beam proximity + color per dot
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !shaderRef?.current) return;

    type DotEntry = { el: HTMLElement; px: number; py: number; d: number };
    let dotCache: DotEntry[] = [];
    let animId: number;
    let cacheValid = false;

    const cacheDotPositions = () => {
      const dots = container.querySelectorAll('.day-dot') as NodeListOf<HTMLElement>;
      if (dots.length === 0) { cacheValid = false; return; }

      const w = window.innerWidth;
      const h = window.innerHeight;
      const minRes = Math.min(w, h);

      dotCache = Array.from(dots).map(dot => {
        const rect = dot.getBoundingClientRect();
        const screenX = rect.left + rect.width / 2;
        const screenY = rect.top + rect.height / 2;
        const px = (screenX * 2 - w) / minRes;
        const py = (h - 2 * screenY + 20) / minRes;
        const d = Math.sqrt(px * px + py * py);
        return { el: dot, px, py, d };
      });
      cacheValid = true;
    };

    const update = () => {
      if (!cacheValid || !shaderRef.current) {
        animId = requestAnimationFrame(update);
        return;
      }

      const { time, xScale, yScale, distortion } = shaderRef.current.getState();

      for (const { el, px, py, d } of dotCache) {
        // Chromatic aberration offsets matching the shader
        const dd = d * distortion;
        const rx = px * (1 + dd);
        const gx = px;
        const bx = px * (1 - dd);

        const rDist = Math.abs(py + Math.sin((rx + time) * xScale) * yScale);
        const gDist = Math.abs(py + Math.sin((gx + time) * xScale) * yScale);
        const bDist = Math.abs(py + Math.sin((bx + time) * xScale) * yScale);

        const minDist = Math.min(rDist, gDist, bDist);
        const glow = Math.max(0, 1 - minDist * 3.5);

        el.style.setProperty('--beam-glow', glow.toFixed(3));

        if (glow > 0.05) {
          const r = Math.round(Math.min(0.07 / rDist, 1) * 255);
          const g = Math.round(Math.min(0.07 / gDist, 1) * 255);
          const b = Math.round(Math.min(0.07 / bDist, 1) * 255);
          const spread = (glow * 14).toFixed(1);
          const alpha = (glow * 0.6).toFixed(2);
          el.style.setProperty('--beam-shadow', `0 0 ${spread}px rgba(${r},${g},${b},${alpha})`);
        } else {
          el.style.setProperty('--beam-shadow', 'none');
        }
      }

      animId = requestAnimationFrame(update);
    };

    const initTimer = setTimeout(() => {
      cacheDotPositions();
      animId = requestAnimationFrame(update);
    }, 80);

    window.addEventListener('resize', cacheDotPositions);

    return () => {
      clearTimeout(initTimer);
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', cacheDotPositions);
    };
  }, [shaderRef, dataset, revealed]);

  return (
    <div ref={containerRef} className="flex flex-row items-start sm:items-stretch sm:flex-col w-fit mx-auto" style={{ gap: 'var(--field-gap)' }}>
      {MONTH_ORDER.map((month, rowIndex) => (
        <MonthCluster
          key={month}
          month={month}
          dailyValues={dataset[month]}
          vibeConfig={vibeConfig}
          revealed={revealed}
          rowIndex={rowIndex}
          disabled={revealed}
          onClick={onGuess}
          globalMin={globalRange.min}
          globalMax={globalRange.max}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}
