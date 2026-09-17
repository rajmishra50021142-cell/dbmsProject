import React from 'react';
import { HelpCircle, Key, GitCommit, AlertTriangle, ArrowRight } from 'lucide-react';

interface EvidenceCardProps {
  title: string;
  category: 'key' | 'dependency' | 'violation' | 'closure';
  primaryText: string;
  secondaryText?: string;
  badge?: string;
  badgeType?: 'success' | 'danger' | 'warning' | 'neutral';
  onExplainWhy?: () => void;
  onExplore?: () => void;
  exploreLabel?: string;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  title,
  category,
  primaryText,
  secondaryText,
  badge,
  badgeType = 'neutral',
  onExplainWhy,
  onExplore,
  exploreLabel = 'Explore',
}) => {
  const getCategoryIcon = () => {
    switch (category) {
      case 'key':
        return <Key className="w-4 h-4 text-amber-500" />;
      case 'violation':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      case 'closure':
        return <GitCommit className="w-4 h-4 text-indigo-500" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBadgeClass = () => {
    switch (badgeType) {
      case 'success':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'danger':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {getCategoryIcon()}
          <span>{title}</span>
        </div>
        {badge && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getBadgeClass()}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
        {primaryText}
      </div>

      {secondaryText && (
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
          {secondaryText}
        </p>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {onExplainWhy && (
          <button
            type="button"
            onClick={onExplainWhy}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Explain Why
          </button>
        )}
        {onExplore && (
          <button
            type="button"
            onClick={onExplore}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ml-auto"
          >
            <span>{exploreLabel}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
