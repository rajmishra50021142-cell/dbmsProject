import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Info,
  Sparkles,
  Key,
  Layers,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { ValidationResult, RelationSchema } from '../../types';

interface ValidationSummaryPanelProps {
  schema: RelationSchema;
  validationResult: ValidationResult | null;
  isValidating: boolean;
  onValidate: () => void;
}

export const ValidationSummaryPanel: React.FC<ValidationSummaryPanelProps> = ({
  schema,
  validationResult,
  isValidating,
  onValidate,
}) => {
  const hasRelationName = Boolean(schema.name?.trim());
  const hasAttributes = schema.attributes.length > 0;
  const hasCandidateKeys = (schema.candidate_keys || []).length > 0;
  const hasFds = schema.functional_dependencies.length > 0;
  const hasMvds = schema.multivalued_dependencies.length > 0;
  const hasSampleData = (schema.sample_data || []).length > 0;

  const errors = validationResult?.errors || [];
  const warnings = validationResult?.warnings || [];
  const isReady = validationResult ? validationResult.valid : hasRelationName && hasAttributes;

  return (
    <div className="space-y-4">
      {/* Ready Status Card */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          isReady
            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
            : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isReady ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                {isReady ? 'Ready for Analysis' : 'Issues Require Attention'}
              </h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                {isReady
                  ? 'Schema meets all canonical structural requirements.'
                  : `${errors.length} blocking ${errors.length === 1 ? 'error' : 'errors'} must be resolved.`}
              </p>
            </div>
          </div>
          <Badge variant={isReady ? 'success' : 'error'} size="sm">
            {isReady ? 'Pass' : 'Failed'}
          </Badge>
        </div>

        {isReady && (
          <div className="mt-3 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
            <Link to="/normalize" id="summary-launch-normalize-btn" className="block">
              <Button
                variant="primary"
                size="sm"
                className="w-full justify-center text-xs shadow-xs"
                leftIcon={<Layers className="w-3.5 h-3.5" />}
              >
                Normalization Lab (1NF–4NF) &rarr;
              </Button>
            </Link>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/closure" id="summary-launch-closure-btn" className="block">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-[11px]"
                  leftIcon={<Sparkles className="w-3 h-3 text-indigo-500" />}
                >
                  Closure Lab
                </Button>
              </Link>
              <Link to="/keys" id="summary-launch-keys-btn" className="block">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center text-[11px]"
                  leftIcon={<Key className="w-3 h-3 text-indigo-500" />}
                >
                  Keys Lab
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Structural Checklist */}
      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Structural Checklist
        </span>
        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              {hasRelationName ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
              )}
              Relation Name
            </span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">
              {schema.name || 'Missing'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              {hasAttributes ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-rose-500" />
              )}
              Attributes
            </span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">
              {schema.attributes.length} defined
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              {hasCandidateKeys ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Info className="w-3.5 h-3.5 text-slate-400" />
              )}
              Candidate Keys
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {hasCandidateKeys
                ? `${(schema.candidate_keys || []).length} provided`
                : 'Auto-derived'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              {hasFds ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Info className="w-3.5 h-3.5 text-slate-400" />
              )}
              Functional Dependencies
            </span>
            <span className="text-slate-900 dark:text-slate-100 font-semibold">
              {schema.functional_dependencies.length} FDs
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              {hasMvds ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
              ) : (
                <Info className="w-3.5 h-3.5 text-slate-400" />
              )}
              Multivalued Dependencies
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {schema.multivalued_dependencies.length} MVDs
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              {hasSampleData ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Info className="w-3.5 h-3.5 text-slate-400" />
              )}
              Sample Tuples
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {(schema.sample_data || []).length} rows
            </span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full"
            onClick={onValidate}
            isLoading={isValidating}
            leftIcon={<RefreshCw className="w-3 h-3" />}
            id="run-validation-btn"
          >
            Validate With Backend
          </Button>
        </div>
      </div>

      {/* Errors Section */}
      {errors.length > 0 && (
        <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 dark:text-rose-300">
            <XCircle className="w-3.5 h-3.5" />
            <span>Blocking Errors ({errors.length})</span>
          </div>
          <ul className="space-y-1.5 text-xs text-rose-800 dark:text-rose-300">
            {errors.map((err, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="font-mono text-[10px] bg-rose-200 dark:bg-rose-900 px-1 py-0.5 rounded shrink-0">
                  {err.code}
                </span>
                <span className="text-[11px] leading-tight">{err.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Pedagogical Warnings ({warnings.length})</span>
          </div>
          <ul className="space-y-1.5 text-xs text-amber-800 dark:text-amber-300">
            {warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="font-mono text-[10px] bg-amber-200 dark:bg-amber-900 px-1 py-0.5 rounded shrink-0">
                  {w.code}
                </span>
                <span className="text-[11px] leading-tight">{w.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
