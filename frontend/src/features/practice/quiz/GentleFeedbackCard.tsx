import React from 'react';
import {
  Lightbulb,
  Sparkles,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Compass,
  Check,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { GentleFeedbackResponse } from '../../../types/practice';

interface GentleFeedbackCardProps {
  feedback: GentleFeedbackResponse;
  onRetry: () => void;
  onNext: () => void;
  hasNext: boolean;
}

export const GentleFeedbackCard: React.FC<GentleFeedbackCardProps> = ({
  feedback,
  onRetry,
  onNext,
  hasNext,
}) => {
  const {
    is_correct,
    attempt_number,
    attempts_remaining,
    gentle_message,
    hint,
    revealed_answer,
    explanation,
    concept_summary,
  } = feedback;

  const isFinalResolution = is_correct || attempt_number >= 3;

  return (
    <div
      className={`rounded-xl border p-4 sm:p-5 transition-all shadow-sm ${
        is_correct
          ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
          : attempt_number >= 3
          ? 'bg-indigo-50/80 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-slate-800 dark:text-slate-100'
          : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-100'
      }`}
    >
      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          {is_correct ? (
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          ) : attempt_number >= 3 ? (
            <div className="w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-sm">
              <BookOpen className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Compass className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-semibold text-sm">
            {is_correct
              ? 'Correct Answer!'
              : attempt_number >= 3
              ? 'Complete Proof & Resolution'
              : `Attempt ${attempt_number} of 3 • Gentle Retry`}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {!is_correct && attempts_remaining > 0 && (
            <Badge variant="warning" size="sm">
              {attempts_remaining} retry {attempts_remaining === 1 ? 'attempt' : 'attempts'} left
            </Badge>
          )}
          {is_correct && (
            <Badge variant="success" size="sm">
              Verified Solution
            </Badge>
          )}
        </div>
      </div>

      {/* Gentle Supportive Message */}
      <div className="pt-3 pb-2 text-sm leading-relaxed">
        <p className="font-medium text-slate-800 dark:text-slate-200">{gentle_message}</p>
      </div>

      {/* Progressive Hint (Attempts 1 & 2) */}
      {!isFinalResolution && hint && (
        <div className="my-3 p-3.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-amber-200 dark:border-amber-800/80 shadow-xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
            <Lightbulb className="w-3.5 h-3.5" />
            Progressive Hint {attempt_number}:
          </div>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-normal">
            {hint}
          </p>
        </div>
      )}

      {/* Revealed Answer & Detailed Explanation (Attempt 3 or Correct) */}
      {isFinalResolution && (
        <div className="my-3 space-y-2.5">
          {revealed_answer && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500 font-medium">Correct Option:</span>
              <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                Option {revealed_answer}
              </span>
            </div>
          )}

          {explanation && (
            <div className="p-3.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs shadow-xs">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 text-[11px]">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                Step-by-Step Mathematical Explanation & Proof:
              </div>
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line font-normal">
                {explanation}
              </p>
            </div>
          )}

          {concept_summary && (
            <div className="p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{concept_summary}</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-2">
        {!isFinalResolution && attempts_remaining > 0 ? (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            className="border-amber-300 hover:bg-amber-100/60 dark:border-amber-700 dark:hover:bg-amber-950/40"
          >
            Try Again (Attempt {attempt_number + 1} of 3)
          </Button>
        ) : (
          <div />
        )}

        {hasNext ? (
          <Button
            size="sm"
            variant="primary"
            onClick={onNext}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Next Question
          </Button>
        ) : (
          <Button size="sm" variant="primary" onClick={onNext}>
            Finish & Review
          </Button>
        )}
      </div>
    </div>
  );
};
