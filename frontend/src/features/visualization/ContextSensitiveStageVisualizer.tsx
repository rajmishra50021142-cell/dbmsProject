import React from 'react';
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Table,
  GitBranch,
} from 'lucide-react';
import type { RelationSchema, FullNormalizationAnalysisResult, SelectedEntity } from '../../types';

interface ContextSensitiveStageVisualizerProps {
  stage: '1NF' | '2NF' | '3NF' | '4NF';
  schema: RelationSchema;
  analysisResult?: FullNormalizationAnalysisResult | null;
  onSelectEntity?: (entity: SelectedEntity) => void;
}

export const ContextSensitiveStageVisualizer: React.FC<ContextSensitiveStageVisualizerProps> = ({
  stage,
  schema,
  analysisResult,
  onSelectEntity,
}) => {
  // ---------------------------------------------------------------------------
  // 1NF VISUALIZER
  // ---------------------------------------------------------------------------
  if (stage === '1NF') {
    const nf1 = analysisResult?.nf1;
    const hasSampleData = (schema.sample_data && schema.sample_data.length > 0) || false;
    const violations = nf1?.violations || [];

    if (!hasSampleData) {
      return (
        <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Table className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            No Sample Tuples Supplied
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            1NF requires atomic values in every cell. Because no sample rows were provided, cell-level atomicity cannot be empirically tested. You can add sample rows in the Sample Data tab.
          </p>
        </div>
      );
    }

    return (
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Table className="w-4 h-4 text-indigo-500" />
            1NF Cell Atomicity Inspection
          </h3>
          <span className="text-xs font-mono text-slate-500">
            {schema.sample_data?.length || 0} sample row(s)
          </span>
        </div>

        {violations.length > 0 ? (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300">
              <strong>Non-Atomic Cells Detected: </strong>
              Found {violations.length} cell(s) containing composite or repeating values (e.g. lists, comma-separated tokens).
            </div>

            {/* Side-by-Side Comparison per Section 51 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20 space-y-2">
                <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider">
                  Before (Violating Cell)
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-[11px] text-slate-500">
                        {schema.attributes.map((a) => (
                          <th key={a} className="p-1.5">{a}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(schema.sample_data || []).slice(0, 3).map((row, i) => {
                        const vals = (row as any).values || row;
                        return (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-800/60">
                            {schema.attributes.map((a) => {
                              const val = vals[a];
                              const isOffending = violations.some((v) => v.attribute === a && v.row_index === i);
                              return (
                                <td
                                  key={a}
                                  className={`p-1.5 ${isOffending ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 font-bold rounded' : ''}`}
                                >
                                  {String(val ?? '')}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  After (1NF Unnested Atomic Representation)
                </span>
                <div className="p-3 rounded-lg bg-white dark:bg-slate-950 border border-emerald-100 dark:border-emerald-900/60 font-mono text-xs text-slate-700 dark:text-slate-300">
                  {nf1?.transformation?.transformed_tuples ? (
                    <span>Each repeating item becomes a separate discrete row with single atomic values.</span>
                  ) : (
                    <span>Attributes unnested into atomic scalar tuples.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            All inspected sample tuples contain atomic values. 1NF satisfied.
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2NF VISUALIZER
  // ---------------------------------------------------------------------------
  if (stage === '2NF') {
    const nf2 = analysisResult?.nf2;
    const partials = nf2?.partial_dependencies || [];

    return (
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-500" />
            2NF Partial Dependency Structural Breakdown
          </h3>
          <span className="text-xs font-mono text-slate-500">
            {partials.length} Partial Dependency Violation{partials.length !== 1 ? 's' : ''}
          </span>
        </div>

        {partials.length > 0 ? (
          <div className="space-y-3">
            {partials.map((p, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-3 cursor-pointer hover:border-rose-300 transition-colors"
                onClick={() =>
                  onSelectEntity?.({
                    type: 'dependency',
                    formula: `${p.determinant.join(', ')} → ${p.dependent_attributes.join(', ')}`,
                    left: p.determinant,
                    right: p.dependent_attributes,
                    kind: 'fd',
                    isViolation: true,
                    violationStage: '2NF',
                    explanation: p.explanation,
                  })
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded">
                      {p.determinant.join(', ')} → {p.dependent_attributes.join(', ')}
                    </span>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400">
                      (Partial Dependency)
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    Key: ({p.affected_candidate_key.join(', ')})
                  </span>
                </div>

                {/* Section 53: Visual Guided Discovery */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="px-2 py-1 rounded bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold">
                    Key: ({p.affected_candidate_key.join(', ')})
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="px-2 py-1 rounded bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 font-bold">
                    Proper Subset: {'{'}{p.determinant.join(', ')}{'}'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    Non-Prime: {'{'}{p.dependent_attributes.join(', ')}{'}'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">{p.explanation}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            No partial dependencies found on any candidate key. 2NF satisfied.
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3NF VISUALIZER
  // ---------------------------------------------------------------------------
  if (stage === '3NF') {
    const nf3 = analysisResult?.nf3;
    const violations = nf3?.violations || [];

    return (
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-indigo-500" />
            3NF Transitive Dependency & Determinant Superkey Check
          </h3>
          <span className="text-xs font-mono text-slate-500">
            {violations.length} 3NF Violation{violations.length !== 1 ? 's' : ''}
          </span>
        </div>

        {violations.length > 0 ? (
          <div className="space-y-3">
            {violations.map((v, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-3 cursor-pointer hover:border-rose-300 transition-colors"
                onClick={() =>
                  onSelectEntity?.({
                    type: 'dependency',
                    formula: `${v.determinant.join(', ')} → ${v.dependent_attributes.join(', ')}`,
                    left: v.determinant,
                    right: v.dependent_attributes,
                    kind: 'fd',
                    isViolation: true,
                    violationStage: '3NF',
                    explanation: v.explanation,
                  })
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded">
                    {v.determinant.join(', ')} → {v.dependent_attributes.join(', ')}
                  </span>
                  {v.transitive_chain && (
                    <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                      Chain: {v.transitive_chain.join(' → ')}
                    </span>
                  )}
                </div>

                {/* Section 54: Formal 3NF Test Visual */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Test 1: Determinant Superkey</span>
                    <div className="mt-1 flex items-center gap-1.5 font-mono text-rose-600 dark:text-rose-400 font-bold">
                      <span>✗ ({v.determinant.join(', ')})⁺ ≠ R (Not a superkey)</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Test 2: Dependent Prime Status</span>
                    <div className="mt-1 flex items-center gap-1.5 font-mono text-rose-600 dark:text-rose-400 font-bold">
                      <span>✗ {'{'}{v.dependent_attributes.join(', ')}{'}'} are non-prime</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">{v.explanation}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Every non-trivial FD has a superkey determinant or prime dependent. 3NF satisfied.
          </div>
        )}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 4NF VISUALIZER
  // ---------------------------------------------------------------------------
  if (stage === '4NF') {
    const nf4 = analysisResult?.nf4;
    const violations = nf4?.violations || [];

    return (
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <GitBranch className="w-4 h-4 text-indigo-500" />
            4NF Multivalued Dependency & Cartesian Redundancy Check
          </h3>
          <span className="text-xs font-mono text-slate-500">
            {violations.length} 4NF Violation{violations.length !== 1 ? 's' : ''}
          </span>
        </div>

        {violations.length > 0 ? (
          <div className="space-y-3">
            {violations.map((v, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-3 cursor-pointer hover:border-rose-300 transition-colors"
                onClick={() =>
                  onSelectEntity?.({
                    type: 'dependency',
                    formula: `${v.mvd.left.join(', ')} ↠ ${v.mvd.right.join(', ')}`,
                    left: v.mvd.left,
                    right: v.mvd.right,
                    kind: 'mvd',
                    isViolation: true,
                    violationStage: '4NF',
                    explanation: v.explanation,
                  })
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded">
                    {v.mvd.left.join(', ')} ↠ {v.mvd.right.join(', ')}
                  </span>
                  <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400">
                    Non-trivial MVD
                  </span>
                </div>

                {/* Section 55 & 56: MVD Visual Storytelling */}
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    Determinant: ({v.mvd.left.join(', ')}) is NOT a superkey.
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    This MVD models independent multi-valued facts in a single table, forcing a Cartesian product of tuples and anomalous redundancy.
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400">{v.explanation}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            No non-trivial MVDs violate superkey requirements. 4NF satisfied.
          </div>
        )}
      </div>
    );
  }

  return null;
};
