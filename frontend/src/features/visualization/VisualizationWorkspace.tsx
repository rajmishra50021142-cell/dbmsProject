import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Compass,
  Network,
  Sparkles,
  GitBranch,
  RefreshCw,
} from 'lucide-react';
import { NormalizationJourneyHero } from './NormalizationJourneyHero';
import { DependencyGraphCanvas } from './DependencyGraphCanvas';
import { ContextSensitiveStageVisualizer } from './ContextSensitiveStageVisualizer';
import { ClosureVisualizerPlayer } from './ClosureVisualizerPlayer';
import { DecompositionTreeVisualizer } from './DecompositionTreeVisualizer';
import { BeforeAfterSchemaVisualizer } from './BeforeAfterSchemaVisualizer';
import { SynchronizedDetailPanel } from './SynchronizedDetailPanel';
import { VisualizationLegend } from './VisualizationLegend';
import { visualizationService } from '../../services/visualizationService';
import type {
  RelationSchema,
  FullNormalizationAnalysisResult,
  VisualizationGraphData,
  DecompositionTreeNode,
  DecomposedRelation,
  DecompositionPlan,
  SelectedEntity,
  VisualizationMode,
} from '../../types';

interface VisualizationWorkspaceProps {
  schema: RelationSchema;
  analysisResult?: FullNormalizationAnalysisResult | null;
  initialMode?: VisualizationMode;
  initialStage?: '1NF' | '2NF' | '3NF' | '4NF';
  onOpenExperiment?: () => void;
  onExplainWhyStage?: (stage: '1NF' | '2NF' | '3NF' | '4NF') => void;
  onExplainWhyDependency?: (dep: any) => void;
}

export const VisualizationWorkspace: React.FC<VisualizationWorkspaceProps> = ({
  schema,
  analysisResult,
  initialMode = 'journey',
  initialStage = '2NF',
  onOpenExperiment,
  onExplainWhyStage,
  onExplainWhyDependency,
}) => {
  const [mode, setMode] = useState<VisualizationMode>(initialMode);
  const [activeStage, setActiveStage] = useState<'1NF' | '2NF' | '3NF' | '4NF'>(initialStage);
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity>(null);

  // Graph and Tree visualization data state
  const [graphData, setGraphData] = useState<VisualizationGraphData | null>(null);
  const [treeNodes, setTreeNodes] = useState<DecompositionTreeNode[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Compute violations map from analysisResult
  const violationsMap = useMemo(() => {
    const fdViolations: string[] = [];
    const partials: string[] = [];
    const transitives: string[] = [];
    const mvdViolations: string[] = [];
    const stages: string[] = [];

    if (analysisResult?.nf2.status === 'VIOLATED') {
      stages.push('2NF');
      analysisResult.nf2.partial_dependencies.forEach((p) => {
        partials.push(`${p.determinant.join(', ')} → ${p.dependent_attributes.join(', ')}`);
        fdViolations.push(`${p.determinant.join(', ')} → ${p.dependent_attributes.join(', ')}`);
      });
    }

    if (analysisResult?.nf3?.status === 'VIOLATED') {
      stages.push('3NF');
      analysisResult.nf3.violations.forEach((v) => {
        transitives.push(
          `${v.determinant.join(', ')} → ${v.dependent_attributes.join(', ')}`
        );
        fdViolations.push(
          `${v.determinant.join(', ')} → ${v.dependent_attributes.join(', ')}`
        );
      });
    }

    if (analysisResult?.nf4?.status === 'VIOLATED') {
      stages.push('4NF');
      analysisResult.nf4.violations.forEach((v) => {
        mvdViolations.push(`${v.mvd.left.join(', ')} ↠ ${v.mvd.right.join(', ')}`);
      });
    }

    return {
      fd_violations: fdViolations,
      partial_dependencies: partials,
      transitive_dependencies: transitives,
      mvd_violations: mvdViolations,
      stages,
    };
  }, [analysisResult]);

  // Load graph layout
  const loadGraph = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await visualizationService.getDependencyGraph(
        schema,
        analysisResult?.prime_attributes,
        violationsMap
      );
      setGraphData(data);
    } catch (err) {
      console.error('Failed to load dependency graph', err);
    } finally {
      setIsLoading(false);
    }
  }, [schema, analysisResult?.prime_attributes, violationsMap]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  // Compute decomposed relations from active stage or latest proposal
  const decomposedRelations = useMemo<DecomposedRelation[]>(() => {
    let proposal = null;
    if (activeStage === '4NF' && analysisResult?.nf4?.decomposition_proposal) {
      proposal = analysisResult.nf4.decomposition_proposal;
    } else if (activeStage === '3NF' && analysisResult?.nf3?.decomposition_proposal) {
      proposal = analysisResult.nf3.decomposition_proposal;
    } else if (analysisResult?.nf2.decomposition_proposal) {
      proposal = analysisResult.nf2.decomposition_proposal;
    }
    if (!proposal) return [];
    return proposal.proposed_relations.map((r) => ({
      name: r.name,
      attributes: r.attributes,
      primary_key: r.primary_key,
      candidate_keys: [r.primary_key],
      functional_dependencies: [],
      projected_fds: [],
      purpose: r.purpose,
      source_relation: schema.name,
    }));
  }, [activeStage, analysisResult, schema.name]);

  // Load decomposition tree
  const loadTree = useCallback(async () => {
    try {
      const plans: DecompositionPlan[] = [];
      if (analysisResult?.nf2.decomposition_proposal) {
        plans.push({
          id: 'plan-2nf',
          source_relation: schema.name,
          stage: '2NF',
          trigger_type: 'PARTIAL_DEPENDENCY',
          proposed_relations: analysisResult.nf2.decomposition_proposal.proposed_relations.map((r) => ({
            name: r.name,
            attributes: r.attributes,
            primary_key: r.primary_key,
            candidate_keys: [r.primary_key],
            functional_dependencies: [],
            projected_fds: [],
            purpose: r.purpose,
            source_relation: schema.name,
          })),
          lossless_join: { is_lossless: true, method: 'TABLEAU_CHASE', attributes: schema.attributes, relations: [], initial_tableau: [], chase_steps: [], final_tableau: [], reasoning: '' },
          dependency_preservation: { is_preserved: true, original_dependencies: [], projected_dependencies_by_relation: {}, all_projected_dependencies: [], checks: [], preserved_dependencies: [], non_preserved_dependencies: [], reasoning: '' },
          lineage: {},
          reasoning_steps: [],
        });
      }
      if (analysisResult?.nf3?.decomposition_proposal) {
        plans.push({
          id: 'plan-3nf',
          source_relation: schema.name,
          stage: '3NF',
          trigger_type: 'TRANSITIVE_DEPENDENCY',
          proposed_relations: analysisResult.nf3.decomposition_proposal.proposed_relations.map((r) => ({
            name: r.name,
            attributes: r.attributes,
            primary_key: r.primary_key,
            candidate_keys: [r.primary_key],
            functional_dependencies: [],
            projected_fds: [],
            purpose: r.purpose,
            source_relation: schema.name,
          })),
          lossless_join: { is_lossless: true, method: 'TABLEAU_CHASE', attributes: schema.attributes, relations: [], initial_tableau: [], chase_steps: [], final_tableau: [], reasoning: '' },
          dependency_preservation: { is_preserved: true, original_dependencies: [], projected_dependencies_by_relation: {}, all_projected_dependencies: [], checks: [], preserved_dependencies: [], non_preserved_dependencies: [], reasoning: '' },
          lineage: {},
          reasoning_steps: [],
        });
      }
      if (analysisResult?.nf4?.decomposition_proposal) {
        plans.push({
          id: 'plan-4nf',
          source_relation: schema.name,
          stage: '4NF',
          trigger_type: 'MULTIVALUED_DEPENDENCY',
          proposed_relations: analysisResult.nf4.decomposition_proposal.proposed_relations.map((r) => ({
            name: r.name,
            attributes: r.attributes,
            primary_key: r.primary_key,
            candidate_keys: [r.primary_key],
            functional_dependencies: [],
            projected_fds: [],
            purpose: r.purpose,
            source_relation: schema.name,
          })),
          lossless_join: { is_lossless: true, method: 'TABLEAU_CHASE', attributes: schema.attributes, relations: [], initial_tableau: [], chase_steps: [], final_tableau: [], reasoning: '' },
          dependency_preservation: { is_preserved: true, original_dependencies: [], projected_dependencies_by_relation: {}, all_projected_dependencies: [], checks: [], preserved_dependencies: [], non_preserved_dependencies: [], reasoning: '' },
          lineage: {},
          reasoning_steps: [],
        });
      }

      const nodes = await visualizationService.getDecompositionTree(
        schema.name,
        schema.attributes,
        schema.candidate_keys || [],
        plans
      );
      setTreeNodes(nodes);
    } catch (err) {
      console.warn('Failed to load decomposition tree', err);
    }
  }, [schema, analysisResult]);

  useEffect(() => {
    loadTree();
  }, [loadTree]);

  // Calculate active stage violation count
  const activeViolationCount = useMemo(() => {
    if (activeStage === '1NF') return analysisResult?.nf1.violations.length || 0;
    if (activeStage === '2NF') return analysisResult?.nf2.partial_dependencies.length || 0;
    if (activeStage === '3NF') return analysisResult?.nf3?.violations.length || 0;
    if (activeStage === '4NF') return analysisResult?.nf4?.violations.length || 0;
    return 0;
  }, [activeStage, analysisResult]);

  return (
    <div className="space-y-4">
      {/* Mode Switcher Navigation Header (Section 48) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
          <button
            onClick={() => setMode('journey')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'journey'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Journey</span>
          </button>

          <button
            onClick={() => setMode('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'graph'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Dependency Graph</span>
          </button>

          <button
            onClick={() => setMode('closure')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'closure'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Closure Player</span>
          </button>

          <button
            onClick={() => setMode('decomposition')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              mode === 'decomposition'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Decomposition Lineage</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadGraph}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Layout</span>
          </button>
        </div>
      </div>

      {/* Main Workspace 2-Column Desktop Grid (Section 49) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left / Center Canvas Area (Cols 1-8) */}
        <div className="lg:col-span-8 space-y-4">
          {mode === 'journey' && (
            <div className="space-y-4">
              <NormalizationJourneyHero
                activeStage={activeStage}
                onSelectStage={setActiveStage}
                nf1Status={analysisResult?.nf1.status}
                nf2Status={analysisResult?.nf2.status}
                nf3Status={analysisResult?.nf3?.status}
                nf4Status={analysisResult?.nf4?.status}
                violationCount={activeViolationCount}
                onExplainWhy={onExplainWhyStage}
                onOpenExperiment={onOpenExperiment}
              />

              {/* Context-Sensitive Stage Visualizer */}
              <ContextSensitiveStageVisualizer
                stage={activeStage}
                schema={schema}
                analysisResult={analysisResult}
                onSelectEntity={setSelectedEntity}
              />

              {/* Dependency Graph in Journey Context */}
              {graphData && (
                <DependencyGraphCanvas
                  graphData={graphData}
                  selectedEntity={selectedEntity}
                  onSelectEntity={setSelectedEntity}
                />
              )}
            </div>
          )}

          {mode === 'graph' && graphData && (
            <div className="space-y-3">
              <DependencyGraphCanvas
                graphData={graphData}
                selectedEntity={selectedEntity}
                onSelectEntity={setSelectedEntity}
              />
            </div>
          )}

          {mode === 'closure' && (
            <ClosureVisualizerPlayer schema={schema} />
          )}

          {mode === 'decomposition' && (
            <div className="space-y-4">
              {decomposedRelations.length > 0 && (
                <BeforeAfterSchemaVisualizer
                  originalSchema={schema}
                  decomposedRelations={decomposedRelations}
                  targetStage={activeStage}
                />
              )}
              <DecompositionTreeVisualizer
                treeNodes={treeNodes}
                onSelectEntity={setSelectedEntity}
              />
            </div>
          )}

          {/* Accessible Legend */}
          <VisualizationLegend />
        </div>

        {/* Right Detail Panel (Cols 9-12) */}
        <div className="lg:col-span-4 sticky top-6">
          <SynchronizedDetailPanel
            selectedEntity={selectedEntity}
            schema={schema}
            onClearSelection={() => setSelectedEntity(null)}
            onCalculateClosure={(_attrs) => {
              setMode('closure');
            }}
            onExplainWhyDependency={onExplainWhyDependency}
            onOpenExperiment={onOpenExperiment}
          />
        </div>
      </div>
    </div>
  );
};
