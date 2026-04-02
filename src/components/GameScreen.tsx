import { useState, useEffect, type RefObject } from 'react';
import { useSession } from '../context/SessionContext';
import HeatmapField from './HeatmapField';
import RevealText from './RevealText';
import GlassCircle from './GlassCircle';
import QuestionIcon from './QuestionIcon';
import { GlowCard } from './ui/spotlight-card';
import { LiquidButton } from './ui/liquid-glass-button';
import type { ShaderRef } from './ui/web-gl-shader';

type GameScreenProps = {
  shaderRef: RefObject<ShaderRef | null>;
};

export default function GameScreen({ shaderRef }: GameScreenProps) {
  const { vibe, currentQuestion, questionIndex, phase, guessHistory, guess, advance } = useSession();
  const [narrativeVisible, setNarrativeVisible] = useState(false);
  const [questionVisible, setQuestionVisible] = useState(false);
  const [dotsFinished, setDotsFinished] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [showInverseHint, setShowInverseHint] = useState(false);
  const [inverseHintShown, setInverseHintShown] = useState(false);
  const [circleSpinning, setCircleSpinning] = useState(false);
  const [circleSpinKey, setCircleSpinKey] = useState(0);

  const isReveal = phase === 'reveal';
  const lastGuess = guessHistory[guessHistory.length - 1] ?? null;

  // Exit animation → pause → advance → entrance
  const handleAdvance = () => {
    if (exiting) return;
    // Final question: skip internal exit, let the swipe transition handle it
    if (currentQuestion?.isFinal) {
      advance();
      return;
    }
    setExiting(true);
    setTimeout(() => {
      // Reset all visibility before advancing so nothing flashes
      setShowReveal(false);
      setNarrativeVisible(false);
      setQuestionVisible(false);
      setButtonVisible(false);
      setDotsFinished(false);
      setExiting(false);
      advance();
    }, 550); // 300ms fade out + 250ms pause
  };

  // Staggered entrance for narrative → question
  useEffect(() => {
    setNarrativeVisible(false);
    setQuestionVisible(false);
    setDotsFinished(false);
    setShowReveal(false);
    setButtonVisible(false);
    const t1 = setTimeout(() => setNarrativeVisible(true), 300);
    const t2 = setTimeout(() => setQuestionVisible(true), 300);
    // Coin spin both circles on question change (not first question)
    let t5: ReturnType<typeof setTimeout> | undefined;
    if (questionIndex > 0) {
      setCircleSpinning(true);
      setCircleSpinKey((k) => k + 1);
      t5 = setTimeout(() => setCircleSpinning(false), 1800);
    }
    // Show inverse hint from question 2, dismiss at question 4
    let t3: ReturnType<typeof setTimeout> | undefined;
    if (questionIndex === 2 && !inverseHintShown) {
      t3 = setTimeout(() => setShowInverseHint(true), 800);
    } else if (questionIndex === 4 && showInverseHint) {
      setShowInverseHint(false);
      setInverseHintShown(true);
    }
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t5); };
  }, [questionIndex]);

  // Dismiss inverse hint if user toggles inverse mode
  useEffect(() => {
    if (!showInverseHint) return;
    const observer = new MutationObserver(() => {
      if (document.documentElement.classList.contains('inverted')) {
        setShowInverseHint(false);
        setInverseHintShown(true);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [showInverseHint]);

  // Reveal sequence: dots finish → narrative fades → pause → collapse + reveal → button
  useEffect(() => {
    if (!isReveal) {
      setDotsFinished(false);
      setShowReveal(false);
      setButtonVisible(false);
      return;
    }
    // Beat 1: dots finish filling, narrative begins fading out
    const t1 = setTimeout(() => setDotsFinished(true), 2200);
    // Beat 2: narrative fully gone, now collapse + shift question + show reveal text
    const t2 = setTimeout(() => setShowReveal(true), 2800);
    // Beat 3: button appears after reveal text has settled
    const t3 = setTimeout(() => setButtonVisible(true), 3400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isReveal]);

  if (!currentQuestion || !vibe) return null;

  const revealText = lastGuess
    ? lastGuess.wasCorrect
      ? currentQuestion.revealCorrect
      : currentQuestion.revealWrong
    : '';

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-2 sm:px-4">
      <GlowCard
        glowColor="white"
        customSize
        width={1000}
        className="[--bg-spot-opacity:0] [--backdrop:transparent] !backdrop-blur-none [&>div:first-child]:!backdrop-blur-none !w-[340px] !h-[680px] sm:!w-[1000px] sm:!h-[580px]"
      >
        <div className="relative w-full h-full">
          {/* Question icon — bottom left */}
          <div className="absolute bottom-[25px] left-5 sm:bottom-auto sm:top-10 sm:left-10 z-20">
            <QuestionIcon
              questionId={currentQuestion.id}
              questionIndex={questionIndex}
            />
          </div>

          {/* Closeness circle — bottom right */}
          <div className="absolute bottom-[2px] right-3 sm:bottom-auto sm:top-10 sm:right-10 z-20">
            <GlassCircle
              value={lastGuess?.accuracy ?? 0}
              label="Accuracy"
              visible={questionIndex > 0 || isReveal}
              spinning={circleSpinning}
              spinKey={circleSpinKey}
              revealed={isReveal}
            />
          </div>

          {/* Text zone */}
          <div
            className="absolute left-0 right-0 flex flex-col items-center z-10 sm:h-[140px] -top-[5px] sm:top-[7px]"
          >
            {/* Narrative — fades out on reveal, collapses to make room */}
            <div
              className="max-w-[608px] px-4 text-center"
              style={{
                opacity: exiting ? 0 : dotsFinished ? 0 : narrativeVisible ? 1 : 0,
                display: 'grid',
                gridTemplateRows: showReveal ? '0fr' : '1fr',
                marginTop: showReveal ? 0 : 20,
                transition: [
                  'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  ...(showReveal && narrativeVisible
                    ? ['grid-template-rows 400ms cubic-bezier(0.4, 0, 0.2, 1)', 'margin 400ms cubic-bezier(0.4, 0, 0.2, 1)']
                    : []),
                ].join(', '),
              }}
            >
              <p className="text-[10px] sm:text-sm text-white/60 leading-snug sm:leading-relaxed whitespace-pre-line overflow-hidden min-h-0">
                {currentQuestion.narrative}
              </p>
            </div>

            {/* Question — moves up on reveal as narrative collapses */}
            <h2
              className="text-sm sm:text-base font-semibold text-white leading-normal text-center max-w-[608px] px-2"
              style={{
                marginTop: showReveal ? 24 : 12,
                opacity: exiting ? 0 : questionVisible ? 1 : 0,
                transition: [
                  'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                  ...(showReveal && questionVisible
                    ? ['margin 400ms cubic-bezier(0.4, 0, 0.2, 1)']
                    : []),
                ].join(', '),
              }}
            >
              {currentQuestion.text}
            </h2>

            {/* Reveal text — fades in below question after dots finish */}
            <div
              className="flex items-center justify-center text-center max-w-[240px] sm:max-w-[608px] mt-2"
              style={{
                opacity: exiting ? 0 : showReveal ? 1 : 0,
                transition: 'opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <RevealText
                text={revealText}
                guessedMonth={lastGuess?.guessedMonth ?? 'jan'}
                visible={showReveal}
              />
            </div>
          </div>

          {/* Heatmap — anchored below text zone, never moves */}
          <div
            className="absolute left-0 right-0 flex items-start justify-center top-[135px] sm:top-[150px] bottom-[60px]"
          >
            <HeatmapField
              dataset={currentQuestion.dataset}
              revealed={isReveal}
              onGuess={guess}
              shaderRef={shaderRef}
            />
          </div>

          {/* Next button — anchored at bottom */}
          <div
            className="absolute left-10 right-10 flex justify-center bottom-[25px] sm:bottom-5"
            style={{
              opacity: exiting ? 0 : buttonVisible ? 1 : 0,
              transform: exiting ? 'translateY(-12px)' : buttonVisible ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 500ms cubic-bezier(0, 0, 0.58, 1), transform 500ms cubic-bezier(0, 0, 0.58, 1)',
              pointerEvents: buttonVisible ? 'auto' : 'none',
            }}
          >
            <LiquidButton
              onClick={handleAdvance}
              size="lg"
              className="text-white rounded-full w-[100px]"
            >
              Next
            </LiquidButton>
          </div>
        </div>
      </GlowCard>

      {/* Inverse mode hint toast — aligned under the inverse button (hidden on mobile) */}
      <div
        className="hidden sm:block fixed top-16 z-40 pointer-events-none"
        style={{
          right: 'calc(20px + 40px + 8px + 40px + 8px + 2px)',
          opacity: showInverseHint ? 1 : 0,
          transform: showInverseHint ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), transform 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="relative bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-xs text-white/70 border border-white/10 whitespace-nowrap overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.08) 55%, transparent 65%)',
              backgroundSize: '300% 100%',
              animation: showInverseHint ? 'glimmer-loop 4s cubic-bezier(0.4, 0, 0.2, 1) 0.5s infinite' : 'none',
            }}
          />
          <span className="relative z-10">Try inverse colour mode &uarr;</span>
        </div>
      </div>
    </div>
  );
}
