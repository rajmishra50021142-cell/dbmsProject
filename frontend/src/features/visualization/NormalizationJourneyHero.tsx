import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, ArrowRight, HelpCircle, FlaskConical } from 'lucide-react';
import type { NFStatus } from '../../types';

interface NormalizationJourneyHeroProps {
  activeStage: '1NF' | '2NF' | '3NF' | '4NF';
  onSelectStage: (stage: '1NF' | '2NF' | '3NF' | '4NF') => void;
  nf1Status?: NFStatus | string;
  nf2Status?: NFStatus | string;
  nf3Status?: NFStatus | string;
  nf4Status?: NFStatus | string;
  violationCount?: number;
  summaryVerdict?: string;
  onExplainWhy?: (stage: '1NF' | '2NF' | '3NF' | '4NF') => void;
  onOpenExperiment?: () => void;
}

export const NormalizationJourneyHero: React.FC<NormalizationJourneyHeroProps> = ({
  activeStage,
  onSelectStage,
  nf1Status = 'SATISFIED',
  nf2Status = 'VIOLATED',
  nf3Status = 'NOT_EVALUATED',
  nf4Status = 'NOT_EVALUATED',
  violationCount = 0,
  onExplainWhy,
  onOpenExperiment,
}) => {
  const stages: Array<{ id: '1NF' | '2NF' | '3NF' | '4NF'; label: string; status: NFStatus | string; condition: string }> = [
    {
      id: '1NF',
      label: 'First Normal Form',
      status: nf1Status,
      condition: 'Atomic cells (no multi-valued attributes or repeating groups)',
    },
    {
      id: '2NF',
      label: 'Second Normal Form',
      status: nf2Status,
      condition: '1NF + No partial dependencies on any composite candidate key',
    },
    {
      id: '3NF',
      label: 'Third Normal Form',
      status: nf3Status,
      condition: '2NF + For every X → A: X is superkey OR A is prime',
    },
    {
      id: '4NF',
      label: 'Fourth Normal Form',
      status: nf4Status,
      condition: '3NF + For every X ↠ Y: X is superkey',
    },
  ];

  const currentStageInfo = stages.find((s) => s.id === activeStage) || stages[1];

  const getStatusIcon = (status: NFStatus | string) => {
    switch (status) {
      case 'SATISFIED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'VIOLATED':
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'BLOCKED_BY_PREREQUISITE':
      case 'INSUFFICIENT_DATA':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <span className="w-3 h-3 rounded-full border border-slate-400 dark:border-slate-500" />;
    }
  };

  const getStatusBadge = (status: NFStatus | string) => {
    switch (status) {
      case 'SATISFIED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" /> Satisfied
          </span>
        );
      case 'VIOLATED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5" /> Violated
          </span>
        );
      case 'BLOCKED_BY_PREREQUISITE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" /> Prerequisite Required
          </span>
        );
      case 'INSUFFICIENT_DATA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <AlertTriangle className="w-3.5 h-3.5" /> Needs Data
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-5 space-y-4">
      {/* 1NF -> 2NF -> 3NF -> 4NF Journey Track */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Interactive Normalization Journey
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          {stages.map((stage, idx) => {
            const isActive = stage.id === activeStage;
            return (
              <React.Fragment key={stage.id}>
                <button
                  onClick={() => onSelectStage(stage.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {getStatusIcon(stage.status)}
                  <span className="font-mono font-bold">{stage.id}</span>
                </button>
                {idx < stages.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hidden sm:inline-block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Stage Hero Headline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              {currentStageInfo.id} Context
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {currentStageInfo.label}
            </h2>
            {getStatusBadge(currentStageInfo.status)}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {currentStageInfo.condition}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onExplainWhy && (
            <button
              type="button"
              onClick={() => onExplainWhy(activeStage)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why {currentStageInfo.status === 'VIOLATED' ? 'Failed?' : 'Satisfied?'}</span>
            </button>
          )}

          {onOpenExperiment && (
            <button
              type="button"
              onClick={onOpenExperiment}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Experiment</span>
            </button>
          )}

          {violationCount > 0 && currentStageInfo.status === 'VIOLATED' && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-mono font-bold text-center">
              {violationCount} Violation{violationCount > 1 ? 's' : ''} Detected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
