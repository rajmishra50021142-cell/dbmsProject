import React from 'react';
import { Database, Key, ArrowRight, GitFork, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { RelationSchema } from '../../types';

interface SchemaPreviewProps {
  schema: RelationSchema;
}

export const SchemaPreview: React.FC<SchemaPreviewProps> = ({ schema }) => {
  const {
    name = 'R',
    attributes = [],
    candidate_keys = [],
    functional_dependencies = [],
    multivalued_dependencies = [],
  } = schema;

  // Track if any keys or dependencies reference attributes not present in attributes
  const attrSet = new Set(attributes);

  return (
    <div className="space-y-4">
      {/* Relational Signature */}
      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
          <Database className="w-3.5 h-3.5 text-indigo-500" />
          <span>Relational Signature</span>
        </div>
        <div className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 break-all">
          <span className="text-indigo-600 dark:text-indigo-400">{name || 'UNNAMED_RELATION'}</span>
          <span>(</span>
          {attributes.length === 0 ? (
            <span className="text-rose-500 dark:text-rose-400 italic text-xs font-normal">
              no attributes defined
            </span>
          ) : (
            attributes.map((attr, idx) => (
              <span key={attr}>
                <span className="text-slate-800 dark:text-slate-200">{attr}</span>
                {idx < attributes.length - 1 && <span className="text-slate-400">, </span>}
              </span>
            ))
          )}
          <span>)</span>
        </div>
      </div>

      {/* Candidate Keys Preview */}
      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Key className="w-3.5 h-3.5 text-amber-500" />
            Candidate Keys ({candidate_keys.length})
          </span>
        </div>
        {candidate_keys.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            None specified. Minimal candidate keys are computed automatically from functional dependencies.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {candidate_keys.map((keyGroup, idx) => {
              const hasInvalid = keyGroup.some((a) => !attrSet.has(a));
              return (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-medium ${
                    hasInvalid
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-xs'
                  }`}
                >
                  {hasInvalid && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                  ({keyGroup.join(', ')})
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Functional Dependencies Preview */}
      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
            Functional Dependencies ({functional_dependencies.length})
          </span>
        </div>
        {functional_dependencies.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            No functional dependencies defined.
          </p>
        ) : (
          <div className="space-y-1.5 font-mono text-xs">
            {functional_dependencies.map((fd, idx) => {
              const invalidLhs = fd.left.filter((a) => !attrSet.has(a));
              const invalidRhs = fd.right.filter((a) => !attrSet.has(a));
              const hasInvalid = invalidLhs.length > 0 || invalidRhs.length > 0;

              return (
                <div
                  key={fd.id || idx}
                  className={`flex items-center justify-between p-2 rounded border ${
                    hasInvalid
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{fd.left.join(', ')}</span>
                    <ArrowRight className="w-3 h-3 text-indigo-500" />
                    <span>{fd.right.join(', ')}</span>
                  </div>
                  {hasInvalid && (
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 flex items-center gap-1 font-sans">
                      <ShieldAlert className="w-3 h-3" />
                      Referential issue
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Multivalued Dependencies Preview */}
      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <GitFork className="w-3.5 h-3.5 text-purple-500" />
            Multivalued Dependencies ({multivalued_dependencies.length})
          </span>
        </div>
        {multivalued_dependencies.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            No multivalued dependencies defined.
          </p>
        ) : (
          <div className="space-y-1.5 font-mono text-xs">
            {multivalued_dependencies.map((mvd, idx) => {
              const invalidLhs = mvd.left.filter((a) => !attrSet.has(a));
              const invalidRhs = mvd.right.filter((a) => !attrSet.has(a));
              const hasInvalid = invalidLhs.length > 0 || invalidRhs.length > 0;

              return (
                <div
                  key={mvd.id || idx}
                  className={`flex items-center justify-between p-2 rounded border ${
                    hasInvalid
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{mvd.left.join(', ')}</span>
                    <span className="text-purple-600 dark:text-purple-400 font-bold">↠</span>
                    <span>{mvd.right.join(', ')}</span>
                  </div>
                  {hasInvalid && (
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 flex items-center gap-1 font-sans">
                      <ShieldAlert className="w-3 h-3" />
                      Referential issue
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
