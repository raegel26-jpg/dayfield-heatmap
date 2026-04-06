import { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { LiquidButton } from './ui/liquid-glass-button';
import { GlowCard } from './ui/spotlight-card';

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function MusicOnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function MusicOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

function InverseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" />
    </svg>
  );
}

type ModalType = 'faq' | 'feedback' | null;

function Modal({ type, onClose }: { type: ModalType; onClose: () => void }) {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 cursor-pointer" role="button" tabIndex={-1} onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()} />
      <div className="relative z-10">
        <GlowCard
          glowColor="white"
          customSize
          width={500}
          className="p-6 sm:p-8 [--bg-spot-opacity:0]"
        >
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 w-10 h-10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors text-lg"
            >
              &times;
            </button>

            {type === 'faq' && (
              <div className="space-y-4 text-white/70 text-sm leading-relaxed">
                <h3 className="text-lg font-bold text-white">FAQ</h3>
                <div>
                  <p className="text-white/90 font-medium mb-1">What is Dayfield?</p>
                  <p>Five questions. A field of days. Each one reveals a rhythm you've been living inside without knowing it.</p>
                </div>
                <div>
                  <p className="text-white/90 font-medium mb-1">How does accuracy work?</p>
                  <p>We measure how close your guess is to the actual peak day in the dataset. The closer you are, the higher the score.</p>
                </div>
                <div>
                  <p className="text-white/90 font-medium mb-1">Is there a right answer?</p>
                  <p>Each question has a day where the data peaks. But this isn't a quiz — it's about seeing the patterns you live inside without knowing it.</p>
                </div>
              </div>
            )}

            {type === 'feedback' && (
              <div className="space-y-4 text-white/70 text-sm leading-relaxed">
                <h3 className="text-lg font-bold text-white">Feedback</h3>
                <p>Have thoughts, suggestions, or found something unexpected?</p>
                <p>
                  Reach out on{' '}
                  <a
                    href="https://instagram.com/raegelnotrachel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/90 underline underline-offset-2 hover:text-white transition-colors"
                  >
                    @raegelnotrachel
                  </a>
                </p>
                <p className="text-white/40 text-xs">Your feedback matters more than you think.</p>
              </div>
            )}
          </div>
        </GlowCard>
      </div>
    </div>
  );
}

// Module-level audio singleton — survives component unmount/remount
let globalAudio: HTMLAudioElement | null = null;
let globalPlaying = false;
let globalFadeTimer: number | null = null;
let musicStarted = false;

function getAudio() {
  if (!globalAudio) {
    globalAudio = new Audio('/music.mp3');
    globalAudio.loop = true;
    globalAudio.volume = 0;
  }
  return globalAudio;
}

function fadeInAudio(audio: HTMLAudioElement, target: number, duration: number) {
  const steps = 30;
  const stepTime = duration / steps;
  const increment = target / steps;
  let current = audio.volume;
  const tick = () => {
    current += increment;
    if (current >= target) {
      audio.volume = target;
      return;
    }
    audio.volume = current;
    globalFadeTimer = window.setTimeout(tick, stepTime);
  };
  tick();
}

function fadeOutAudio(audio: HTMLAudioElement, duration: number) {
  const steps = 20;
  const stepTime = duration / steps;
  const startVol = audio.volume;
  const decrement = startVol / steps;
  let current = startVol;
  const tick = () => {
    current -= decrement;
    if (current <= 0) {
      audio.volume = 0;
      audio.pause();
      return;
    }
    audio.volume = current;
    globalFadeTimer = window.setTimeout(tick, stepTime);
  };
  tick();
}

/** Call from a user-initiated click (e.g. Start button) to begin music */
export function startMusic() {
  if (musicStarted) return;
  musicStarted = true;
  const audio = getAudio();
  audio.play().then(() => {
    fadeInAudio(audio, 0.3, 2000);
    globalPlaying = true;
  }).catch(() => {});
}

export default function NavButtons() {
  const { reset, phase } = useSession();
  const [modal, setModal] = useState<ModalType>(null);
  const [, setInverted] = useState(false);
  const [playing, setPlaying] = useState(globalPlaying);

  // Sync local state with global
  useEffect(() => {
    const id = setInterval(() => {
      setPlaying(globalPlaying);
    }, 300);
    return () => clearInterval(id);
  }, []);

  const toggleMusic = () => {
    if (globalFadeTimer) clearTimeout(globalFadeTimer);
    const audio = getAudio();
    if (playing) {
      fadeOutAudio(audio, 500);
      globalPlaying = false;
    } else {
      audio.play().then(() => fadeInAudio(audio, 0.3, 1000)).catch(() => {});
      globalPlaying = true;
    }
    setPlaying(!playing);
  };

  const toggleInverse = () => {
    setInverted((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('inverted', next);
      return next;
    });
  };

  return (
    <>
      {/* Home — top left (hidden on landing) */}
      {phase !== 'landing' && (
        <div className="fixed z-30" style={{ top: 'calc(20px + env(safe-area-inset-top, 0px))', left: '20px' }}>
          <LiquidButton
            size="icon"
            onClick={reset}
            className="text-white/50 rounded-full"
            aria-label="Home"
          >
            <HomeIcon />
          </LiquidButton>
        </div>
      )}

      {/* Utilities — top right */}
      <div className="fixed z-30 flex items-center gap-2" style={{ top: 'calc(20px + env(safe-area-inset-top, 0px))', right: '20px' }}>
        <LiquidButton
          size="icon"
          onClick={toggleMusic}
          className="text-white/50 rounded-full"
          aria-label="Toggle music"
        >
          {playing ? <MusicOnIcon /> : <MusicOffIcon />}
        </LiquidButton>
        <LiquidButton
          size="icon"
          onClick={toggleInverse}
          className="text-white/50 rounded-full"
          aria-label="Toggle inverse mode"
        >
          <InverseIcon />
        </LiquidButton>
        {/* FAQ, Feedback — inline on desktop */}
        <div className="hidden sm:contents">
          <div className="w-2" />
          <LiquidButton
            size="icon"
            onClick={() => setModal('faq')}
            className="text-white/50 rounded-full"
            aria-label="FAQ"
          >
            <QuestionIcon />
          </LiquidButton>
          <LiquidButton
            size="icon"
            onClick={() => setModal('feedback')}
            className="text-white/50 rounded-full"
            aria-label="Feedback"
          >
            <MessageIcon />
          </LiquidButton>
        </div>
      </div>

      {/* FAQ, Feedback — bottom right on mobile only */}
      <div className="sm:hidden fixed z-30 flex items-center gap-2 h-10" style={{ bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))', right: '20px' }}>
        <LiquidButton
          size="icon"
          onClick={() => setModal('faq')}
          className="text-white/60 rounded-full"
          aria-label="FAQ"
        >
          <QuestionIcon />
        </LiquidButton>
        <LiquidButton
          size="icon"
          onClick={() => setModal('feedback')}
          className="text-white/60 rounded-full"
          aria-label="Feedback"
        >
          <MessageIcon />
        </LiquidButton>
      </div>

      <Modal type={modal} onClose={() => setModal(null)} />
    </>
  );
}
