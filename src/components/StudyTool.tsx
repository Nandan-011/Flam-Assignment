import React, { useState } from 'react';
import { StudyModule, Flashcard, QuizQuestion } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCw,
  CheckCircle2,
  XCircle,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Award,
  HelpCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface StudyToolProps {
  data: StudyModule;
}

export const StudyTool: React.FC<StudyToolProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'quiz'>('cards');

  // --- Flashcards State ---
  const [cards, setCards] = useState<Flashcard[]>(data.flashcards);
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- Quiz State ---
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(data.quiz);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isRetestingWrongOnly, setIsRetestingWrongOnly] = useState(false);

  // Card Controls
  const currentCard = cards[currentCardIdx] || cards[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIdx((prev) => (prev + 1) % cards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIdx((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffleCards = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentCardIdx(0);
  };

  const toggleMastered = (id: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isMastered: !c.isMastered } : c))
    );
  };

  // Quiz Controls
  const handleSelectOption = (questionId: string, optionIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quizQuestions.forEach((q) => {
      if (userAnswers[q.id] === q.correctAnswerIndex) {
        correct += 1;
      }
    });
    return { correct, total: quizQuestions.length };
  };

  const handleRetestWrong = () => {
    const wrongQuestions = quizQuestions.filter(
      (q) => userAnswers[q.id] !== q.correctAnswerIndex
    );
    if (wrongQuestions.length === 0) return;
    setQuizQuestions(wrongQuestions);
    setUserAnswers({});
    setQuizSubmitted(false);
    setIsRetestingWrongOnly(true);
  };

  const handleResetFullQuiz = () => {
    setQuizQuestions(data.quiz);
    setUserAnswers({});
    setQuizSubmitted(false);
    setIsRetestingWrongOnly(false);
  };

  const score = calculateScore();

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-[#0A0A0A] text-white rounded-2xl p-6 shadow-xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#FF3B30]" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-[#FF3B30] text-xs font-mono font-bold uppercase tracking-[0.2em]">
              <BrainCircuit className="h-4 w-4" />
              01. INTERACTIVE STUDY ENGINE
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight uppercase text-white">{data.title}</h2>
            <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-2xl font-light">{data.summary}</p>
          </div>

          <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-xl border border-white/10">
            <button
              id="study-tab-flashcards"
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all ${
                activeTab === 'cards'
                  ? 'bg-[#FF3B30] text-white shadow-md shadow-[#FF3B30]/20'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              Flashcards ({cards.length})
            </button>
            <button
              id="study-tab-quiz"
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-bold transition-all ${
                activeTab === 'quiz'
                  ? 'bg-[#FF3B30] text-white shadow-md shadow-[#FF3B30]/20'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Award className="h-4 w-4" />
              Quiz ({quizQuestions.length})
            </button>
          </div>
        </div>
      </div>

      {/* --- TAB 1: FLASHCARDS --- */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          {/* Card Controls Bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Card {currentCardIdx + 1} of {cards.length}
            </span>

            <div className="flex items-center gap-2">
              <button
                id="btn-shuffle-cards"
                onClick={handleShuffleCards}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Shuffle className="h-3.5 w-3.5" />
                Shuffle
              </button>

              <button
                id="btn-toggle-mastered"
                onClick={() => toggleMastered(currentCard.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  currentCard.isMastered
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {currentCard.isMastered ? 'Mastered' : 'Mark Mastered'}
              </button>
            </div>
          </div>

          {/* 3D Flip Flashcard */}
          <div className="perspective-1000 min-h-[280px] sm:min-h-[320px] flex items-center justify-center">
            <motion.div
              id="flashcard-container"
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-full cursor-pointer rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-950 p-6 sm:p-10 shadow-lg relative flex flex-col justify-between hover:border-indigo-400 transition-all select-none"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.4 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {!isFlipped ? (
                /* Front Side: Question */
                <div className="flex flex-col justify-between h-full space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 uppercase tracking-wider">
                      {currentCard.category || 'Question'}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <RotateCw className="h-3.5 w-3.5" /> Click to flip
                    </span>
                  </div>

                  <div className="my-auto text-center py-4">
                    <h3 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
                      {currentCard.question}
                    </h3>
                  </div>

                  {currentCard.hint && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                      <HelpCircle className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                      Hint: {currentCard.hint}
                    </div>
                  )}
                </div>
              ) : (
                /* Back Side: Answer */
                <div
                  className="flex flex-col justify-between h-full space-y-6"
                  style={{ transform: 'rotateY(180deg)' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                      Answer
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <RotateCw className="h-3.5 w-3.5" /> Click to flip
                    </span>
                  </div>

                  <div className="my-auto text-center py-4">
                    <p className="text-base sm:text-xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                      {currentCard.answer}
                    </p>
                  </div>

                  <div className="text-xs text-center text-slate-400">
                    Press Spacebar or Arrow keys to navigate
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <button
              id="btn-prev-card"
              onClick={handlePrevCard}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-xs font-semibold"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>

            {/* Mastered Progress Indicator */}
            <div className="flex items-center gap-2">
              <div className="w-24 sm:w-36 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${
                      (cards.filter((c) => c.isMastered).length / cards.length) * 100
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {cards.filter((c) => c.isMastered).length}/{cards.length}
              </span>
            </div>

            <button
              id="btn-next-card"
              onClick={handleNextCard}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors text-xs font-semibold"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 2: QUIZ ENGINE --- */}
      {activeTab === 'quiz' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
          {isRetestingWrongOnly && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                Re-testing Incorrect Questions Mode ({quizQuestions.length} remaining)
              </span>
              <button
                id="btn-reset-full-quiz"
                onClick={handleResetFullQuiz}
                className="underline font-semibold hover:text-amber-900 dark:hover:text-amber-100"
              >
                Reset to Full Quiz
              </button>
            </div>
          )}

          <div className="space-y-8">
            {quizQuestions.map((q, qIdx) => {
              const selectedOpt = userAnswers[q.id];
              const isCorrect = selectedOpt === q.correctAnswerIndex;

              return (
                <div
                  key={q.id}
                  className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                      <span className="text-indigo-600 dark:text-indigo-400 mr-2 font-bold">
                        Q{qIdx + 1}.
                      </span>
                      {q.question}
                    </h3>

                    {quizSubmitted && (
                      <div>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                            <XCircle className="h-3.5 w-3.5" /> Incorrect
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, optIdx) => {
                      const isOptionSelected = selectedOpt === optIdx;
                      const isOptionRight = q.correctAnswerIndex === optIdx;

                      let btnStyle =
                        'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400';

                      if (quizSubmitted) {
                        if (isOptionRight) {
                          btnStyle =
                            'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-500 font-semibold';
                        } else if (isOptionSelected && !isOptionRight) {
                          btnStyle =
                            'bg-rose-50 dark:bg-rose-950/60 text-rose-900 dark:text-rose-200 border-rose-500 font-semibold';
                        }
                      } else if (isOptionSelected) {
                        btnStyle =
                          'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border-indigo-600 font-semibold ring-2 ring-indigo-500/20';
                      }

                      return (
                        <button
                          key={optIdx}
                          id={`quiz-opt-${q.id}-${optIdx}`}
                          type="button"
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          disabled={quizSubmitted}
                          className={`p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center gap-2 ${btnStyle}`}
                        >
                          <span className="h-5 w-5 rounded-full border border-current flex items-center justify-center shrink-0 font-bold text-[10px]">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation when submitted */}
                  {quizSubmitted && (
                    <div className="mt-3 p-3 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                      <span className="font-semibold block">Explanation:</span>
                      <p>{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit or Score Summary */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            {!quizSubmitted ? (
              <button
                id="btn-submit-quiz"
                onClick={handleSubmitQuiz}
                disabled={Object.keys(userAnswers).length < quizQuestions.length}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 disabled:opacity-50 transition-all"
              >
                Submit Quiz Answers ({Object.keys(userAnswers).length}/{quizQuestions.length})
              </button>
            ) : (
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    {Math.round((score.correct / score.total) * 100)}%
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      Score: {score.correct} / {score.total} Correct
                    </div>
                    <div className="text-xs text-slate-500">
                      {score.correct === score.total
                        ? 'Perfect Score! Exceptional job!'
                        : 'Review wrong questions or re-test.'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {score.correct < score.total && (
                    <button
                      id="btn-retest-wrong"
                      onClick={handleRetestWrong}
                      className="px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors"
                    >
                      Re-test Wrong Answers ({score.total - score.correct})
                    </button>
                  )}
                  <button
                    id="btn-reset-quiz"
                    onClick={handleResetFullQuiz}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition-colors"
                  >
                    Retake Full Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
