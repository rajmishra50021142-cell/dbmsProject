import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Key,
  Split,
  Layers,
  HelpCircle,
  ArrowRight,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';
import type { NF3Result } from '../../types';

interface NF3AnalysisCardProps {
  result: NF3Result;
}

export const NF3AnalysisCard: React.FC<NF3AnalysisCardProps> = ({ result }) => {
  const [showLogic, setShowLogic] = useState<boolean>(false);
  const [showDecomposition, setShowDecomposition] = useState<boolean>(true);

  const getStatusBadge = () => {
    switch (result.status) {
      case 'SATISFIED':
        return <Badge variant="success" size="md">3NF Satisfied</Badge>;
      case 'VIOLATED':
        return <Badge variant="error" size="md">3NF Violated</Badge>;
      case 'BLOCKED_BY_PREREQUISITE':
        return <Badge variant="warning" size="md">Blocked by 2NF</Badge>;
      default:
        return <Badge variant="neutral" size="md">{result.status}</Badge>;
    }
  };

  const getStatusHeaderIcon = () => {
    switch (result.status) {
      case 'SATISFIED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'VIOLATED':
        return <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'BLOCKED_BY_PREREQUISITE':
        return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center">
              {getStatusHeaderIcon()}
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Third Normal Form (3NF) Analysis
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Formal verification: determinant is a superkey OR dependent attribute is prime (transitive dependency elimination).
              </CardDescription>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Status Message */}
        <div
          className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
            result.status === 'SATISFIED'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-300'
              : result.status === 'VIOLATED'
              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-300'
              : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-300'
          }`}
        >
          <span className="font-bold">Evaluation Summary: </span>
          {result.message}
        </div>

        {/* 2NF Prerequisite Notice if Blocked */}
        {result.status === 'BLOCKED_BY_PREREQUISITE' && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              2NF Prerequisite Requirement
            </div>
            <p className="leading-relaxed">
              According to relational database normalization theory, a relation cannot be in 3NF unless it first
              satisfies 2NF (and 1NF). The dependency breakdown below evaluates 3NF conditions for educational guidance,
              even though official 3NF status is blocked.
            </p>
          </div>
        )}

        {/* Candidate Key & Attribute Context Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Key className="w-3 h-3 text-indigo-500" />
              Verified Candidate Keys ({result.candidate_keys.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {result.candidate_keys.map((key, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md font-mono text-[11px] border font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                >
                  ({key.join(', ')})
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Layers className="w-3 h-3 text-indigo-500" />
              Attribute Prime Status
            </span>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Prime:</span>
                {result.prime_attributes.length > 0 ? (
                  result.prime_attributes.map((attr) => (
                    <span
                      key={attr}
                      className="px-1.5 py-0.2 rounded bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-mono text-[10px]"
                    >
                      {attr}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">None</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Non-Prime:</span>
                {result.non_prime_attributes.length > 0 ? (
                  result.non_prime_attributes.map((attr) => (
                    <span
                      key={attr}
                      className="px-1.5 py-0.2 rounded bg-slate-200/80 dark:bg-slate-700/60 text-slate-800 dark:text-slate-300 font-mono text-[10px]"
                    >
                      {attr}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">None (All Prime)</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3NF Formal Rule Educational Box */}
        <div className="p-3 bg-slate-50/80 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-1">
          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            3NF Formal Rule: For every non-trivial FD X → A:
          </span>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-medium">
              Condition 1: X is a superkey (X⁺ = R)
            </span>
            <span className="font-bold">OR</span>
            <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 font-medium">
              Condition 2: A is a prime attribute (A ∈ CK)
            </span>
          </div>
        </div>

        {/* Detected Violations List (if any exist) */}
        {(result.violations || []).length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Detected 3NF Violations ({(result.violations || []).length})
              </h4>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Non-superkey determinants with non-prime dependents
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(result.violations || []).map((v, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="text-rose-600 dark:text-rose-400">({(v.determinant || []).join(', ')})</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-800 dark:text-slate-200">({(v.dependent_attributes || (v as any).dependent || []).join(', ')})</span>
                    </span>
                    <Badge variant="error" size="sm">
                      Non-Superkey & Non-Prime
                    </Badge>
                  </div>

                  {v.transitive_chain && (
                    <div className="text-[11px] bg-white dark:bg-slate-900 p-1.5 rounded border border-rose-100 dark:border-rose-950 text-slate-600 dark:text-slate-400 font-mono">
                      Transitive Chain: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{v.transitive_chain[0]}</span> → <span className="text-rose-600 dark:text-rose-400 font-bold">{v.transitive_chain[1]}</span> → <span className="text-slate-800 dark:text-slate-200 font-bold">{v.transitive_chain[2]}</span>
                    </div>
                  )}

                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {v.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyzed Functional Dependencies List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              Functional Dependencies Breakdown ({(result.dependencies_analyzed || (result as any).evaluated_dependencies || []).length})
            </h4>
            {(result.violations || []).length === 0 && (
              <button
                onClick={() => setShowLogic(!showLogic)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                id="toggle-3nf-logic-pass-btn"
              >
                {showLogic ? 'Hide Reasoning' : 'Show Logic / Trace'}
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {(result.dependencies_analyzed || (result as any).evaluated_dependencies || []).map((da: any, idx: number) => {
              const leftStr = da.functional_dependency?.left ? da.functional_dependency.left.join(', ') : (da.determinant ? da.determinant.join(', ') : '');
              const rightStr = da.functional_dependency?.right ? da.functional_dependency.right.join(', ') : (da.dependent ? da.dependent.join(', ') : (da.dependent_attributes ? da.dependent_attributes.join(', ') : ''));
              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {leftStr} → {rightStr}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {da.explanation}
                    </span>
                  </div>
                  <div>
                    {da.is_trivial ? (
                      <Badge variant="neutral" size="sm">Trivial</Badge>
                    ) : da.determinant_is_superkey ? (
                      <Badge variant="success" size="sm">Superkey Determinant</Badge>
                    ) : da.satisfies_3nf ? (
                      <Badge variant="accent" size="sm">Prime RHS Exception</Badge>
                    ) : (
                      <Badge variant="error" size="sm">3NF Violation</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step-by-Step Reasoning Trace */}
        {showLogic && (result.reasoning_steps || []).length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-indigo-500" />
              Step-by-Step 3NF Derivation Trace
            </h4>
            <div className="space-y-2 border-l-2 border-indigo-200 dark:border-indigo-800 pl-3">
              {result.reasoning_steps.map((step) => (
                <div key={step.step_number} className="space-y-0.5">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                    Step {step.step_number}: {step.title}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decomposition Proposal (if violations exist) */}
        {(() => {
          const decomp = result.decomposition_proposal || ((result as any).proposed_decompositions ? {
            verification_status: (result as any).proposed_decompositions[0]?.verification_status || 'NOT_YET_VERIFIED',
            explanation: 'Proposed decomposition to isolate non-superkey determinants and eliminate transitive dependencies.',
            proposed_relations: ((result as any).proposed_decompositions || []).map((r: any) => ({
              name: r.name,
              attributes: r.attributes || [],
              primary_key: r.primary_key || [],
              purpose: r.purpose || ''
            }))
          } : null);

          if (!decomp) return null;

          return (
            <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Split className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                    3NF Decomposition Proposal
                  </h4>
                  <Badge variant="warning" size="sm">
                    {decomp.verification_status}
                  </Badge>
                </div>
                <button
                  onClick={() => setShowDecomposition(!showDecomposition)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showDecomposition ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {showDecomposition && (
                <div className="space-y-3">
                  <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg text-indigo-900 dark:text-indigo-300 text-xs leading-relaxed">
                    <span className="font-bold">Proposed Normalization Strategy: </span>
                    {decomp.explanation}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {(decomp.proposed_relations || []).map((rel: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                            {rel.name}
                          </span>
                          <Badge variant="neutral" size="sm">
                            PK: ({(rel.primary_key || []).join(', ')})
                          </Badge>
                        </div>

                        <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-md">
                          {rel.name}({(rel.attributes || []).join(', ')})
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {rel.purpose}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>
                        Academic Note: Conceptual 3NF decomposition proposal. Formally synthesized with Bernstein's algorithm and verified in the Decomposition Workspace.
                      </span>
                    </div>
                    <a
                      href="#decomposition-workspace"
                      className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 flex items-center gap-1"
                    >
                      Inspect Formal Proof &rarr;
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
};

