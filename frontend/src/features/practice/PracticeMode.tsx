import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Send,
} from 'lucide-react';
import { fetchPracticeExercises, verifyPracticeAnswer } from '../../services/practiceService';
import type { PracticeExercise, PracticeVerifyResponse } from '../../types';

export const PracticeMode: React.FC = () => {
  const [exercises, setExercises] = useState<PracticeExercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<PracticeExercise | null>(null);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [result, setResult] = useState<PracticeVerifyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await fetchPracticeExercises();
      setExercises(data);
      if (data.length > 0) {
        setSelectedExercise(data[0]);
      }
    } catch (err) {
      console.error('Failed to load practice exercises', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectExercise = (ex: PracticeExercise) => {
    setSelectedExercise(ex);
    setSelectedOption('');
    setShowHint(false);
    setResult(null);
  };

  const handleVerify = async () => {
    if (!selectedExercise || !selectedOption) return;
    setVerifying(true);
    try {
      const res = await verifyPracticeAnswer({
        exercise_id: selectedExercise.id,
        exercise_type: selectedExercise.type,
        submitted_answer: selectedOption,
        attributes: selectedExercise.attributes,
        functional_dependencies: selectedExercise.functional_dependencies,
        multivalued_dependencies: selectedExercise.multivalued_dependencies,
        metadata: { target_attributes: selectedExercise.target_attributes },
      });
      setResult(res);
    } catch (err) {
      console.error('Failed to verify answer', err);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              DBMS Normalization Practice Mode
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Test your understanding of candidate keys, closures, and 1NF–4NF violations.
              Answers are graded directly by the actual relational mathematical engines.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left = Exercise List, Right = Exercise Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Exercise Navigation */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Practice Exercises ({exercises.length})
          </h3>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {exercises.map((ex) => {
              const isSelected = selectedExercise?.id === ex.id;
              return (
                <div
                  key={ex.id}
                  onClick={() => handleSelectExercise(ex)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {ex.title}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {ex.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {ex.prompt}
                  </p>
                </div>
              );
            })}

            {loading && (
              <div className="text-center py-8 text-xs text-slate-400 italic">
                Loading exercises...
              </div>
            )}
          </div>
        </div>

        {/* Right: Active Exercise Workspace */}
        <div className="lg:col-span-8">
          {selectedExercise ? (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
              {/* Exercise Header */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {selectedExercise.type}
                  </span>
                  <span className="text-xs text-slate-400">
                    Schema: <strong className="font-mono text-slate-700 dark:text-slate-300">{selectedExercise.schema_name}</strong>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedExercise.title}
                </h3>
              </div>

              {/* Prompt */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                {selectedExercise.prompt}
              </div>

              {/* Schema Details */}
              <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Attributes: </span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {(selectedExercise.attributes || []).join(', ')}
                  </span>
                </div>
                {(selectedExercise.functional_dependencies || []).length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Dependencies: </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {selectedExercise.functional_dependencies
                        .map((f) => `${f.left.join(', ')} → ${f.right.join(', ')}`)
                        .join('; ')}
                    </span>
                  </div>
                )}
                {(selectedExercise.multivalued_dependencies || []).length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Multivalued Dependencies: </span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {selectedExercise.multivalued_dependencies
                        .map((m) => `${m.left.join(', ')} ↠ ${m.right.join(', ')}`)
                        .join('; ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Hint Toggle */}
              {selectedExercise.hint && (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:underline"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Hide Pedagogical Hint' : 'Show Pedagogical Hint'}</span>
                  </button>
                  {showHint && (
                    <div className="mt-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                      {selectedExercise.hint}
                    </div>
                  )}
                </div>
              )}

              {/* Answer Options */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Select or Enter Your Answer:
                </h4>
                {selectedExercise.options ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedExercise.options.map((opt) => {
                      const isChecked = selectedOption === opt;
                      return (
                        <label
                          key={opt}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-mono font-semibold cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 text-indigo-950 dark:text-indigo-200'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="exercise-option"
                            value={opt}
                            checked={isChecked}
                            onChange={() => setSelectedOption(opt)}
                            className="text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={selectedOption}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    placeholder="Enter answer (e.g., A, B)..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono"
                  />
                )}
              </div>

              {/* Action Button */}
              <div>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={!selectedOption || verifying}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md shadow-indigo-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{verifying ? 'Verifying with Relational Engine...' : 'Check Answer'}</span>
                </button>
              </div>

              {/* Results & Academic Feedback Banner */}
              {result && (
                <div
                  className={`p-5 rounded-xl border space-y-3 animate-in fade-in duration-200 ${
                    result.is_correct
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {result.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    )}
                    <h4 className="text-sm font-bold">
                      {result.is_correct ? 'Correct! Mathematically Verified' : 'Incorrect Answer'}
                    </h4>
                  </div>

                  <p className="text-xs leading-relaxed font-sans">
                    {result.feedback}
                  </p>

                  {result.reasoning_steps && result.reasoning_steps.length > 0 && (
                    <div className="pt-2 border-t border-current/10">
                      <span className="text-[11px] font-bold uppercase tracking-wider block mb-1">
                        Relational Derivation Trace:
                      </span>
                      <ul className="space-y-1 text-xs font-mono">
                        {result.reasoning_steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="opacity-60">•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 italic">
              Select an exercise from the left to start practice.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
