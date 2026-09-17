import React from 'react';
import type { DependencyPreservationResult } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle2, AlertCircle, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';

interface DependencyPreservationViewerProps {
  result: DependencyPreservationResult;
}

export const DependencyPreservationViewer: React.FC<DependencyPreservationViewerProps> = ({ result }) => {
  return (
    <div className="space-y-6">
      {/* Header & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-slate-900 dark:text-white">
              Dependency Preservation Analysis
            </h4>
            <Badge variant={result.is_preserved ? 'success' : 'warning'}>
              {result.is_preserved ? 'All Dependencies Preserved' : 'Dependencies Not Preserved'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Polynomial-time closure testing under projected functional dependencies (F1 ∪ ... ∪ Fk)+
          </p>
        </div>

        <div className="flex items-center gap-2">
          {result.is_preserved ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Enforceable Without Joins</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 dark:border-amber-800/60">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Requires Inter-Table Joins</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="p-4 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Theoretical Principle:</span> {result.reasoning}
        </div>
      </div>

      {/* Projected Dependencies by Relation */}
      <div className="space-y-3">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Projected Dependencies by Sub-Relation (π_Ri(F))
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(result.projected_dependencies_by_relation).map(([relName, fds]) => (
            <div
              key={relName}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                  {relName}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {fds.length} projected FD{fds.length !== 1 ? 's' : ''}
                </span>
              </div>

              {fds.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No non-trivial projected functional dependencies</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {fds.map((fd, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {fd.left.join(', ')} → {fd.right.join(', ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Check for Each Original FD */}
      <div className="space-y-3">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Preservation Status for Original Dependencies
        </h5>

        <div className="space-y-2.5">
          {result.checks.map((chk, idx) => {
            const isPreserved = chk.is_preserved;
            const isDirect = chk.relevant_relations.length > 0;

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl border transition-all ${
                  isPreserved
                    ? 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20'
                    : 'border-rose-200/80 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-white px-2.5 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                      {chk.target_fd.left.join(', ')} → {chk.target_fd.right.join(', ')}
                    </span>

                    {isPreserved ? (
                      isDirect ? (
                        <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                          Preserved Directly ({chk.relevant_relations.join(', ')})
                        </Badge>
                      ) : (
                        <Badge variant="info" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                          Preserved via Transitive Closure
                        </Badge>
                      )
                    ) : (
                      <Badge variant="error" size="sm" icon={<AlertCircle className="w-3 h-3" />}>
                        Not Preserved
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    Closure: {'{' + chk.target_fd.left.join(', ') + '}'}+ = {'{' + chk.closure_under_projected.join(', ') + '}'}
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {chk.explanation}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
