import React from 'react';
import { Key, Circle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const VisualizationLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 text-xs shadow-2xs backdrop-blur-xs">
      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">→</span>
        <span>Functional Dependency</span>
      </div>

      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
        <span className="font-mono font-bold text-purple-600 dark:text-purple-400">↠</span>
        <span>Multivalued Dependency</span>
      </div>

      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
        <Key className="w-3.5 h-3.5 text-amber-500" />
        <span>Candidate Key</span>
      </div>

      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
        <span>Prime Attribute</span>
      </div>

      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
        <Circle className="w-2.5 h-2.5 text-slate-400" />
        <span>Non-Prime Attribute</span>
      </div>

      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
        <AlertTriangle className="w-3 h-3 text-rose-500" />
        <span>Normal Form Violation</span>
      </div>

      <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
        <span>Formally Verified</span>
      </div>
    </div>
  );
};
