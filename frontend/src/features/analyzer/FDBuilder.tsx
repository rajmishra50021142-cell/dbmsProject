import React, { useState } from 'react';
import { ArrowRight, Plus, X, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { FunctionalDependency } from '../../types';

interface FDBuilderProps {
  attributes: string[];
  functionalDependencies: FunctionalDependency[];
  onChange: (fds: FunctionalDependency[]) => void;
}

export const FDBuilder: React.FC<FDBuilderProps> = ({
  attributes,
  functionalDependencies,
  onChange,
}) => {
  const [lhs, setLhs] = useState<string[]>([]);
  const [rhs, setRhs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleLhs = (attr: string) => {
    if (lhs.includes(attr)) {
      setLhs(lhs.filter((a) => a !== attr));
    } else {
      setLhs([...lhs, attr]);
    }
    setError(null);
  };

  const toggleRhs = (attr: string) => {
    if (rhs.includes(attr)) {
      setRhs(rhs.filter((a) => a !== attr));
    } else {
      setRhs([...rhs, attr]);
    }
    setError(null);
  };

  const handleAddFd = () => {
    if (lhs.length === 0) {
      setError('Left-Hand Side (Determinant) cannot be empty.');
      return;
    }
    if (rhs.length === 0) {
      setError('Right-Hand Side (Dependent) cannot be empty.');
      return;
    }

    // Check duplicate or equivalent FD: same LHS set and same RHS set
    const lhsSet = new Set(lhs);
    const rhsSet = new Set(rhs);

    const exists = functionalDependencies.some((fd) => {
      return (
        fd.left.length === lhs.length &&
        fd.right.length === rhs.length &&
        fd.left.every((a) => lhsSet.has(a)) &&
        fd.right.every((a) => rhsSet.has(a))
      );
    });

    if (exists) {
      setError(`Duplicate functional dependency: (${lhs.join(', ')}) → (${rhs.join(', ')}) already exists.`);
      return;
    }

    const newFd: FunctionalDependency = {
      id: `fd-${Date.now()}-${functionalDependencies.length + 1}`,
      left: [...lhs],
      right: [...rhs],
    };

    onChange([...functionalDependencies, newFd]);
    setLhs([]);
    setRhs([]);
    setError(null);
  };

  const handleRemoveFd = (indexToRemove: number) => {
    onChange(functionalDependencies.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
            Functional Dependencies (FDs)
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Define attributes that uniquely determine other attributes: $X \to Y$.
          </p>
        </div>
        <Badge variant={functionalDependencies.length > 0 ? 'accent' : 'neutral'} size="sm">
          {functionalDependencies.length} {functionalDependencies.length === 1 ? 'FD' : 'FDs'}
        </Badge>
      </div>

      {/* Structured FD Creator */}
      {attributes.length > 0 && (
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            {/* Determinant LHS */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Determinant (LHS):
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                  {lhs.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-1 min-h-[32px] p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {attributes.map((attr) => {
                  const isSel = lhs.includes(attr);
                  return (
                    <button
                      key={attr}
                      type="button"
                      onClick={() => toggleLhs(attr)}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                        isSel
                          ? 'bg-indigo-600 text-white font-medium shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {isSel ? `✓ ${attr}` : attr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dependent RHS */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Dependent (RHS):
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                  {rhs.length} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-1 min-h-[32px] p-1.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {attributes.map((attr) => {
                  const isSel = rhs.includes(attr);
                  return (
                    <button
                      key={attr}
                      type="button"
                      onClick={() => toggleRhs(attr)}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                        isSel
                          ? 'bg-indigo-600 text-white font-medium shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {isSel ? `✓ ${attr}` : attr}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
              Preview:{' '}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {lhs.length > 0 ? lhs.join(', ') : '...'} → {rhs.length > 0 ? rhs.join(', ') : '...'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {(lhs.length > 0 || rhs.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    setLhs([]);
                    setRhs([]);
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
                >
                  Clear
                </button>
              )}
              <Button
                type="button"
                size="sm"
                variant="primary"
                disabled={lhs.length === 0 || rhs.length === 0}
                onClick={handleAddFd}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                id="add-fd-btn"
              >
                Add Dependency
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-md border border-rose-200 dark:border-rose-900/60">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* FDs List */}
      {functionalDependencies.length === 0 ? (
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>No functional dependencies defined</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
            Functional dependencies define relational constraints like $StudentID \to StudentName$.
            They form the mathematical foundation for finding candidate keys and testing 2NF/3NF/BCNF.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {functionalDependencies.map((fd, idx) => {
            const unknownLeft = fd.left.filter((a) => !attributes.includes(a));
            const unknownRight = fd.right.filter((a) => !attributes.includes(a));
            const hasOrphans = unknownLeft.length > 0 || unknownRight.length > 0;

            return (
              <div
                key={fd.id || idx}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                  hasOrphans
                    ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-900 dark:text-slate-100 font-semibold">
                    <span>{fd.left.join(', ')}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{fd.right.join(', ')}</span>
                  </div>
                  {hasOrphans && (
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-0.5">
                      <ShieldAlert className="w-3 h-3" />
                      Contains deleted: {[...unknownLeft, ...unknownRight].join(', ')}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFd(idx)}
                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors"
                  title="Remove functional dependency"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
