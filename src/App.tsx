import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { SessionProvider, useSession } from './context/SessionContext';
import { WebGLShader, type ShaderRef } from './components/ui/web-gl-shader';
import LandingScreen from './components/LandingScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import NavButtons from './components/NavButtons';
import { VIBE_CONFIGS } from './types';
import { Analytics } from '@vercel/analytics/react';

function AppInner() {
  const { phase, vibe } = useSession();
  const shaderRef = useRef<ShaderRef>(null);
  const shaderRef2 = useRef<ShaderRef>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const prevPhaseRef = useRef(phase);
  const [, setTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<'landing-to-game' | 'game-to-end' | null>(null);

  useEffect(() => {
    if (vibe) {
      shaderRef.current?.updateUniforms(VIBE_CONFIGS[vibe].shaderUniforms);
      shaderRef2.current?.updateUniforms(VIBE_CONFIGS[vibe].shaderUniforms);
    }
  }, [vibe]);

  useLayoutEffect(() => {
    if (prevPhaseRef.current === 'landing' && phase === 'guess') {
      setTransitionType('landing-to-game');
      setTransitioning(true);
      setTimeout(() => { setTransitioning(false); setTransitionType(null); }, 1850);
    } else if ((prevPhaseRef.current === 'guess' || prevPhaseRef.current === 'reveal') && phase === 'end') {
      setTransitionType('game-to-end');
      setTransitioning(true);
      setTimeout(() => { setTransitioning(false); setTransitionType(null); }, 1850);
    }
    prevPhaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el) return;
      el.style.setProperty('--x', e.clientX.toFixed(2));
      el.style.setProperty('--y', e.clientY.toFixed(2));
      el.style.setProperty('--xp', (e.clientX / window.innerWidth).toFixed(2));
      el.style.setProperty('--hue', (e.clientX / window.innerWidth * 360).toFixed(2));
    };
    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  const isGamePhase = phase === 'guess' || phase === 'reveal';
  const shaderMoved = isGamePhase || phase === 'end';

  return (
    <div ref={rootRef} data-shader-pos={shaderMoved ? 'game' : 'landing'}>
      <WebGLShader ref={shaderRef} />
      <div className="fixed inset-0 shader-mirror sm:hidden" style={{ transform: 'rotate(180deg)', mixBlendMode: 'screen' }}>
        <WebGLShader ref={shaderRef2} />
      </div>
      <div className="relative z-10">
        {(phase === 'landing' || transitionType === 'landing-to-game') && (
          <div className={`fixed inset-0 z-10 ${transitionType === 'landing-to-game' ? 'animate-slide-out-left will-change-transform' : ''}`}>
            <LandingScreen />
          </div>
        )}
        {(isGamePhase || transitionType === 'game-to-end') && (
          <div className={`fixed inset-0 ${transitionType === 'landing-to-game' ? 'z-0 animate-slide-in-from-right will-change-transform' : transitionType === 'game-to-end' ? 'z-10 animate-slide-out-left will-change-transform' : 'z-0'}`}>
            <GameScreen shaderRef={shaderRef} />
          </div>
        )}
        {(phase === 'end' || transitionType === 'game-to-end') && (
          <div className={`fixed inset-0 ${transitionType === 'game-to-end' ? 'z-0 animate-slide-in-from-right will-change-transform' : 'z-0'}`}>
            <EndScreen />
          </div>
        )}
        {(phase === 'landing' || isGamePhase || phase === 'end') && <NavButtons />}
      </div>
      <div
        className="fixed left-0 right-0 z-20 flex justify-center pointer-events-none"
        style={{ top: 'calc(21px + env(safe-area-inset-top, 0px))' }}
      >
        <span
          className="glass-text text-xs font-light tracking-widest pointer-events-auto uppercase"
          style={{
            backgroundImage: 'radial-gradient(200px 200px at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), rgba(255,255,255,0.8), rgba(255,255,255,0.25) 70%)',
            backgroundAttachment: 'fixed',
          }}
        >
          Dayfield
        </span>
      </div>
      <div
        className="fixed left-0 right-0 z-20 flex sm:justify-center justify-start pointer-events-none sm:h-auto h-10 items-center sm:items-start"
        style={{ bottom: 'calc(21px + env(safe-area-inset-bottom, 0px))' }}
      >
        <span
          className="glass-text text-xs font-light tracking-widest pointer-events-auto pl-5 sm:pl-0"
          style={{
            backgroundImage: 'radial-gradient(200px 200px at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), rgba(255,255,255,0.8), rgba(255,255,255,0.25) 70%)',
            backgroundAttachment: 'fixed',
          }}
        >
          Built by @raegelnotrachel
        </span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SessionProvider>
      <AppInner />
      <Analytics />
    </SessionProvider>
  );
}
