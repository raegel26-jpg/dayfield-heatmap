import { useEffect, useState } from 'react';
import type { MonthKey } from '../types';
import { MONTH_LABELS } from '../types';

type RevealTextProps = {
  text: string;
  guessedMonth: MonthKey;
  visible: boolean;
};

export default function RevealText({ text, guessedMonth, visible }: RevealTextProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) {
      setShow(false);
      return;
    }
    // Small beat for entrance feel — main timing controlled by parent
    const timer = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(timer);
  }, [visible]);

  const rendered = text.replace(
    /\{guessedMonth\}/g,
    MONTH_LABELS[guessedMonth],
  );

  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        transition: 'opacity 500ms cubic-bezier(0, 0, 0.58, 1)',
      }}
    >
      <div className="text-[10px] sm:text-sm text-white/70 leading-snug sm:leading-relaxed max-w-xl mx-auto flex flex-col gap-1 sm:gap-1.5">
        {rendered.split('\n\n').map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
