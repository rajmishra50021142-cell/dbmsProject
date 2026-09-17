import React from 'react';
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  Database,
  X,
  Calculator,
  HelpCircle,
  FlaskConical,
} from 'lucide-react';
import type { SelectedEntity, RelationSchema } from '../../types';

interface SynchronizedDetailPanelProps {
  selectedEntity: SelectedEntity;
  schema: RelationSchema;
  onClearSelection?: () => void;
  onCalculateClosure?: (attrs: string[]) => void;
  onExplainWhyDependency?: (dep: any) => void;
  onOpenExperiment?: () => void;
}

export const SynchronizedDetailPanel: React.FC<SynchronizedDetailPanelProps> = ({
  selectedEntity,
  schema,
  onClearSelection,
  onCalculateClosure,
  onExplainWhyDependency,
  onOpenExperiment,
}) => {
  if (!selectedEntity) {
    return (
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs text-center space-y-2">
        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
          <Info className="w-4 h-4" />
        </div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
          Inspector / Detail Panel
        </h4>
        <p className="text-[11px] text-slate-400">
          Click any attribute node, dependency edge, candidate key, or stage in the workspace to view synchronized theoretical proofs.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // ATTRIBUTE DETAIL
  // ---------------------------------------------------------------------------
  if (selectedEntity.type === 'attribute') {
    const attr = selectedEntity.attribute;
    const isPrime = Boolean(selectedEntity.isPrime);
    const relevantFds = schema.functional_dependencies.filter(
      (fd) => fd.left.includes(attr) || fd.right.includes(attr)
    );
    const candidateKeysToUse: string[][] =
      schema.candidate_keys && schema.candidate_keys.length > 0
        ? schema.candidate_keys
        : selectedEntity.candidateKeys && selectedEntity.candidateKeys.length > 0
        ? selectedEntity.candidateKeys
        : [];
    const relevantKeys: string[][] = candidateKeysToUse.filter((k: string[]) => k.includes(attr));

    return (
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <h4 className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
              {attr}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {isPrime ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                PRIME ATTRIBUTE
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                NON-PRIME
              </span>
            )}
            {onClearSelection && (
              <button
                onClick={onClearSelection}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Candidate Key Membership
            </span>
            <div className="mt-1 font-mono text-slate-700 dark:text-slate-300">
              {relevantKeys.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {relevantKeys.map((k, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 font-bold">
                      🔑 ({k.join(', ')})
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-slate-400">Not part of any candidate key.</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Associated Dependencies ({relevantFds.length})
            </span>
            <div className="mt-1 space-y-1 font-mono">
              {relevantFds.length > 0 ? (
                relevantFds.map((fd, i) => (
                  <div key={i} className="p-1.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-[11px]">
                    <span className={fd.left.includes(attr) ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}>
                      {fd.left.join(', ')}
                    </span>
                    <span className="mx-1 text-slate-400">→</span>
                    <span className={fd.right.includes(attr) ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}>
                      {fd.right.join(', ')}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-slate-400">No active functional dependencies.</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // DEPENDENCY DETAIL
  // ---------------------------------------------------------------------------
  if (selectedEntity.type === 'dependency') {
    const isMvd = selectedEntity.kind === 'mvd';
    const isViol = selectedEntity.isViolation;

    return (
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {isMvd ? 'Multivalued Dependency' : 'Functional Dependency'}
          </span>
          <div className="flex items-center gap-2">
            {isViol ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> {selectedEntity.violationStage} VIOLATION
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> VALID
              </span>
            )}
            {onClearSelection && (
              <button
                onClick={onClearSelection}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
          {selectedEntity.formula}
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Determinant (LHS):</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {'{'}{selectedEntity.left.join(', ')}{'}'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Dependent (RHS):</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {'{'}{selectedEntity.right.join(', ')}{'}'}
            </span>
          </div>

          {selectedEntity.explanation && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
              {selectedEntity.explanation}
            </div>
          )}

          {/* Phase 9 Dependency Shortcuts */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap gap-1.5">
            {onCalculateClosure && (
              <button
                type="button"
                onClick={() => onCalculateClosure(selectedEntity.left)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
              >
                <Calculator className="w-3 h-3" />
                <span>Calculate {selectedEntity.left.join('')}⁺</span>
              </button>
            )}

            {onExplainWhyDependency && (
              <button
                type="button"
                onClick={() => onExplainWhyDependency(selectedEntity)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Why Relevant?</span>
              </button>
            )}

            {onOpenExperiment && (
              <button
                type="button"
                onClick={onOpenExperiment}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <FlaskConical className="w-3 h-3" />
                <span>Experiment</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RELATION NODE DETAIL
  // ---------------------------------------------------------------------------
  if (selectedEntity.type === 'relation') {
    return (
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            <h4 className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
              {selectedEntity.name}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              RELATION
            </span>
            {onClearSelection && (
              <button
                onClick={onClearSelection}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Clear selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Attributes ({selectedEntity.attributes.length})
            </span>
            <div className="mt-1 flex flex-wrap gap-1 font-mono">
              {selectedEntity.attributes.map((a) => (
                <span key={a} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {selectedEntity.primaryKey?.includes(a) ? `🔑 ${a}` : a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
