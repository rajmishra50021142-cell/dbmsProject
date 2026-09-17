import React, { useState } from 'react';
import { Key, Plus, X, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface CandidateKeyBuilderProps {
  attributes: string[];
  candidateKeys: string[][];
  onChange: (keys: string[][]) => void;
}

export const CandidateKeyBuilder: React.FC<CandidateKeyBuilderProps> = ({
  attributes,
  candidateKeys,
  onChange,
}) => {
  const [selectedAttrs, setSelectedAttrs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleAttributeSelection = (attr: string) => {
    if (selectedAttrs.includes(attr)) {
      setSelectedAttrs(selectedAttrs.filter((a) => a !== attr));
    } else {
      setSelectedAttrs([...selectedAttrs, attr]);
    }
    setError(null);
  };

  const handleAddKey = () => {
    if (selectedAttrs.length === 0) {
      setError('Please select at least one attribute to form a candidate key.');
      return;
    }

    // Check if this key already exists (order-insensitive set comparison)
    const newKeySet = new Set(selectedAttrs);
    const exists = candidateKeys.some(
      (k) => k.length === selectedAttrs.length && k.every((attr) => newKeySet.has(attr))
    );

    if (exists) {
      setError(`Candidate key (${selectedAttrs.join(', ')}) already exists.`);
      return;
    }

    onChange([...candidateKeys, [...selectedAttrs]]);
    setSelectedAttrs([]);
    setError(null);
  };

  const handleRemoveKey = (indexToRemove: number) => {
    onChange(candidateKeys.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-amber-500" />
            Candidate Keys
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Known candidate keys (optional). Can be auto-derived from dependencies.
          </p>
        </div>
        <Badge variant={candidateKeys.length > 0 ? 'accent' : 'neutral'} size="sm">
          {candidateKeys.length} {candidateKeys.length === 1 ? 'key' : 'keys'}
        </Badge>
      </div>

      {/* Attribute Multi-Select for New Key */}
      {attributes.length > 0 && (
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              Select attributes for new key:
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {selectedAttrs.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {attributes.map((attr) => {
              const isSelected = selectedAttrs.includes(attr);
              return (
                <button
                  key={attr}
                  type="button"
                  onClick={() => toggleAttributeSelection(attr)}
                  className={`px-2 py-0.5 rounded text-xs font-mono transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm ring-1 ring-amber-600'
                      : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400'
                  }`}
                >
                  {isSelected ? `✓ ${attr}` : attr}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={selectedAttrs.length === 0}
              onClick={handleAddKey}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              id="add-candidate-key-btn"
            >
              Add Candidate Key
            </Button>
            {selectedAttrs.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedAttrs([])}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-md border border-rose-200 dark:border-rose-900/60">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Candidate Keys List */}
      {candidateKeys.length === 0 ? (
        <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            <Info className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>No candidate key provided</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
            That's completely fine. Normalization Lab will calculate all minimal candidate keys
            automatically using functional dependency closures ($X^+$) during analysis.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {candidateKeys.map((keyAttrs, idx) => {
            // Check for orphaned attributes that are not in current relation R
            const unknownAttrs = keyAttrs.filter((a) => !attributes.includes(a));
            const hasOrphan = unknownAttrs.length > 0;

            return (
              <div
                key={idx}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                  hasOrphan
                    ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                      ({keyAttrs.join(', ')})
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                      User-provided (unverified)
                    </span>
                    {hasOrphan && (
                      <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-0.5">
                        <ShieldAlert className="w-3 h-3" />
                        Contains deleted: {unknownAttrs.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveKey(idx)}
                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors"
                  title="Remove candidate key"
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
