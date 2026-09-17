import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle2, AlertTriangle, XCircle, Clock } from 'lucide-react';
import type { NFStatus } from '../../types';

interface NormalizationJourneyStepperProps {
  nf1Status?: NFStatus;
  nf2Status?: NFStatus;
  nf3Status?: NFStatus;
  nf4Status?: NFStatus;
  activeStage: '1NF' | '2NF' | '3NF' | '4NF';
  onSelectStage: (stage: '1NF' | '2NF' | '3NF' | '4NF') => void;
}

export const NormalizationJourneyStepper: React.FC<NormalizationJourneyStepperProps> = ({
  nf1Status,
  nf2Status,
  nf3Status,
  nf4Status,
  activeStage,
  onSelectStage,
}) => {
  const getStatusIcon = (status?: NFStatus) => {
    switch (status) {
      case 'SATISFIED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'VIOLATED':
        return <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
      case 'BLOCKED_BY_PREREQUISITE':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'INSUFFICIENT_DATA':
        return <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status?: NFStatus) => {
    switch (status) {
      case 'SATISFIED':
        return <Badge variant="success" size="sm">Satisfied</Badge>;
      case 'VIOLATED':
        return <Badge variant="error" size="sm">Violated</Badge>;
      case 'BLOCKED_BY_PREREQUISITE':
        return <Badge variant="warning" size="sm">Blocked</Badge>;
      case 'INSUFFICIENT_DATA':
        return <Badge variant="info" size="sm">Unverified</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Ready</Badge>;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Normalization Stage Progress
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comprehensive evaluation: 1NF atomicity, 2NF partials, 3NF transitives, and 4NF MVDs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* Stage 1NF */}
        <button
          id="stage-step-1nf"
          data-testid="stage-step-1nf"
          onClick={() => onSelectStage('1NF')}
          className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
            activeStage === '1NF'
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs ring-1 ring-indigo-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              1NF {getStatusIcon(nf1Status)}
            </span>
            {getStatusBadge(nf1Status)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Atomic values & repeating groups
          </span>
        </button>

        {/* Stage 2NF */}
        <button
          id="stage-step-2nf"
          data-testid="stage-step-2nf"
          onClick={() => onSelectStage('2NF')}
          className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
            activeStage === '2NF'
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs ring-1 ring-indigo-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              2NF {getStatusIcon(nf2Status)}
            </span>
            {getStatusBadge(nf2Status)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Partial dependency elimination
          </span>
        </button>

        {/* Stage 3NF */}
        <button
          id="stage-step-3nf"
          data-testid="stage-step-3nf"
          onClick={() => onSelectStage('3NF')}
          className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
            activeStage === '3NF'
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs ring-1 ring-indigo-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              3NF {getStatusIcon(nf3Status)}
            </span>
            {getStatusBadge(nf3Status)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Transitive dependencies & prime keys
          </span>
        </button>

        {/* Stage 4NF */}
        <button
          id="stage-step-4nf"
          data-testid="stage-step-4nf"
          onClick={() => onSelectStage('4NF')}
          className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
            activeStage === '4NF'
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-xs ring-1 ring-indigo-500/20'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              4NF {getStatusIcon(nf4Status)}
            </span>
            {getStatusBadge(nf4Status)}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Multivalued dependencies & Cartesian redundancy
          </span>
        </button>
      </div>
    </div>
  );
};
