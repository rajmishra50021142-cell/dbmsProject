import React, { useState, useMemo } from 'react';
import {
  Search,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import type { QuizQuestion } from '../../types/practice';

interface QuestionLibraryViewProps {
  questions: QuizQuestion[];
  onStartQuizWithFilter?: (exam?: string, topic?: string) => void;
}

export const QuestionLibraryView: React.FC<QuestionLibraryViewProps> = ({
  questions,
  onStartQuizWithFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'playable' | 'incomplete'>('all');
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

  const exams = useMemo(() => {
    return Array.from(new Set(questions.map((q) => q.exam).filter(Boolean) as string[])).sort();
  }, [questions]);

  const topics = useMemo(() => {
    return Array.from(new Set(questions.map((q) => q.topic).filter(Boolean))).sort();
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (statusFilter === 'playable' && q.status !== 'playable') return false;
      if (statusFilter === 'incomplete' && q.status !== 'incomplete') return false;
      if (selectedExam !== 'all' && q.exam !== selectedExam) return false;
      if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesStatement = q.statement.toLowerCase().includes(term);
        const matchesTopic = q.topic.toLowerCase().includes(term);
        const matchesExam = q.exam ? q.exam.toLowerCase().includes(term) : false;
        const matchesNumber = q.source_number ? q.source_number.toString() === term : false;
        if (!matchesStatement && !matchesTopic && !matchesExam && !matchesNumber) {
          return false;
        }
      }
      return true;
    });
  }, [questions, statusFilter, selectedExam, selectedTopic, searchTerm]);

  const toggleExpand = (qId: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const playableCount = questions.filter((q) => q.status === 'playable').length;
  const incompleteCount = questions.filter((q) => q.status === 'incomplete').length;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by question text, PYQ number, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Status filter buttons */}
          <div className="sm:col-span-4 flex items-center gap-1 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1.5 rounded-lg font-medium border text-xs transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setStatusFilter('playable')}
              className={`px-2.5 py-1.5 rounded-lg font-medium border text-xs transition-colors ${
                statusFilter === 'playable'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              Playable ({playableCount})
            </button>
            <button
              onClick={() => setStatusFilter('incomplete')}
              className={`px-2.5 py-1.5 rounded-lg font-medium border text-xs transition-colors ${
                statusFilter === 'incomplete'
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              Incomplete ({incompleteCount})
            </button>
          </div>

          {/* Dropdown Filters */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className="w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Exams</option>
              {exams.map((ex) => (
                <option key={ex} value={ex}>
                  {ex}
                </option>
              ))}
            </select>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-1/2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Academic Archival Clarification Note */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200/60 dark:border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
          <span>
            Displaying <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredQuestions.length}</span> question(s).
            All 80 questions parsed from <code className="font-mono text-indigo-500">content/pyqs/dbms_normal_forms_80_pyqs.pdf</code> are retained with source numbering.
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            60 Playable • 20 Incomplete (Excluded from quizzes)
          </span>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((q) => {
          const isExpanded = !!expandedQuestions[q.id];
          const isPlayable = q.status === 'playable';

          return (
            <div
              key={q.id}
              className={`bg-white dark:bg-slate-900 border rounded-xl overflow-hidden shadow-xs transition-colors ${
                isPlayable
                  ? 'border-slate-200 dark:border-slate-800'
                  : 'border-amber-200 dark:border-amber-900/50'
              }`}
            >
              <div
                onClick={() => toggleExpand(q.id)}
                className="p-4 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-500">
                      Q{q.source_number || q.id}
                    </span>
                    <Badge variant={isPlayable ? 'success' : 'warning'} size="sm">
                      {isPlayable ? 'Playable / Verified' : 'Incomplete in Source (Diagram/Table Omitted)'}
                    </Badge>
                    <Badge variant="accent" size="sm">
                      {q.topic}
                    </Badge>
                    {q.exam && (
                      <Badge variant="neutral" size="sm">
                        {q.exam} {q.year ? `'${q.year}` : ''}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                    {q.statement}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 pt-1">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded Card Details */}
              {isExpanded && (
                <div className="p-4 bg-slate-50/60 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 text-xs space-y-3">
                  {/* If incomplete, show why */}
                  {!isPlayable && q.incomplete_reason && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Omitted from Scored Quiz Pools:</span>
                        <p className="text-[11px] leading-relaxed pt-0.5">{q.incomplete_reason}</p>
                      </div>
                    </div>
                  )}

                  {/* Options */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block text-[11px] uppercase tracking-wider">
                      Options:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isCorrectKey = isPlayable && letter === q.correct_answer;

                        return (
                          <div
                            key={optIdx}
                            className={`p-2 rounded text-xs flex items-center justify-between ${
                              isCorrectKey
                                ? 'bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold'
                                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span>{opt}</span>
                            {isCorrectKey && (
                              <Badge variant="success" size="sm">
                                Correct
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mathematical Explanation & Proof */}
                  {isPlayable && q.explanation && (
                    <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px] uppercase tracking-wider block">
                        Verified Explanation & Proof:
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {q.explanation}
                      </p>
                    </div>
                  )}

                  {/* Caveat note */}
                  {q.note && (
                    <p className="text-[11px] text-slate-400 italic">
                      Source Compilation Note: {q.note}
                    </p>
                  )}

                  {onStartQuizWithFilter && isPlayable && (
                    <div className="pt-1 flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartQuizWithFilter(q.exam, q.topic);
                        }}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        Start 10-Question Quiz on "{q.topic}" →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
