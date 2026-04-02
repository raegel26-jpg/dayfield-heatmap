import { useSession } from '../context/SessionContext';
import { GlowCard } from './ui/spotlight-card';
import { LiquidButton } from './ui/liquid-glass-button';
import { startMusic } from './NavButtons';

export default function LandingScreen() {
  const { start } = useSession();

  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
      <GlowCard
        glowColor="white"
        customSize
        className="flex flex-col items-center justify-center gap-8 w-full p-8 sm:p-12 [--bg-spot-opacity:0] min-h-[480px] sm:min-h-0 !w-[280px] sm:!w-[650px]"
        width={650}
      >
        <div className="text-center space-y-4">
          <h1
            className="glass-text text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight pb-2"
            style={{
              backgroundImage: 'radial-gradient(300px 300px at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), rgba(255,255,255,0.7), rgba(255,255,255,0.35) 70%)',
              backgroundAttachment: 'fixed',
            }}
          >
              Dayfield
          </h1>
          <p className="text-lg text-white/50">
            365 days. Every one of them knows something you don't.
          </p>
          <p className="text-base text-white/40 leading-relaxed">
            Five questions. One calendar. Start looking closer.
          </p>
        </div>
        <LiquidButton
          onClick={() => { startMusic(); start(); }}
          size="lg"
          className="text-white rounded-full mx-auto mt-[21px] w-[100px]"
        >
          Start
        </LiquidButton>
      </GlowCard>
    </div>
  );
}
