import React, { useState } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Bookmark,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import type {
  RelationSchema,
  FullNormalizationAnalysisResult,
  ExperimentDiff as ExperimentDiffType,
} from '../../types';
import { analyzeExperiment } from '../../services/experimentService';
import { ExperimentEditor } from './ExperimentEditor';
import { ExperimentDiff } from './ExperimentDiff';
import { ExperimentHistory } from './ExperimentHistory';

interface ExperimentModeProps {
  originalSchema: RelationSchema;
  originalAnalysis: FullNormalizationAnalysisResult;
  onApplyModifiedSchema?: (modified: RelationSchema) => void;
  onClose?: () => void;
}

export const ExperimentMode: React.FC<ExperimentModeProps> = ({
  originalSchema,
  originalAnalysis,
  onApplyModifiedSchema,
  onClose,
}) => {
  // Working copy starts as deep clone of immutable original
  const [workingCopy, setWorkingCopy] = useState<RelationSchema>(() =>
    JSON.parse(JSON.stringify(originalSchema))
  );

  const [modifiedAnalysis, setModifiedAnalysis] = useState<FullNormalizationAnalysisResult | null>(null);
  const [diff, setDiff] = useState<ExperimentDiffType | null>(null);
  const [reasoningChanges, setReasoningChanges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Run experiment re-analysis
  const handleRunExperiment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeExperiment({
        original_input: originalSchema,
        modified_input: workingCopy,
      });
      setModifiedAnalysis(res.modified_analysis);
      setDiff(res.diff);
      setReasoningChanges(res.reasoning_changes);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze modified schema in experiment mode.');
    } finally {
      setLoading(false);
    }
  };

  // Reset restores exact original analysis and schema
  const handleReset = () => {
    setWorkingCopy(JSON.parse(JSON.stringify(originalSchema)));
    setModifiedAnalysis(null);
    setDiff(null);
    setReasoningChanges([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                What-If / Experiment Mode
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Safe Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Original schema remains immutable. Test adding/removing dependencies and attributes to observe real-time normal form shifts.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRunExperiment}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{loading ? 'Evaluating...' : 'Run Experiment'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Original</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Snapshots</span>
          </button>

          {onApplyModifiedSchema && diff && (
            <button
              type="button"
              onClick={() => onApplyModifiedSchema(workingCopy)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Apply to Main Lab</span>
            </button>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left = Working Copy Editor, Right = Impact & Diff */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Schema Working Copy Editor */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Working Copy Editor
            </h3>
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded">
              Relation: {workingCopy.name}
            </span>
          </div>

          <ExperimentEditor schema={workingCopy} onChange={setWorkingCopy} />
        </div>

        {/* Right Column: Diff & Impact Summary */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Experiment Impact & Mathematical Diff
            </h3>
            {diff && (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                Analysis Up to Date
              </span>
            )}
          </div>

          {diff && modifiedAnalysis ? (
            <ExperimentDiff
              originalAnalysis={originalAnalysis}
              modifiedAnalysis={modifiedAnalysis}
              diff={diff}
              reasoningChanges={reasoningChanges}
            />
          ) : (
            <div className="p-12 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Modify Schema and Click "Run Experiment"
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                Add attributes, modify functional dependencies, or add multivalued dependencies on the left.
                Then execute the experiment to inspect the rigorous before-and-after normalization diff.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Snapshots Modal */}
      <ExperimentHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentSchema={workingCopy}
        highestNormalForm={modifiedAnalysis?.highest_confirmed_normal_form || originalAnalysis.highest_confirmed_normal_form}
        onRestoreSnapshot={(s) => {
          setWorkingCopy(s);
          setModifiedAnalysis(null);
          setDiff(null);
        }}
      />
    </div>
  );
};
