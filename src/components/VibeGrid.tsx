import { LiquidButton } from './ui/liquid-glass-button';
import { VIBE_CONFIGS } from '../types';
import type { Vibe } from '../types';

type VibeGridProps = {
  onSelect: (vibe: Vibe) => void;
};

const vibes: Vibe[] = ['rgb'];

export default function VibeGrid({ onSelect }: VibeGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {vibes.map((v) => {
        const config = VIBE_CONFIGS[v];
        return (
          <LiquidButton
            key={v}
            size="xl"
            onClick={() => onSelect(v)}
            className="text-white border border-white/10 rounded-full h-16"
          >
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-lg">{config.emoji}</span>
              <span className="text-sm">{config.label}</span>
            </div>
          </LiquidButton>
        );
      })}
    </div>
  );
}
