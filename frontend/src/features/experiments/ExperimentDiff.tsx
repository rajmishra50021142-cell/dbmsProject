import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';
import type {
  ExperimentDiff as ExperimentDiffType,
  FullNormalizationAnalysisResult,
} from '../../types';

interface ExperimentDiffProps {
  originalAnalysis: FullNormalizationAnalysisResult;
  modifiedAnalysis: FullNormalizationAnalysisResult;
  diff: ExperimentDiffType;
  reasoningChanges: string[];
}

export const ExperimentDiff: React.FC<ExperimentDiffProps> = ({
  originalAnalysis,
  modifiedAnalysis,
  diff,
  reasoningChanges,
}) => {
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'SATISFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" /> PASS
          </span>
        );
      case 'VIOLATED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300">
            <XCircle className="w-3 h-3" /> FAIL
          </span>
        );
      case 'BLOCKED_BY_PREREQUISITE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-3 h-3" /> BLOCKED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
            {status}
          </span>
        );
    }
  };

  const stages = ['1NF', '2NF', '3NF', '4NF'] as const;

  const getStageStatus = (res: FullNormalizationAnalysisResult, stage: '1NF' | '2NF' | '3NF' | '4NF') => {
    switch (stage) {
      case '1NF':
        return res.nf1?.status || 'NOT_EVALUATED';
      case '2NF':
        return res.nf2?.status || 'NOT_EVALUATED';
      case '3NF':
        return res.nf3?.status || 'NOT_EVALUATED';
      case '4NF':
        return res.nf4?.status || 'NOT_EVALUATED';
    }
  };

  return (
    <div className="space-y-6">
      {/* Highest Normal Form Shift Hero */}
      <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-gradient-to-r from-indigo-50/70 to-slate-50 dark:from-indigo-950/40 dark:to-slate-900/60 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 block mb-1">
            Highest Confirmed Normal Form
          </span>
          <div className="flex items-center gap-3 font-mono text-base font-bold">
            <span className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
              {diff.highest_normal_form_before}
            </span>
            <ArrowRight className="w-5 h-5 text-indigo-500" />
            <span className={`px-3 py-1 rounded-lg border font-bold ${diff.highest_normal_form_after !== diff.highest_normal_form_before ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'}`}>
              {diff.highest_normal_form_after}
            </span>
          </div>
        </div>

        {(diff.normal_forms_changed || []).length > 0 ? (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
            {(diff.normal_forms_changed || []).length} Stage(s) Changed
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-500">
            No Stage Transitions
          </span>
        )}
      </div>

      {/* Normal Form Side-by-Side Table */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Normal Form Progression Comparison
        </h4>
        <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
          <div>Stage</div>
          <div>Original Analysis</div>
          <div>Modified Working Copy</div>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {stages.map((st) => {
            const before = getStageStatus(originalAnalysis, st);
            const after = getStageStatus(modifiedAnalysis, st);
            const changed = before !== after;

            return (
              <div
                key={st}
                className={`grid grid-cols-3 gap-2 py-2.5 items-center text-xs ${changed ? 'bg-indigo-50/40 dark:bg-indigo-950/20 px-2 rounded-lg' : ''}`}
              >
                <div className="font-bold font-mono text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <span>{st}</span>
                  {changed && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  )}
                </div>
                <div>{renderStatusBadge(before)}</div>
                <div className="flex items-center gap-1.5">
                  {renderStatusBadge(after)}
                  {changed && (
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                      (Changed)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* "Why did it change?" Reasoning Traces */}
      {reasoningChanges.length > 0 && (
        <div className="p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-900/80 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-sm">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Why Did It Change? (Pedagogical Derivation)
          </h4>
          <ul className="space-y-2">
            {reasoningChanges.map((trace, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-start gap-2 leading-relaxed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <span>{trace}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Structural Modifications Summary */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Delta Audit Log
        </h4>

        {/* Candidate Keys */}
        <div className="text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">
            Candidate Keys:
          </span>
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Before: {originalAnalysis.candidate_keys.map((k) => `{${k.join(', ')}}`).join(' OR ')}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
              After: {modifiedAnalysis.candidate_keys.map((k) => `{${k.join(', ')}}`).join(' OR ')}
            </span>
          </div>
        </div>

        {/* Added / Removed Dependencies */}
        {diff.dependencies_added.length > 0 && (
          <div className="text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">
              <Plus className="w-3.5 h-3.5" /> Functional Dependencies Added:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {diff.dependencies_added.map((f, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-mono text-xs border border-emerald-200 dark:border-emerald-800"
                >
                  {f.notation}
                </span>
              ))}
            </div>
          </div>
        )}

        {diff.dependencies_removed.length > 0 && (
          <div className="text-xs">
            <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 mb-1">
              <Minus className="w-3.5 h-3.5" /> Functional Dependencies Removed:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {diff.dependencies_removed.map((f, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-mono text-xs border border-rose-200 dark:border-rose-800"
                >
                  {f.notation}
                </span>
              ))}
            </div>
          </div>
        )}

        {diff.dependencies_added.length === 0 && diff.dependencies_removed.length === 0 && (
          <span className="text-xs text-slate-400 italic block">
            No functional dependencies were added or removed in this run.
          </span>
        )}
      </div>
    </div>
  );
};
