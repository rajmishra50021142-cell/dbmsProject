import React from 'react';
import {
  Database,
  Key,
  ArrowRight,
  GitFork,
  AlertTriangle,
  ShieldAlert,
  FileSpreadsheet,
  Table,
  Info,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
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
    sample_data = [],
    source = 'raw',
    source_metadata,
  } = schema;

  // Track if any keys or dependencies reference attributes not present in attributes
  const attrSet = new Set(attributes);
  const sampleRowCount = sample_data.length;
  const isExcel = source === 'excel';

  return (
    <div className="space-y-4">
      {/* Source & Provenance Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center gap-2">
          {isExcel ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-mono">
                {source_metadata?.filename || 'Excel Workbook'}
              </span>
              {source_metadata?.worksheet && (
                <span className="text-slate-500 font-sans font-normal">
                  [{source_metadata.worksheet}]
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Input Source: Raw DBMS Notation</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isExcel && (
            <Badge variant="success" size="sm">
              {source_metadata?.mode === 'modeA' ? 'Mode A: Linked Data' : 'Mode B: Discovered Schema'}
            </Badge>
          )}
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Table className="w-3 h-3" />
            {sampleRowCount > 0
              ? `${sampleRowCount} row${sampleRowCount === 1 ? '' : 's'}${
                  source_metadata?.total_rows && source_metadata.total_rows > sampleRowCount
                    ? ` (of ${source_metadata.total_rows})`
                    : ''
                }`
              : '0 tuples'}
          </span>
        </div>
      </div>

      {/* Relational Signature */}
      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span>Relational Signature</span>
          </div>
          <span className="font-mono text-[11px] font-normal text-slate-400">
            {attributes.length} attribute{attributes.length === 1 ? '' : 's'}
          </span>
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

      {/* Missing Constraints Notice if FDs are not yet confirmed */}
      {functional_dependencies.length === 0 && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div>
            <span className="font-bold">Schema Loaded — Awaiting Confirmed Dependencies</span>
            <p className="mt-0.5 text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
              {isExcel
                ? 'Relational attributes established from Excel worksheet. Confirm functional dependencies in the Excel Manager tab to complete formal candidate key, closure, and 1NF–4NF normalization analysis.'
                : 'Define functional dependencies in Raw Notation to derive minimal candidate keys and enable formal 2NF–4NF decomposition.'}
            </p>
          </div>
        </div>
      )}

      {/* Candidate Keys Preview */}
      <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
        <div className="flex items-center justify-between mb-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <Key className="w-3.5 h-3.5 text-amber-500" />
            Candidate Keys ({candidate_keys.length})
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {candidate_keys.length > 0 ? 'Confirmed' : 'Auto-Derived by Engine'}
          </span>
        </div>
        {candidate_keys.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            {functional_dependencies.length > 0
              ? 'None manually specified. Minimal candidate keys are computed automatically from functional dependencies.'
              : 'No candidate keys specified. Provide functional dependencies to derive minimal keys.'}
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
          <span className="text-[11px] text-slate-400 font-mono">
            {functional_dependencies.length} confirmed
          </span>
        </div>
        {functional_dependencies.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            No confirmed functional dependencies defined.
          </p>
        ) : (
          <div className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto pr-1">
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
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {fd.left.join(', ')}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
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
      {multivalued_dependencies.length > 0 && (
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <GitFork className="w-3.5 h-3.5 text-purple-500" />
              Multivalued Dependencies ({multivalued_dependencies.length})
            </span>
          </div>
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
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {mvd.left.join(', ')}
                    </span>
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
        </div>
      )}

      {/* Observed Findings / Empirical Hints if coming from Excel */}
      {isExcel && source_metadata?.unconfirmed_fds && source_metadata.unconfirmed_fds.length > 0 && (
        <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-700 dark:text-indigo-300">
            <Info className="w-3.5 h-3.5" />
            <span>Observed Empirical Data Patterns ({source_metadata.unconfirmed_fds.length} suggestions)</span>
          </div>
          <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80 leading-relaxed">
            These patterns were detected empirically from sample spreadsheet rows. They are not formal constraints until confirmed in the Excel Manager tab.
          </p>
        </div>
      )}
    </div>
  );
};
