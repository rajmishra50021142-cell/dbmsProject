import React, { useState } from 'react';
import {
  X,
  Play,
  Clock,
  BookOpen,
  Trophy,
  Filter,
  Sparkles,
  Award,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import type { QuizConfig } from '../../../types/practice';

interface QuizConfigModalProps {
  isOpen: boolean;
  bankType: 'ai' | 'pyq';
  availableTopics: string[];
  availableExams?: string[];
  onClose: () => void;
  onStart: (config: QuizConfig) => void;
}

export const QuizConfigModal: React.FC<QuizConfigModalProps> = ({
  isOpen,
  bankType,
  availableTopics,
  availableExams = [],
  onClose,
  onStart,
}) => {
  const [mode, setMode] = useState<'practice' | 'exam_simulation'>('practice');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [untimed, setUntimed] = useState<boolean>(true);
  const [timeMinutes, setTimeMinutes] = useState<number>(15);
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedExam, setSelectedExam] = useState<string>('all');

  if (!isOpen) return null;

  const handleStart = () => {
    onStart({
      question_count: questionCount,
      time_limit_seconds: untimed ? null : timeMinutes * 60,
      untimed,
      mode,
      topic: selectedTopic === 'all' ? null : selectedTopic,
      difficulty: selectedDifficulty === 'all' ? null : selectedDifficulty,
      exam: selectedExam === 'all' ? null : selectedExam,
    });
  };

  const countOptions = bankType === 'ai' ? [5, 10, 15, 20, 30] : [5, 10, 15, 20, 30, 60];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              {bankType === 'ai' ? <Sparkles className="w-4 h-4" /> : <Award className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {bankType === 'ai' ? 'Start AI Practice Session' : 'Start Competitive PYQ Session'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure question count, retry style, and timer parameters.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Mode Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Interaction Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setMode('practice')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  mode === 'practice'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    Practice Mode
                  </span>
                  <Badge variant="accent" size="sm">
                    Recommended
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Gentle 3-attempt retries with progressive hints on attempts 1–2, and full step-by-step proofs on attempt 3.
                </p>
              </div>

              <div
                onClick={() => {
                  setMode('exam_simulation');
                  setUntimed(false);
                }}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                  mode === 'exam_simulation'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 dark:border-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" />
                    Exam Simulation
                  </span>
                  <Badge variant="neutral" size="sm">
                    Test Mode
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Continuous exam conditions with a timer countdown. Feedback and full score breakdown are revealed after final submission.
                </p>
              </div>
            </div>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Number of Questions
              </label>
              <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {questionCount} questions
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {countOptions.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    questionCount === count
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {count} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Timer Settings */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Timing & Pacing
            </label>
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={untimed}
                  onChange={(e) => setUntimed(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Untimed (Self-paced study)</span>
              </label>

              {!untimed && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Duration:</span>
                  <select
                    value={timeMinutes}
                    onChange={(e) => setTimeMinutes(Number(e.target.value))}
                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Filter by Topic */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              Topic Filter
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Topics (Full Syllabus)</option>
              {availableTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty (AI Practice) or Exam (PYQs) */}
          {bankType === 'ai' ? (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Difficulty Level
              </label>
              <div className="flex gap-2 text-xs">
                {['all', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`flex-1 py-1.5 rounded-lg border text-center font-medium transition-colors ${
                      selectedDifficulty === diff
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {diff === 'all' ? 'All Levels' : diff}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            availableExams.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Target Competitive Exam
                </label>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value="all">All Exams (GATE, ISRO, NET, etc.)</option>
                  {availableExams.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex}
                    </option>
                  ))}
                </select>
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleStart}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
            id="start-quiz-session-confirm-btn"
          >
            Start Quiz Session
          </Button>
        </div>
      </div>
    </div>
  );
};
