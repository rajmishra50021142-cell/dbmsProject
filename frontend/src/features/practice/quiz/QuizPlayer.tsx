import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Flag,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Send,
  Check,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { GentleFeedbackCard } from './GentleFeedbackCard';
import { practiceService } from '../../../services/practiceService';
import type {
  QuizQuestion,
  QuizConfig,
  GentleFeedbackResponse,
  QuizSubmissionResponse,
} from '../../../types/practice';

interface QuizPlayerProps {
  questions: QuizQuestion[];
  config: QuizConfig;
  bankType: 'ai' | 'pyq';
  onComplete: (response: QuizSubmissionResponse) => void;
  onExit: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({
  questions,
  config,
  bankType,
  onComplete,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, GentleFeedbackResponse>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});

  // Active selection for the current question
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

  // Timing
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(
    config.time_limit_seconds || null
  );
  const startTimeRef = useRef<number>(Date.now());

  const currentQ = questions[currentIndex] || questions[0];
  const currentQId = currentQ?.id;
  const currentFeedback = currentQId ? feedbacks[currentQId] : undefined;
  const currentAttempt = currentQId ? attempts[currentQId] || 1 : 1;

  // Sync selectedOption when moving between questions
  useEffect(() => {
    if (currentQId) {
      setSelectedOption(answers[currentQId] || '');
    }
  }, [currentIndex, currentQId]);

  // Timer countdown
  useEffect(() => {
    if (config.untimed || secondsRemaining === null) return;

    if (secondsRemaining <= 0) {
      handleSubmitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, config.untimed]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const handleOptionSelect = (optionLetter: string) => {
    // If practice mode and question already solved or attempt 3 reached, lock
    if (config.mode === 'practice' && currentFeedback && (currentFeedback.is_correct || currentFeedback.attempt_number >= 3)) {
      return;
    }

    if (currentQ?.question_type === 'MSQ') {
      const currentList = selectedOption ? selectedOption.split(',').map((s) => s.trim()).filter(Boolean) : [];
      let updatedList: string[];
      if (currentList.includes(optionLetter)) {
        updatedList = currentList.filter((l) => l !== optionLetter);
      } else {
        updatedList = [...currentList, optionLetter];
      }
      updatedList.sort();
      const updatedStr = updatedList.join(', ');
      setSelectedOption(updatedStr);

      if (config.mode === 'exam_simulation' && currentQId) {
        setAnswers((prev) => ({
          ...prev,
          [currentQId]: updatedStr,
        }));
      }
    } else {
      setSelectedOption(optionLetter);

      // In exam simulation, save answer immediately
      if (config.mode === 'exam_simulation' && currentQId) {
        setAnswers((prev) => ({
          ...prev,
          [currentQId]: optionLetter,
        }));
      }
    }
  };

  const handleNumericChange = (val: string) => {
    if (config.mode === 'practice' && currentFeedback && (currentFeedback.is_correct || currentFeedback.attempt_number >= 3)) {
      return;
    }
    setSelectedOption(val);
    if (config.mode === 'exam_simulation' && currentQId) {
      setAnswers((prev) => ({
        ...prev,
        [currentQId]: val,
      }));
    }
  };

  // Practice Mode: Check Answer with gentle retry
  const handleCheckAnswer = async () => {
    if (!currentQId || !selectedOption) return;

    setIsVerifying(true);
    try {
      const fb = await practiceService.verifyAttempt({
        question_id: currentQId,
        bank_type: bankType,
        selected_option: selectedOption,
        attempt_number: currentAttempt,
      });

      setFeedbacks((prev) => ({
        ...prev,
        [currentQId]: fb,
      }));

      // If correct or final attempt, save into final answers map
      if (fb.is_correct || fb.attempt_number >= 3) {
        setAnswers((prev) => ({
          ...prev,
          [currentQId]: selectedOption,
        }));
      }
    } catch (err) {
      console.error('Failed to verify attempt', err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Retry for attempts 2 and 3
  const handleRetryCurrent = () => {
    if (!currentQId) return;
    setAttempts((prev) => ({
      ...prev,
      [currentQId]: (prev[currentQId] || 1) + 1,
    }));
    // Clear feedback and allow student to select another option
    setFeedbacks((prev) => {
      const copy = { ...prev };
      delete copy[currentQId];
      return copy;
    });
    setSelectedOption('');
  };

  const handleNext = () => {
    if (currentQId && selectedOption && !answers[currentQId]) {
      setAnswers((prev) => ({ ...prev, [currentQId]: selectedOption }));
    }
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setShowConfirmModal(true);
    }
  };

  const handlePrevious = () => {
    if (currentQId && selectedOption && !answers[currentQId]) {
      setAnswers((prev) => ({ ...prev, [currentQId]: selectedOption }));
    }
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handlePaletteSelect = (idx: number) => {
    if (currentQId && selectedOption && !answers[currentQId]) {
      setAnswers((prev) => ({ ...prev, [currentQId]: selectedOption }));
    }
    setCurrentIndex(idx);
  };

  const handleToggleFlag = () => {
    if (!currentQId) return;
    setFlagged((prev) => ({
      ...prev,
      [currentQId]: !prev[currentQId],
    }));
  };

  const handleSubmitQuiz = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    try {
      const res = await practiceService.submitQuiz({
        bank_type: bankType,
        answers,
        time_spent_seconds: timeSpent,
        mode: config.mode,
      });
      onComplete(res);
    } catch (err) {
      console.error('Failed to submit quiz session', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-5xl mx-auto w-full space-y-5 animate-in fade-in duration-200">
      {/* Top Session Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button size="xs" variant="outline" onClick={onExit} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
            Exit
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <Badge variant={config.mode === 'practice' ? 'accent' : 'warning'} size="sm">
                {config.mode === 'practice' ? 'Practice Mode' : 'Exam Simulation'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {answeredCount} of {questions.length} answered
            </p>
          </div>
        </div>

        {/* Timer (if timed) */}
        <div className="flex items-center gap-3">
          {!config.untimed && secondsRemaining !== null && (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                secondsRemaining < 60
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 animate-pulse'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowConfirmModal(true)}
            id="finish-quiz-early-btn"
          >
            Submit Quiz
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Main Two-Column Layout (Question Card + Question Palette) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Question Card (8 cols) */}
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
            {/* Question Metadata Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" size="sm">
                  {currentQ.topic}
                </Badge>
                {currentQ.question_type && (
                  <Badge
                    variant={
                      currentQ.question_type === 'MSQ'
                        ? 'warning'
                        : currentQ.question_type === 'NAT'
                        ? 'info'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    {currentQ.question_type}
                  </Badge>
                )}
                {currentQ.marks && (
                  <Badge variant="neutral" size="sm">
                    {currentQ.marks} {currentQ.marks === 1 ? 'Mark' : 'Marks'}
                  </Badge>
                )}
                {currentQ.difficulty && (
                  <Badge variant="neutral" size="sm">
                    {currentQ.difficulty}
                  </Badge>
                )}
                {currentQ.exam && (
                  <Badge variant="success" size="sm">
                    {currentQ.exam} {currentQ.year ? `'${currentQ.year}` : ''}
                  </Badge>
                )}
                {currentQ.source_number && (
                  <span className="text-[11px] text-slate-400 font-mono">
                    PYQ #{currentQ.source_number}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleToggleFlag}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                  flagged[currentQId]
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Flag question for review"
              >
                <Flag className="w-3.5 h-3.5 fill-current" />
                <span className="hidden sm:inline">
                  {flagged[currentQId] ? 'Flagged' : 'Flag'}
                </span>
              </button>
            </div>

            {/* Question Statement */}
            <div className="text-sm sm:text-base font-medium text-slate-900 dark:text-slate-100 leading-relaxed font-sans">
              {currentQ.statement}
            </div>

            {/* Authentic Diagram / Figure Crop (if present) */}
            {currentQ.figure_url && (
              <div className="my-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 sm:p-4 flex flex-col items-center justify-center shadow-2xs">
                <img
                  src={currentQ.figure_url}
                  alt={`GATE Diagram ${currentQ.source_number || ''}`}
                  className="max-h-[460px] w-auto max-w-full object-contain rounded"
                  loading="lazy"
                />
                <span className="text-[11px] text-slate-400 mt-2 font-mono">
                  Authentic GATE Question Figure (200 DPI Source Archival Crop)
                </span>
              </div>
            )}

            {/* MSQ Notice Banner */}
            {currentQ.question_type === 'MSQ' && (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <Badge variant="warning" size="sm">MSQ</Badge>
                <span className="font-medium">
                  Multiple-Select Question: One or more options may be correct. Select all correct options.
                </span>
              </div>
            )}

            {/* Caveat Note if memory-based */}
            {currentQ.note && (
              <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-200/60 dark:border-slate-800/60">
                Note: {currentQ.note}
              </p>
            )}

            {/* Options List OR NAT Numeric Input */}
            {currentQ.question_type === 'NAT' ? (
              <div className="pt-2 space-y-3">
                <div className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950/50 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Numerical Answer Input (Integer or Decimal)
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <input
                      type="number"
                      step="any"
                      value={selectedOption}
                      onChange={(e) => handleNumericChange(e.target.value)}
                      disabled={config.mode === 'practice' && currentFeedback && (currentFeedback.is_correct || currentFeedback.attempt_number >= 3)}
                      placeholder="Enter numeric value (e.g. 4 or 2.5)"
                      className="w-full max-w-sm px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono text-base focus:outline-hidden focus:border-indigo-600 transition-colors"
                      id="nat-answer-input"
                    />
                    <span className="text-xs text-slate-500">
                      GATE Virtual Calculator Numerical Format
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((optionText, idx) => {
                  const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
                  const isSelected = currentQ.question_type === 'MSQ'
                    ? selectedOption.split(',').map((s) => s.trim()).includes(optionLetter)
                    : selectedOption === optionLetter;

                  return (
                    <div
                      key={idx}
                      onClick={() => handleOptionSelect(optionLetter)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-950 dark:text-indigo-100'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {optionLetter}
                        </div>
                        <span className="text-sm font-sans pt-0.5 leading-relaxed">
                          {optionText.replace(/^[A-D]\)\s*/, '')}
                        </span>
                      </div>

                      {currentQ.question_type === 'MSQ' && (
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Practice Mode: Check Answer Button (if not yet checked or feedback cleared) */}
            {config.mode === 'practice' && !currentFeedback && (
              <div className="pt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption || isVerifying}
                  isLoading={isVerifying}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  id="check-answer-btn"
                >
                  Verify Answer
                </Button>
              </div>
            )}

            {/* Practice Mode: Gentle Feedback Card */}
            {config.mode === 'practice' && currentFeedback && (
              <GentleFeedbackCard
                feedback={currentFeedback}
                onRetry={handleRetryCurrent}
                onNext={handleNext}
                hasNext={currentIndex < questions.length - 1}
              />
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentIndex < questions.length - 1 ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNext}
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setShowConfirmModal(true)}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Submit All Answers
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Question Palette (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Question Palette
            </span>

            <div className="grid grid-cols-5 gap-1.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = !!answers[q.id];
                const isFlagged = !!flagged[q.id];

                let btnClass = 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent';
                if (isCurrent) {
                  btnClass = 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold';
                } else if (isFlagged) {
                  btnClass = 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold';
                } else if (isAnswered) {
                  btnClass = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handlePaletteSelect(idx)}
                    className={`h-8 rounded-lg text-xs font-mono transition-all border flex items-center justify-center ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900 border border-emerald-300" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900 border border-amber-300" />
                <span>Flagged for review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded ring-2 ring-indigo-500 bg-indigo-50" />
                <span>Current</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal Before Submission */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Confirm Final Quiz Submission
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You have answered <span className="font-semibold text-slate-800 dark:text-slate-200">{answeredCount}</span> of{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">{questions.length}</span> questions.
              {answeredCount < questions.length && (
                <span className="text-amber-600 dark:text-amber-400 block mt-1">
                  ⚠️ {questions.length - answeredCount} unanswered question(s) will be marked incorrect upon final scoring.
                </span>
              )}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setShowConfirmModal(false)}>
                Continue Answering
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSubmitQuiz}
                isLoading={isSubmitting}
                id="submit-quiz-final-btn"
              >
                Yes, Submit Quiz
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
