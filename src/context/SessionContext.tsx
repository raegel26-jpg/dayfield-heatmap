import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import type { Vibe, Phase, GuessRecord, MonthKey, Question } from '../types';
import questionsData from '../data/questions.json';
import { resolveBranch } from '../lib/season';
import { calculateAccuracy } from '../lib/accuracy';

type SessionState = {
  vibe: Vibe | null;
  currentQuestion: Question | null;
  questionIndex: number;
  guessHistory: GuessRecord[];
  phase: Phase;
};

type Action =
  | { type: 'START' }
  | { type: 'GUESS'; month: MonthKey }
  | { type: 'ADVANCE' }
  | { type: 'RESET' };

const questions = questionsData.questions as Question[];

function getEntryQuestion(): Question {
  return questions.find((q) => q.isEntry)!;
}

function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}

const initialState: SessionState = {
  vibe: null,
  currentQuestion: null,
  questionIndex: 0,
  guessHistory: [],
  phase: 'landing',
};

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case 'START': {
      return {
        ...state,
        vibe: 'rgb',
        currentQuestion: getEntryQuestion(),
        questionIndex: 1,
        phase: 'guess',
      };
    }
    case 'GUESS': {
      if (!state.currentQuestion) return state;
      const record: GuessRecord = {
        questionId: state.currentQuestion.id,
        guessedMonth: action.month,
        correctMonth: state.currentQuestion.correctMonth as MonthKey,
        wasCorrect: action.month === state.currentQuestion.correctMonth,
        accuracy: calculateAccuracy(state.currentQuestion.dataset, action.month),
      };
      return {
        ...state,
        guessHistory: [...state.guessHistory, record],
        phase: 'reveal',
      };
    }
    case 'ADVANCE': {
      if (!state.currentQuestion) return state;
      const lastGuess = state.guessHistory[state.guessHistory.length - 1];
      if (!lastGuess) return state;

      if (state.currentQuestion.isFinal) {
        return { ...state, phase: 'end' };
      }

      const branches = state.currentQuestion.branches;
      if (!branches) {
        return { ...state, phase: 'end' };
      }

      const nextId = resolveBranch(
        lastGuess.guessedMonth,
        state.currentQuestion.correctMonth as MonthKey,
        branches,
      );
      const nextQuestion = getQuestionById(nextId);

      if (!nextQuestion) {
        console.error(`Missing question: ${nextId}`);
        return { ...state, phase: 'end' };
      }

      return {
        ...state,
        currentQuestion: nextQuestion,
        questionIndex: state.questionIndex + 1,
        phase: 'guess',
      };
    }
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

type SessionContextValue = SessionState & {
  start: () => void;
  guess: (month: MonthKey) => void;
  advance: () => void;
  reset: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const start = useCallback(() => dispatch({ type: 'START' }), []);
  const guess = useCallback((month: MonthKey) => dispatch({ type: 'GUESS', month }), []);
  const advance = useCallback(() => dispatch({ type: 'ADVANCE' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return (
    <SessionContext.Provider value={{ ...state, start, guess, advance, reset }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be inside SessionProvider');
  return ctx;
}
