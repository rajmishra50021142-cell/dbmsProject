import React, { useState } from 'react';
import type { RelationSchema, DecompositionAnalyzeResult, DecompositionPlan } from '../../types';
import { decompositionService } from '../../services/decompositionService';
import { TableauChaseViewer } from './TableauChaseViewer';
import { DependencyPreservationViewer } from './DependencyPreservationViewer';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  GitFork,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Key,
  AlertTriangle,
} from 'lucide-react';

interface DecompositionWorkspaceProps {
  schema: RelationSchema;
  initialTargetNF?: '2NF' | '3NF' | '4NF';
}

export const DecompositionWorkspace: React.FC<DecompositionWorkspaceProps> = ({
  schema,
  initialTargetNF = '3NF',
}) => {
  const [targetNF, setTargetNF] = useState<'2NF' | '3NF' | '4NF'>(initialTargetNF);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DecompositionAnalyzeResult | null>(null);
  const [showLogic, setShowLogic] = useState<boolean>(false);
  const [activeLogicTab, setActiveLogicTab] = useState<'lossless' | 'preservation' | 'minimalCover' | 'lineage'>(
    'lossless'
  );

  const handleDecompose = async (selectedNF: '2NF' | '3NF' | '4NF') => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await decompositionService.analyzeDecomposition({
        relationName: schema.name,
        attributes: schema.attributes,
        functionalDependencies: schema.functional_dependencies,
        multivaluedDependencies: schema.multivalued_dependencies,
        candidateKeys: schema.candidate_keys,
        targetNormalForm: selectedNF,
      });
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to execute decomposition pipeline.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlan: DecompositionPlan | null = result?.plans?.[0] || null;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
              <GitFork className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Formal Decomposition & Normalization Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generate formally verified, lossless, and dependency-preserving schemas
              </p>
            </div>
          </div>
        </div>

        {/* Target NF Selector & Action Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            {(['2NF', '3NF', '4NF'] as const).map((nf) => (
              <button
                key={nf}
                type="button"
                onClick={() => {
                  setTargetNF(nf);
                  handleDecompose(nf);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  targetNF === nf
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Target {nf}
              </button>
            ))}
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleDecompose(targetNF)}
            disabled={isLoading || schema.attributes.length === 0}
            className="flex items-center gap-1.5"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Decompose & Verify</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 mx-6 mt-6 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Body Content */}
      <div className="p-6 space-y-6">
        {!result && !isLoading && (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400 space-y-3">
            <GitFork className="w-10 h-10 mx-auto text-slate-400 dark:text-slate-600 opacity-60" />
            <div className="text-sm font-medium">Ready to Decompose Relation '{schema.name}'</div>
            <p className="text-xs max-w-md mx-auto text-slate-400 leading-relaxed">
              Click <strong>Decompose & Verify</strong> to generate sub-relations, execute the Tableau Chase algorithm,
              and test polynomial dependency preservation.
            </p>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Verification Status Summary Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Lossless Join
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {result.verification.lossless_join.is_lossless ? 'Lossless (Guaranteed)' : 'Lossy Decomposition'}
                  </div>
                </div>
                <Badge variant={result.verification.lossless_join.is_lossless ? 'success' : 'error'}>
                  {result.verification.lossless_join.is_lossless ? '✓ Lossless' : '✗ Lossy'}
                </Badge>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Dependency Preservation
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {result.verification.dependency_preservation.is_preserved
                      ? 'All Preserved (100%)'
                      : `${result.verification.dependency_preservation.preserved_dependencies.length}/${result.verification.dependency_preservation.original_dependencies.length} Preserved`}
                  </div>
                </div>
                <Badge variant={result.verification.dependency_preservation.is_preserved ? 'success' : 'warning'}>
                  {result.verification.dependency_preservation.is_preserved ? '✓ Preserved' : '⚠ Partial'}
                </Badge>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Overall Status
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {result.verification.overall_status === 'VERIFIED_BOTH'
                      ? 'Lossless & Preserving'
                      : result.verification.overall_status === 'VERIFIED_LOSSLESS_ONLY'
                      ? 'Lossless Only'
                      : 'Review Required'}
                  </div>
                </div>
                <Badge
                  variant={
                    result.verification.overall_status === 'VERIFIED_BOTH'
                      ? 'success'
                      : result.verification.overall_status === 'VERIFIED_LOSSLESS_ONLY'
                      ? 'info'
                      : 'error'
                  }
                >
                  {result.target_normal_form} Verified
                </Badge>
              </div>
            </div>

            {/* Before vs After Schema Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Original Schema (Before) */}
              <div className="lg:col-span-4 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Source Relation (Before)
                  </span>
                  <Badge variant="neutral" size="sm">
                    {schema.attributes.length} attributes
                  </Badge>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {schema.name}({schema.attributes.join(', ')})
                  </div>

                  {result.candidate_keys.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Key className="w-3 h-3 text-amber-500" />
                        Candidate Keys:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {result.candidate_keys.map((ck, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 rounded text-xs font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                          >
                            ({ck.join(', ')})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {schema.functional_dependencies.length > 0 && (
                    <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        Functional Dependencies:
                      </div>
                      <div className="space-y-1">
                        {schema.functional_dependencies.map((fd, idx) => (
                          <div key={idx} className="text-xs font-mono text-slate-700 dark:text-slate-300">
                            {fd.left.join(', ')} → {fd.right.join(', ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Middle Arrow for Large Screens */}
              <div className="hidden lg:flex lg:col-span-1 items-center justify-center">
                <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>

              {/* Right Column: Normalized Decomposed Relations (After) */}
              <div className="lg:col-span-7 p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                    Decomposed Relations ({result.target_normal_form})
                  </span>
                  <Badge variant="accent" size="sm">
                    {result.final_relations.length} Sub-relation{result.final_relations.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.final_relations.map((rel, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {rel.name}
                        </span>
                        {rel.primary_key.length > 0 && (
                          <Badge variant="accent" size="sm">
                            PK: {rel.primary_key.join(', ')}
                          </Badge>
                        )}
                      </div>

                      <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded text-xs font-mono text-slate-800 dark:text-slate-200">
                        ({rel.attributes.join(', ')})
                      </div>

                      {rel.projected_fds && rel.projected_fds.length > 0 && (
                        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Local FDs:</div>
                          <div className="space-y-0.5">
                            {rel.projected_fds.slice(0, 3).map((fd, fIdx) => (
                              <div key={fIdx} className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                                {fd.left.join(', ')} → {fd.right.join(', ')}
                              </div>
                            ))}
                            {rel.projected_fds.length > 3 && (
                              <div className="text-[10px] text-slate-400 italic">
                                +{rel.projected_fds.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Show Logic Button */}
            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => setShowLogic((prev) => !prev)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs"
              >
                <span>{showLogic ? 'Hide Formal Verification Details' : 'Show Formal Verification Details'}</span>
                {showLogic ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Expandable Verification Logic Drawer */}
            {showLogic && (
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
                {/* Drawer Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
                  <button
                    type="button"
                    onClick={() => setActiveLogicTab('lossless')}
                    className={`pb-3 text-xs font-bold transition-all relative ${
                      activeLogicTab === 'lossless'
                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    Tableau Chase Test
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLogicTab('preservation')}
                    className={`pb-3 text-xs font-bold transition-all relative ${
                      activeLogicTab === 'preservation'
                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    Dependency Preservation
                  </button>

                  {result.minimal_cover && (
                    <button
                      type="button"
                      onClick={() => setActiveLogicTab('minimalCover')}
                      className={`pb-3 text-xs font-bold transition-all relative ${
                        activeLogicTab === 'minimalCover'
                          ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                          : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      Canonical Minimal Cover (F_min)
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveLogicTab('lineage')}
                    className={`pb-3 text-xs font-bold transition-all relative ${
                      activeLogicTab === 'lineage'
                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    Derivation & Lineage
                  </button>
                </div>

                {/* Tab 1: Tableau Chase */}
                {activeLogicTab === 'lossless' && (
                  <TableauChaseViewer result={result.verification.lossless_join} />
                )}

                {/* Tab 2: Dependency Preservation */}
                {activeLogicTab === 'preservation' && (
                  <DependencyPreservationViewer result={result.verification.dependency_preservation} />
                )}

                {/* Tab 3: Minimal Cover */}
                {activeLogicTab === 'minimalCover' && result.minimal_cover && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Bernstein's Synthesis Canonical Cover Derivation
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Transforms original FD set F into minimal cover F_min with singleton RHS, no extraneous LHS attributes, and no redundant FDs.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          Original Dependencies ({result.minimal_cover.original_fds.length})
                        </span>
                        <div className="space-y-1">
                          {result.minimal_cover.original_fds.map((f, idx) => (
                            <div key={idx} className="text-xs font-mono text-slate-600 dark:text-slate-400">
                              {f.left.join(', ')} → {f.right.join(', ')}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-2">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          Final Minimal Cover ({result.minimal_cover.minimal_fds.length})
                        </span>
                        <div className="space-y-1">
                          {result.minimal_cover.minimal_fds.map((f, idx) => (
                            <div key={idx} className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
                              {f.left.join(', ')} → {f.right.join(', ')}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {result.minimal_cover.reasoning_steps.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Minimal Cover Steps:
                        </span>
                        <div className="space-y-1.5">
                          {result.minimal_cover.reasoning_steps.map((step, idx) => (
                            <div key={idx} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 font-mono">
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 4: Derivation Trace & Lineage */}
                {activeLogicTab === 'lineage' && currentPlan && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Decomposition Lineage & Derivation Trace
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Source Relation: <strong className="font-mono">{currentPlan.source_relation}</strong> → Children: <strong className="font-mono">{currentPlan.proposed_relations.map(r => r.name).join(', ')}</strong>
                      </p>
                    </div>

                    <div className="space-y-2">
                      {currentPlan.reasoning_steps.map((step) => (
                        <div
                          key={step.step_number}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                              Step {step.step_number}: {step.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
