import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Split,
  Layers,
  HelpCircle,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
} from 'lucide-react';
import type { NF4Result } from '../../types';

interface NF4AnalysisCardProps {
  result: NF4Result;
}

export const NF4AnalysisCard: React.FC<NF4AnalysisCardProps> = ({ result }) => {
  const [showLogic, setShowLogic] = useState<boolean>(false);
  const [showDecomposition, setShowDecomposition] = useState<boolean>(true);
  const [showMVDTheory, setShowMVDTheory] = useState<boolean>(false);

  const getStatusBadge = () => {
    switch (result.status) {
      case 'SATISFIED':
        return <Badge variant="success" size="md">4NF Satisfied</Badge>;
      case 'VIOLATED':
        return <Badge variant="error" size="md">4NF Violated</Badge>;
      case 'BLOCKED_BY_PREREQUISITE':
        return <Badge variant="warning" size="md">Blocked by 3NF</Badge>;
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

  const mvdsToDisplay = result.mvds_analyzed || (result as any).evaluated_mvds || [];
  const violations = result.violations || [];
  const decomp = result.decomposition_proposal || ((result as any).proposed_decompositions ? {
    verification_status: (result as any).proposed_decompositions[0]?.verification_status || 'NOT_YET_VERIFIED',
    explanation: 'Splits independent multivalued facts into distinct projected schemas.',
    proposed_relations: ((result as any).proposed_decompositions || []).map((r: any) => ({
      name: r.name,
      attributes: r.attributes || [],
      primary_key: r.primary_key || [],
      purpose: r.purpose || ''
    }))
  } : null);

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
                Fourth Normal Form (4NF) Analysis
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Multivalued Dependency (MVD) analysis & Cartesian redundancy elimination.
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

        {/* 3NF Prerequisite Notice if Blocked */}
        {result.status === 'BLOCKED_BY_PREREQUISITE' && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              3NF Prerequisite Requirement
            </div>
            <p className="leading-relaxed">
              According to relational database normalization theory, a relation cannot be in 4NF unless it first
              satisfies 3NF (and 2NF & 1NF). The MVD analysis below details whether your schema contains independent
              multivalued facts, even though official 4NF certification is blocked.
            </p>
          </div>
        )}

        {/* MVD Theory Toggle */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowMVDTheory(!showMVDTheory)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              Understanding 4NF & Multivalued Dependencies (MVD)
            </span>
            {showMVDTheory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showMVDTheory && (
            <div className="p-3.5 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 space-y-2.5 border-t border-slate-200 dark:border-slate-800 leading-relaxed">
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100">Formal Definition: </span>
                A relation schema <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">R</code> is in 4NF if it is in 3NF (or BCNF) and for every non-trivial multivalued dependency{' '}
                <code className="px-1 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded font-mono text-[11px]">X ↠ Y</code>, <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">X</code> is a <strong>superkey</strong> of <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[11px]">R</code>.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    When is an MVD Trivial?
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    <code className="font-mono">X ↠ Y</code> is trivial if <code className="font-mono">Y ⊆ X</code> (subset) or <code className="font-mono">X ∪ Y = R</code> (spans all attributes). Trivial MVDs always hold and never cause redundancy.
                  </p>
                </div>
                <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    The Cartesian Redundancy Trap
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    When a relation stores two independent 1:N or M:N relationships (e.g. Course ↠ Teacher and Course ↠ Text), every combination of Teacher and Text must be stored, generating a combinatorial explosion of duplicate tuples.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Violations Section */}
        {violations.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              Detected 4NF Violations ({violations.length})
            </h4>

            <div className="space-y-2.5">
              {violations.map((violation: any, idx: number) => {
                const det = (violation.determinant || []).join(', ');
                const dep = (violation.dependent_attributes || violation.dependent || []).join(', ');
                return (
                  <div
                    key={idx}
                    className="p-3 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-lg space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-mono font-bold text-rose-800 dark:text-rose-300">
                        <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/60 rounded text-[11px]">
                          {det}
                        </span>
                        <span>↠</span>
                        <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-900/60 rounded text-[11px]">
                          {dep}
                        </span>
                      </div>
                      <Badge variant="error" size="sm">4NF Violation</Badge>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                      {violation.explanation}
                    </p>

                    {violation.redundancy_impact && (
                      <div className="p-2 bg-white/80 dark:bg-slate-900/60 border border-rose-200/60 dark:border-rose-900/40 rounded text-[11px] space-y-1">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <Layers className="w-3 h-3 text-indigo-500" />
                          Multivalued Redundancy Impact:
                        </div>
                        <p className="text-slate-600 dark:text-slate-400">
                          {violation.redundancy_impact}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Evaluated MVDs Table / List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-indigo-500" />
              Multivalued Dependencies Evaluated ({mvdsToDisplay.length})
            </h4>
            {mvdsToDisplay.length > 0 && (
              <button
                type="button"
                onClick={() => setShowLogic(!showLogic)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                {showLogic ? 'Hide details' : 'Show details'}
                {showLogic ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>

          {mvdsToDisplay.length === 0 ? (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-lg text-xs text-slate-500 dark:text-slate-400 italic">
              No multivalued dependencies (MVDs) specified in this schema. When no non-trivial MVDs exist and 3NF holds, the relation trivially satisfies 4NF.
            </div>
          ) : (
            <div className="space-y-1.5">
              {mvdsToDisplay.map((mvdAnalysis: any, idx: number) => {
                const isViolation = mvdAnalysis.satisfies_4nf === false;
                const leftStr = mvdAnalysis.mvd?.left ? mvdAnalysis.mvd.left.join(', ') : (mvdAnalysis.determinant ? mvdAnalysis.determinant.join(', ') : '');
                const rightStr = mvdAnalysis.mvd?.right ? mvdAnalysis.mvd.right.join(', ') : (mvdAnalysis.dependent ? mvdAnalysis.dependent.join(', ') : (mvdAnalysis.dependent_attributes ? mvdAnalysis.dependent_attributes.join(', ') : ''));

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border text-xs transition-colors ${
                      isViolation
                        ? 'bg-rose-50/40 dark:bg-rose-950/15 border-rose-200 dark:border-rose-900/50'
                        : 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {leftStr}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">↠</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {rightStr}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {mvdAnalysis.is_trivial ? (
                          <Badge variant="neutral" size="sm">Trivial MVD</Badge>
                        ) : mvdAnalysis.determinant_is_superkey ? (
                          <Badge variant="success" size="sm">Superkey Determinant</Badge>
                        ) : (
                          <Badge variant="error" size="sm">Violates 4NF</Badge>
                        )}
                      </div>
                    </div>

                    {showLogic && (
                      <div className="mt-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/50 text-[11px] space-y-1 text-slate-600 dark:text-slate-300">
                        <p className="leading-relaxed">{mvdAnalysis.explanation}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span>
                            Trivial:{' '}
                            <strong className={mvdAnalysis.is_trivial ? 'text-indigo-600 dark:text-indigo-400' : ''}>
                              {mvdAnalysis.is_trivial ? 'Yes' : 'No'}
                            </strong>
                          </span>
                          <span>
                            Determinant Superkey:{' '}
                            <strong className={mvdAnalysis.determinant_is_superkey ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                              {mvdAnalysis.determinant_is_superkey ? 'Yes' : 'No'}
                            </strong>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4NF Decomposition Proposal */}
        {decomp && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                <Split className="w-3.5 h-3.5" />
                4NF Decomposition Proposal (Projection Preview)
              </h4>
              <button
                type="button"
                onClick={() => setShowDecomposition(!showDecomposition)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                {showDecomposition ? 'Hide plan' : 'Show plan'}
                {showDecomposition ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {showDecomposition && (
              <div className="p-3.5 bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/60 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                    {decomp.explanation || 'Splits independent multivalued facts into distinct projected schemas:'}
                  </div>
                  <Badge variant="warning" size="sm">
                    {decomp.verification_status || 'NOT_YET_VERIFIED'}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(decomp.proposed_relations || []).map((schema: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 rounded-lg shadow-2xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-indigo-700 dark:text-indigo-300">
                          {schema.name}
                        </span>
                        <Badge variant="neutral" size="sm">
                          {schema.attributes?.length || 0} attrs
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(schema.attributes || []).map((attr: string) => (
                          <span
                            key={attr}
                            className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-mono text-[11px]"
                          >
                            {attr}
                          </span>
                        ))}
                      </div>
                      {schema.explanation && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          {schema.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-indigo-800 dark:text-indigo-300/80 bg-indigo-100/50 dark:bg-indigo-950/40 p-2.5 rounded">
                  <div className="flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                    <span>
                      <strong>Formal Verification:</strong> This 4NF decomposition is formally verified using Fagin's Theorem and Dependency Preservation in the Decomposition Workspace.
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

        {/* Step-by-Step Reasoning Trace */}
        {(result.reasoning_steps || []).length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Audit Reasoning Steps:
            </div>
            <ul className="space-y-1 pl-4 list-disc text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {(result.reasoning_steps || []).map((step: any, idx: number) => {
                const text =
                  typeof step === 'string'
                    ? step
                    : step.description
                    ? `${step.title ? step.title + ': ' : ''}${step.description}`
                    : JSON.stringify(step);
                return <li key={idx}>{text}</li>;
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
