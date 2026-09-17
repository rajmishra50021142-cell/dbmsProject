import React, { useState } from 'react';
import type { LosslessJoinResult } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight, Layers, HelpCircle } from 'lucide-react';

interface TableauChaseViewerProps {
  result: LosslessJoinResult;
}

export const TableauChaseViewer: React.FC<TableauChaseViewerProps> = ({ result }) => {
  const isChase = result.method === 'TABLEAU_CHASE';
  const totalSteps = result.chase_steps.length;

  // Step index: 0 = initial, 1..totalSteps = after step i, totalSteps + 1 = final
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(totalSteps > 0 ? 1 : 0);

  // Determine current matrix to render
  let currentTableau: string[][];
  let currentStep = null;

  if (currentStepIndex === 0 || totalSteps === 0) {
    currentTableau = result.initial_tableau;
  } else if (currentStepIndex <= totalSteps) {
    currentStep = result.chase_steps[currentStepIndex - 1];
    currentTableau = currentStep.tableau_snapshot;
  } else {
    currentTableau = result.final_tableau;
  }

  return (
    <div className="space-y-6">
      {/* Header & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-semibold text-slate-900 dark:text-white">
              {isChase ? 'Tableau Chase Lossless-Join Test' : "Fagin's Theorem Binary MVD Verification"}
            </h4>
            <Badge variant={result.is_lossless ? 'success' : 'error'}>
              {result.is_lossless ? 'Lossless Join Established' : 'Lossy Decomposition'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Method: {result.method === 'TABLEAU_CHASE' ? 'Tableau Chase Equivalence Equating' : "Fagin's Theorem"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {result.is_lossless ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>No Spurious Tuples</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 font-medium px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-800/60">
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Spurious Tuples Likely</span>
            </div>
          )}
        </div>
      </div>

      {/* Narrative Explanation */}
      <div className="p-4 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 leading-relaxed flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Formal Proof Rationale:</span> {result.reasoning}
        </div>
      </div>

      {isChase && currentTableau && currentTableau.length > 0 && (
        <div className="space-y-4">
          {/* Stepper Navigation */}
          {totalSteps > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>
                  Viewing state:{' '}
                  <strong className="text-slate-900 dark:text-white">
                    {currentStepIndex === 0
                      ? 'Initial Tableau'
                      : currentStepIndex <= totalSteps
                      ? `Step ${currentStepIndex} of ${totalSteps}`
                      : 'Final Fixed Point'}
                  </strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentStepIndex === 0}
                  onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                  className="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentStepIndex(0)}
                    className={`px-2 py-0.5 text-xs rounded font-mono ${
                      currentStepIndex === 0
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Init
                  </button>

                  {result.chase_steps.map((s, idx) => (
                    <button
                      key={s.step_number}
                      type="button"
                      onClick={() => setCurrentStepIndex(idx + 1)}
                      className={`px-2 py-0.5 text-xs rounded font-mono ${
                        currentStepIndex === idx + 1
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {s.step_number}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentStepIndex(totalSteps + 1)}
                    className={`px-2 py-0.5 text-xs rounded font-mono ${
                      currentStepIndex === totalSteps + 1
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    Final
                  </button>
                </div>

                <button
                  type="button"
                  disabled={currentStepIndex === totalSteps + 1}
                  onClick={() => setCurrentStepIndex((prev) => Math.min(totalSteps + 1, prev + 1))}
                  className="px-2.5 py-1 text-xs font-medium rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Current Step Description Callout */}
          {currentStep && (
            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 rounded-lg text-xs text-indigo-950 dark:text-indigo-200 flex items-center justify-between flex-wrap gap-2">
              <div>
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">Step {currentStep.step_number}:</span>{' '}
                {currentStep.explanation}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {currentStep.applied_fd && (
                  <Badge variant="accent" size="sm">
                    FD: {(currentStep.applied_fd.left || (currentStep.applied_fd as any).lhs || []).join(', ')} → {(currentStep.applied_fd.right || (currentStep.applied_fd as any).rhs || []).join(', ')}
                  </Badge>
                )}
                <Badge variant="success" size="sm">
                  Equated: {currentStep.equated_symbol}
                </Badge>
              </div>
            </div>
          )}

          {/* Tableau Matrix Grid */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 dark:bg-slate-800/75 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 w-48">
                    Decomposed Relation
                  </th>
                  {result.attributes.map((attr, cIdx) => (
                    <th
                      key={attr}
                      className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300 text-center font-mono border-r border-slate-200 dark:border-slate-800 last:border-r-0"
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{attr}</div>
                      <div className="text-[10px] text-slate-400 font-normal">a_{cIdx + 1}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {currentTableau.map((row, rIdx) => {
                  const isDistinguishedRow = result.is_lossless && result.distinguished_row_index === rIdx;
                  return (
                    <tr
                      key={result.relations[rIdx] || rIdx}
                      className={`transition-colors ${
                        isDistinguishedRow
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200 border-r border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{result.relations[rIdx] || `R${rIdx + 1}`}</span>
                          {isDistinguishedRow && (
                            <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>
                              Lossless Row
                            </Badge>
                          )}
                        </div>
                      </td>

                      {row.map((cell, cIdx) => {
                        const isDistinguished = cell.startsWith('a_');
                        return (
                          <td
                            key={cIdx}
                            className="py-2 px-3 text-center border-r border-slate-200/60 dark:border-slate-800/60 last:border-r-0"
                          >
                            <span
                              className={`inline-block px-2 py-0.5 rounded font-mono text-xs font-semibold ${
                                isDistinguished
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/80 shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {cell}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
            <div>
              Legend:{' '}
              <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono font-semibold mx-1">
                a_j
              </span>{' '}
              = Distinguished symbol (present in relation).{' '}
              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono mx-1">
                b_ij
              </span>{' '}
              = Non-distinguished symbol.
            </div>
            {result.distinguished_row_index !== null && (
              <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                Distinguished Row: #{result.distinguished_row_index! + 1}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
