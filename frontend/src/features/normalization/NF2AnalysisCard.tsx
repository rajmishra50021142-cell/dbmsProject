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
} from 'lucide-react';
import type { NF2Result } from '../../types';

interface NF2AnalysisCardProps {
  result: NF2Result;
}

export const NF2AnalysisCard: React.FC<NF2AnalysisCardProps> = ({ result }) => {
  const [showLogic, setShowLogic] = useState<boolean>(false);
  const [showDecomposition, setShowDecomposition] = useState<boolean>(true);

  const getStatusBadge = () => {
    switch (result.status) {
      case 'SATISFIED':
        return <Badge variant="success" size="md">2NF Satisfied</Badge>;
      case 'VIOLATED':
        return <Badge variant="error" size="md">2NF Violated</Badge>;
      case 'BLOCKED_BY_PREREQUISITE':
        return <Badge variant="warning" size="md">Blocked by 1NF</Badge>;
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
                Second Normal Form (2NF) Analysis
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Identification of partial functional dependencies on proper subsets of candidate keys.
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

        {/* 1NF Prerequisite Notice if Blocked */}
        {result.status === 'BLOCKED_BY_PREREQUISITE' && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              1NF Prerequisite Requirement
            </div>
            <p className="leading-relaxed">
              According to relational database normalization theory, a relation cannot be in 2NF unless it first
              satisfies 1NF. Resolve the identified multi-valued cell or repeating group issues above first.
              The functional dependency structure below shows partial dependencies detected for educational guidance.
            </p>
          </div>
        )}

        {/* Candidate Key & Attribute Context Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Key className="w-3 h-3 text-indigo-500" />
              Candidate Keys ({result.candidate_keys.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {result.candidate_keys.map((key, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-0.5 rounded-md font-mono text-[11px] border font-bold ${
                    key.length > 1
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                  }`}
                >
                  ({key.join(', ')}) {key.length > 1 && <span className="text-[9px] font-sans">COMPOSITE</span>}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Layers className="w-3 h-3 text-indigo-500" />
              Attribute Classification
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

        {/* Partial Dependencies List (if any exist) */}
        {result.partial_dependencies.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Detected Partial Dependencies ({result.partial_dependencies.length})
              </h4>
              <button
                onClick={() => setShowLogic(!showLogic)}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                id="toggle-2nf-logic-btn"
              >
                {showLogic ? 'Hide Reasoning' : 'Show Logic / Why?'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {result.partial_dependencies.map((pd, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="text-rose-600 dark:text-rose-400">({pd.determinant.join(', ')})</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-800 dark:text-slate-200">({pd.dependent_attributes.join(', ')})</span>
                    </span>
                    <Badge variant={pd.is_implied ? 'neutral' : 'error'} size="sm">
                      {pd.is_implied ? 'Implied via Closure' : 'Direct FD'}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Proper subset of candidate key: <span className="font-mono font-bold">({pd.affected_candidate_key.join(', ')})</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    {pd.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show Logic / Step-by-Step Reasoning Trace */}
        {showLogic && result.reasoning_steps.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-indigo-500" />
              Step-by-Step 2NF Derivation Trace
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

        {/* Decomposition Proposal (if partial dependencies exist) */}
        {result.decomposition_proposal && (
          <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Split className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  2NF Decomposition Proposal
                </h4>
                <Badge variant="warning" size="sm">
                  {result.decomposition_proposal.verification_status}
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
                  {result.decomposition_proposal.explanation}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {result.decomposition_proposal.proposed_relations.map((rel, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 text-xs shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                          {rel.name}
                        </span>
                        <Badge variant="neutral" size="sm">
                          PK: ({rel.primary_key.join(', ')})
                        </Badge>
                      </div>

                      <div className="font-mono text-[11px] text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-md">
                        {rel.name}({rel.attributes.join(', ')})
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
                      Academic Note: Conceptual 2NF decomposition proposal. Formal Tableau Chase and Dependency Preservation are verified in the Decomposition Workspace.
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
        )}
      </CardContent>
    </Card>
  );
};
