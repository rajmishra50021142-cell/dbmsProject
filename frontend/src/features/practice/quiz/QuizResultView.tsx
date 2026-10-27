import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { QuizSubmissionResponse } from '../../../types/practice';

interface QuizResultViewProps {
  result: QuizSubmissionResponse;
  onRetake: () => void;
  onHome: () => void;
}

export const QuizResultView: React.FC<QuizResultViewProps> = ({
  result,
  onRetake,
  onHome,
}) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'incorrect' | 'correct'>('all');

  const toggleExpand = (qId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  };

  const filteredReviews = result.question_reviews.filter((rev) => {
    if (filterMode === 'correct') return rev.is_correct;
    if (filterMode === 'incorrect') return !rev.is_correct;
    return true;
  });

  const isMastery = result.score_percentage >= 80;
  const isPassing = result.score_percentage >= 60;

  return (
    <div className="max-w-4xl mx-auto w-full space-y-6 animate-in fade-in duration-200">
      {/* Top Hero Performance Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
          <div className="space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Session Complete
              </span>
              <Badge variant={isMastery ? 'success' : isPassing ? 'accent' : 'warning'} size="sm">
                {isMastery ? 'Mastery' : isPassing ? 'Solid Progress' : 'Review Needed'}
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Quiz Results & Performance Review
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
              {result.supportive_summary}
            </p>
          </div>

          {/* Score Badge Circle */}
          <div className="flex flex-col items-center justify-center w-32 h-32 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shrink-0 text-center p-2">
            <span className="text-3xl font-black">{Math.round(result.score_percentage)}%</span>
            <span className="text-xs font-bold tracking-wide uppercase text-indigo-100 mt-0.5">
              {result.earned_marks ?? result.correct_count} / {result.total_marks ?? result.total_questions} Marks
            </span>
            <span className="text-[10px] text-indigo-200">
              ({result.correct_count}/{result.total_questions} Correct)
            </span>
          </div>
        </div>

        {/* Quick Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 font-medium block">Total Marks</span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {result.earned_marks ?? result.correct_count} / {result.total_marks ?? result.total_questions}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] text-slate-400 font-medium block">Correct</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {result.correct_count}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] text-slate-400 font-medium block">Incorrect</span>
            <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
              {result.incorrect_count}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] text-slate-400 font-medium block">Unanswered</span>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {result.unanswered_count}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] text-slate-400 font-medium block">Time Spent</span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              {formatTime(result.time_spent_seconds)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button variant="outline" size="sm" onClick={onHome} leftIcon={<Home className="w-3.5 h-3.5" />}>
            Back to Practice Lab
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onRetake}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Retake / Start New Quiz
          </Button>
        </div>
      </div>

      {/* Topic Mastery Breakdown */}
      {Object.keys(result.topic_breakdown).length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Topic-Wise Mastery Breakdown
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {Object.entries(result.topic_breakdown).map(([topic, stats]) => {
              const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
              return (
                <div
                  key={topic}
                  className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2">
                      {topic}
                    </span>
                    <span className="font-mono font-bold text-slate-600 dark:text-slate-400 shrink-0">
                      {stats.correct}/{stats.total} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-indigo-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Question Review List */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            Question-by-Question Mathematical Review
          </h3>

          <div className="flex items-center gap-1 text-xs">
            {(['all', 'incorrect', 'correct'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterMode(filter)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterMode === filter
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {filter === 'all'
                  ? `All (${result.question_reviews.length})`
                  : filter === 'incorrect'
                  ? `Incorrect (${result.incorrect_count + result.unanswered_count})`
                  : `Correct (${result.correct_count})`}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredReviews.map((rev, idx) => {
            const isExpanded = !!expandedQuestions[rev.question_id];

            return (
              <div
                key={rev.question_id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs"
              >
                {/* Review Header Bar */}
                <div
                  onClick={() => toggleExpand(rev.question_id)}
                  className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        rev.is_correct
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                      }`}
                    >
                      {rev.is_correct ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Question {idx + 1}
                        </span>
                        <Badge
                          variant={rev.is_correct ? 'success' : 'neutral'}
                          size="sm"
                        >
                          {rev.is_correct
                            ? `+${rev.marks || 1} ${rev.marks === 1 ? 'Mark' : 'Marks'}`
                            : `0 / ${rev.marks || 1} ${rev.marks === 1 ? 'Mark' : 'Marks'}`}
                        </Badge>
                        <Badge variant="accent" size="sm">
                          {rev.topic}
                        </Badge>
                        {rev.exam && (
                          <Badge variant="neutral" size="sm">
                            {rev.exam} {rev.year ? `'${rev.year}` : ''}
                          </Badge>
                        )}
                        {rev.source_number && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            PYQ #{rev.source_number}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                        {rev.statement}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-semibold text-slate-500">
                      Your answer: {rev.selected_option || 'None'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details: Options, Verified Answer, Proof */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50/60 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 text-xs space-y-3">
                    <div className="space-y-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">
                        {rev.options && rev.options.length > 0 ? 'Options & Keys:' : 'Numerical Answer Key:'}
                      </span>
                      {rev.options && rev.options.length > 0 ? (
                        <div className="space-y-1">
                          {rev.options.map((opt, optIdx) => {
                            const letter = String.fromCharCode(65 + optIdx);
                            const correctList = rev.correct_answer ? rev.correct_answer.split(',').map((s) => s.trim()) : [];
                            const isCorrectOpt = correctList.includes(letter);
                            const selectedList = rev.selected_option ? rev.selected_option.split(',').map((s) => s.trim()) : [];
                            const isSelectedOpt = selectedList.includes(letter);

                            return (
                              <div
                                key={optIdx}
                                className={`p-2 rounded text-xs flex items-center justify-between ${
                                  isCorrectOpt
                                    ? 'bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-medium'
                                    : isSelectedOpt
                                    ? 'bg-rose-100/70 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span>{opt}</span>
                                {isCorrectOpt && (
                                  <Badge variant="success" size="sm">
                                    Correct Key
                                  </Badge>
                                )}
                                {isSelectedOpt && !isCorrectOpt && (
                                  <Badge variant="warning" size="sm">
                                    Selected
                                  </Badge>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-slate-500 font-medium mr-2">Your Numerical Response:</span>
                            <span className={`font-mono font-bold text-sm ${rev.is_correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {rev.selected_option || 'Unanswered'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium mr-2">Verified Numerical Key:</span>
                            <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                              {rev.correct_answer}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step-by-Step Proof */}
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px] uppercase tracking-wider block">
                        Step-by-Step Mathematical Explanation & Proof:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {rev.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
