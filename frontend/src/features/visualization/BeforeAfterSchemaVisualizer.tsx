import React from 'react';
import { Database, CheckCircle2 } from 'lucide-react';
import type { RelationSchema, DecomposedRelation } from '../../types';

interface BeforeAfterSchemaVisualizerProps {
  originalSchema: RelationSchema;
  decomposedRelations: DecomposedRelation[];
  targetStage?: string;
}

export const BeforeAfterSchemaVisualizer: React.FC<BeforeAfterSchemaVisualizerProps> = ({
  originalSchema,
  decomposedRelations,
  targetStage = '3NF',
}) => {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Database className="w-4 h-4 text-indigo-500" />
          Before & After Normalization Schema Transformation
        </h3>
        <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold">
          Target: {targetStage}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* BEFORE: Original Schema */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
              BEFORE: {originalSchema.name}
            </span>
            <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
              Unnormalized
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            {originalSchema.attributes.map((attr) => {
              const isPk = (originalSchema.candidate_keys?.[0] || []).includes(attr);
              return (
                <div
                  key={attr}
                  className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{attr}</span>
                  {isPk ? (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                      🔑 PRIMARY KEY
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400">ATTRIBUTE</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* AFTER: Decomposed Relations */}
        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-900/60">
            <span className="text-xs font-bold font-mono text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              AFTER: {decomposedRelations.length} Normalized Relations
            </span>
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
              {targetStage} Normalized
            </span>
          </div>

          <div className="space-y-3">
            {decomposedRelations.map((rel, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/40 space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                  <span>{rel.name}</span>
                  <span className="text-[10px] font-sans text-slate-400 font-normal">
                    {rel.attributes.length} attrs
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {rel.attributes.map((attr) => {
                    const isPk = rel.primary_key?.includes(attr);
                    return (
                      <span
                        key={attr}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                          isPk
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isPk ? `🔑 ${attr}` : attr}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
