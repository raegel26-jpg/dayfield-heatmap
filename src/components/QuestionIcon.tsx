import { useEffect, useState, type ReactNode } from 'react';
import {
  Baby,
  Heart,
  Thermometer,
  ThermometerSun,
  CloudLightning,
  Flower2,
  Skull,
  Bird,
  Fish,
  Gem,
  ShoppingCart,
  HeartCrack,
  Sun,
} from 'lucide-react';

const QUESTION_ICONS: Record<string, ReactNode> = {
  q1_births: <Baby size={24} />,
  q2_conceptions: <Heart size={24} />,
  q2_heat: <ThermometerSun size={24} />,
  q2_illness: <Thermometer size={24} />,
  q2_disasters: <CloudLightning size={24} />,
  q2_bloom: <Flower2 size={24} />,
  q3_deaths: <Skull size={24} />,
  q3_migration: <Bird size={24} />,
  q3_sharks: <Fish size={24} />,
  q3_proposals: <Gem size={24} />,
  q4_shopping: <ShoppingCart size={24} />,
  q4_divorces: <HeartCrack size={24} />,
  q5_daylight: <Sun size={24} />,
};

const FALLBACK = <Sun size={24} />;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes coin-spin {
      0%   { transform: rotateY(0deg); }
      100% { transform: rotateY(3600deg); }
    }
    @keyframes coin-highlight {
      0%   { opacity: 0; }
      5%   { opacity: 0.3; }
      10%  { opacity: 0; }
      15%  { opacity: 0.3; }
      20%  { opacity: 0; }
      25%  { opacity: 0.28; }
      30%  { opacity: 0; }
      35%  { opacity: 0.25; }
      40%  { opacity: 0; }
      45%  { opacity: 0.22; }
      50%  { opacity: 0; }
      55%  { opacity: 0.18; }
      60%  { opacity: 0; }
      65%  { opacity: 0.14; }
      70%  { opacity: 0; }
      75%  { opacity: 0.1; }
      80%  { opacity: 0; }
      85%  { opacity: 0.06; }
      90%  { opacity: 0; }
      95%  { opacity: 0.03; }
      100% { opacity: 0; }
    }
    @keyframes coin-edge {
      0%   { opacity: 0; }
      5%   { opacity: 1; }
      10%  { opacity: 0; }
      15%  { opacity: 1; }
      20%  { opacity: 0; }
      25%  { opacity: 0.9; }
      30%  { opacity: 0; }
      35%  { opacity: 0.8; }
      40%  { opacity: 0; }
      45%  { opacity: 0.7; }
      50%  { opacity: 0; }
      55%  { opacity: 0.55; }
      60%  { opacity: 0; }
      65%  { opacity: 0.4; }
      70%  { opacity: 0; }
      75%  { opacity: 0.3; }
      80%  { opacity: 0; }
      85%  { opacity: 0.2; }
      90%  { opacity: 0; }
      95%  { opacity: 0.1; }
      100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}

type QuestionIconProps = {
  questionId: string;
  questionIndex: number;
};

export default function QuestionIcon({ questionId, questionIndex }: QuestionIconProps) {
  const [spinning, setSpinning] = useState(false);
  const [displayedIcon, setDisplayedIcon] = useState<ReactNode>(QUESTION_ICONS[questionId] ?? FALLBACK);
  const [visible, setVisible] = useState(false);
  const [spinKey, setSpinKey] = useState(0);

  useEffect(() => { injectStyles(); }, []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (questionIndex === 0) {
      setDisplayedIcon(QUESTION_ICONS[questionId] ?? FALLBACK);
      return;
    }

    setSpinning(true);
    setSpinKey((k) => k + 1);
    const swapTimer = setTimeout(() => {
      setDisplayedIcon(QUESTION_ICONS[questionId] ?? FALLBACK);
    }, 600);
    const endTimer = setTimeout(() => {
      setSpinning(false);
    }, 1800);

    return () => {
      clearTimeout(swapTimer);
      clearTimeout(endTimer);
    };
  }, [questionId, questionIndex]);

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
      {/* Entire circle spins as one unit */}
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

        {/* Specular highlight — pulses each time the face catches light */}
        <div
          className="absolute inset-0 z-20 rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)',
            animation: spinning ? 'coin-highlight 1800ms cubic-bezier(0.2, 0, 0.2, 1) forwards' : 'none',
            opacity: 0,
          }}
        />

        {/* Edge shadow — visible when coin is edge-on */}
        <div
          className="absolute inset-0 z-20 rounded-full pointer-events-none"
          style={{
            boxShadow: 'inset 3px 0 6px rgba(255,255,255,0.15), inset -3px 0 6px rgba(0,0,0,0.4)',
            animation: spinning ? 'coin-edge 1800ms cubic-bezier(0.2, 0, 0.2, 1) forwards' : 'none',
            opacity: 0,
          }}
        />

        {/* Icon */}
        <div className="relative z-10 text-white/60 pointer-events-none select-none flex items-center justify-center">
          {displayedIcon}
        </div>
      </div>
    </div>
  );
}
