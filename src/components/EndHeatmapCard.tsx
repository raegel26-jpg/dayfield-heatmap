import { forwardRef, useMemo } from 'react';
import type { GuessRecord, MonthKey, Dataset } from '../types';
import { MONTH_ORDER, MONTH_LABELS, MONTH_DAYS, VIBE_CONFIGS } from '../types';
import type { Vibe } from '../types';
import { interpolateColor } from '../lib/utils';
import questionsData from '../data/questions.json';
import type { Question } from '../types';

const questions = questionsData.questions as Question[];

function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

type EndHeatmapCardProps = {
  guessHistory: GuessRecord[];
  vibe: Vibe;
  dominantMonth: MonthKey;
};

const EndHeatmapCard = forwardRef<HTMLDivElement, EndHeatmapCardProps>(
  function EndHeatmapCard({ guessHistory, vibe, dominantMonth }, ref) {
    const config = VIBE_CONFIGS[vibe];

    // Sum all 5 question datasets into one cumulative dataset
    const { cumulativeDataset, globalMin, globalMax } = useMemo(() => {
      const cumulative: Dataset = {} as Dataset;
      for (const month of MONTH_ORDER) {
        cumulative[month] = new Array(MONTH_DAYS[month]).fill(0);
      }

      for (const record of guessHistory) {
        const question = getQuestionById(record.questionId);
        if (!question) continue;
        for (const month of MONTH_ORDER) {
          const qData = question.dataset[month];
          for (let i = 0; i < cumulative[month].length; i++) {
            cumulative[month][i] += qData[i] ?? 0;
          }
        }
      }

      const allValues = MONTH_ORDER.flatMap((m) => cumulative[m]);
      return {
        cumulativeDataset: cumulative,
        globalMin: Math.min(...allValues),
        globalMax: Math.max(...allValues),
      };
    }, [guessHistory]);

    const range = globalMax - globalMin || 1;

    return (
      <div
        ref={ref}
        className="w-full max-w-[480px] rounded-2xl py-8 px-4 sm:p-8 flex flex-col gap-6 sm:gap-6 relative overflow-hidden"
        style={{
          fontFamily: 'Figtree, system-ui, sans-serif',
        }}
      >
        {/* Glimmer sweep */}
        <div
          className="absolute inset-0 z-30 pointer-events-none rounded-2xl"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.12) 55%, transparent 60%)',
            backgroundSize: '200% 100%',
            animation: 'glimmer-sweep 1.8s cubic-bezier(0.4, 0, 0.2, 1) 0.6s forwards',
            opacity: 0,
          }}
        />
        <div className="text-center space-y-1">
          <p className="text-xs sm:text-sm text-white/45 leading-relaxed">
            365 days. You've only seen five of their secrets.
          </p>
          <p className="text-xs sm:text-sm text-white/30 leading-relaxed">
            Every day carries a story. Look a little closer.
          </p>
        </div>

        <div className="flex flex-col gap-[1px] w-fit mx-auto">
          {MONTH_ORDER.map((month) => {
            const dailyValues = cumulativeDataset[month];
            return (
              <div key={month} className="flex items-center gap-1 sm:gap-2">
                <span className="text-[9px] sm:text-[8px] tracking-wider uppercase text-white/30 w-5 sm:w-6 text-right shrink-0">
                  {MONTH_LABELS[month].slice(0, 3)}
                </span>
                <div className="flex gap-[1px] sm:gap-[1.5px]">
                  {dailyValues.map((val, i) => {
                    const t = (val - globalMin) / range;
                    const color = interpolateColor(config.lowColor, config.highColor, t);
                    const dotOpacity = 0.08 + t * 0.92;

                    let boxShadow = 'none';
                    if (t > 0.75) {
                      boxShadow = `0 0 3px 0.5px ${config.highColor}50`;
                    } else if (t > 0.5) {
                      boxShadow = `0 0 2px 0.5px ${config.highColor}30`;
                    }

                    return (
                      <div
                        key={i}
                        className="relative w-[7px] h-[7px] sm:w-[8px] sm:h-[8px]"
                      >
                        {/* Glow layer — full opacity */}
                        {boxShadow !== 'none' && (
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{ boxShadow }}
                          />
                        )}
                        {/* Dot */}
                        <div
                          className="w-full h-full rounded-full"
                          style={{ backgroundColor: color, opacity: dotOpacity }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Per-question accuracy */}
        <div className="flex flex-col gap-2 sm:gap-2 items-center">
          {guessHistory.map((record, i) => {
            const question = getQuestionById(record.questionId);
            return (
              <div key={record.questionId} className="flex justify-between items-center w-full max-w-[420px] px-4 sm:px-10">
                <span className="text-[8px] sm:text-[9px] text-white/30 shrink-1 min-w-0">
                  {i + 1}. {question?.text ?? ''}
                </span>
                <span className="text-[8px] sm:text-[9px] text-white/25 shrink-0 ml-1 sm:ml-2">
                  {MONTH_LABELS[record.correctMonth]}
                </span>
                <span className="text-[8px] sm:text-[9px] text-white/50 font-medium shrink-0 ml-auto pl-1 sm:pl-2">
                  {record.accuracy}%
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="text-white/50 text-xs sm:text-sm">
            PS: You were drawn to picking {MONTH_LABELS[dominantMonth]}.
          </div>
          <div className="text-white/20 text-[10px] sm:text-xs">
            dayfield365.vercel.app
          </div>
        </div>
      </div>
    );
  },
);

export default EndHeatmapCard;
