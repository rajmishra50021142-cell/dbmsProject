import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Layers,
  RotateCcw,
  Sparkles,
  Key,
  Database,
  AlertTriangle,
  RefreshCw,
  Sliders,
  GraduationCap,
  Download,
  Bookmark,
  History,
} from 'lucide-react';
import { NormalizationJourneyStepper } from './NormalizationJourneyStepper';
import { NF1AnalysisCard } from './NF1AnalysisCard';
import { NF2AnalysisCard } from './NF2AnalysisCard';
import { NF3AnalysisCard } from './NF3AnalysisCard';
import { NF4AnalysisCard } from './NF4AnalysisCard';
import { DecompositionWorkspace } from '../decomposition/DecompositionWorkspace';
import { VisualizationWorkspace } from '../visualization/VisualizationWorkspace';
import { PracticeMode } from '../practice/PracticeMode';
import { NormalizationAssistant } from '../assistant/NormalizationAssistant';
import { WhyModal } from '../explainability/WhyModal';
import { ReportDownloadModal } from '../reports/ReportDownloadModal';
import { normalizationService } from '../../services/normalizationService';
import { historyService } from '../../services/historyService';
import { EXAMPLE_SCHEMAS } from '../../config/examples';
import type {
  RelationSchema,
  FullNormalizationAnalysisResult,
  ExplainWhyData,
} from '../../types';

const DRAFT_STORAGE_KEY = 'normalization_lab_draft_v1';

// Default example: classic 2NF violation problem (ENROLLMENT)
const DEFAULT_SCHEMA: RelationSchema = EXAMPLE_SCHEMAS[1].schema;

interface NormalizationLabProps {
  initialSchema?: RelationSchema;
}

export const NormalizationLab: React.FC<NormalizationLabProps> = ({ initialSchema }) => {
  // Active schema state
  const [schema, setSchema] = useState<RelationSchema>(() => {
    if (initialSchema) {
      return initialSchema;
    }
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_SCHEMA;
  });

  const [activeStage, setActiveStage] = useState<'1NF' | '2NF' | '3NF' | '4NF'>('2NF');
  const [labView, setLabView] = useState<
    'visualizer' | 'cards' | 'decomposition' | 'practice' | 'all'
  >('all');
  const [analysisResult, setAnalysisResult] = useState<FullNormalizationAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Phase 9 Contextual Assistant & Explain-Why Modal States
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isWhyModalOpen, setIsWhyModalOpen] = useState<boolean>(false);
  const [whyModalData, setWhyModalData] = useState<ExplainWhyData | null>(null);

  // Phase 10 Report Download Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [savedHistoryToast, setSavedHistoryToast] = useState<boolean>(false);

  // Computes a light frontend fingerprint to compare with backend fingerprint
  const currentFingerprint = useMemo(() => {
    const attrs = [...schema.attributes].sort().join(',');
    const keys = (schema.candidate_keys || []).map((k) => [...k].sort().join(',')).sort().join('|');
    const fds = schema.functional_dependencies
      .map((fd) => `${[...fd.left].sort().join(',')}=>${[...fd.right].sort().join(',')}`)
      .sort()
      .join(';');
    const mvds = (schema.multivalued_dependencies || [])
      .map((mvd) => `${[...mvd.left].sort().join(',')}==>>${[...mvd.right].sort().join(',')}`)
      .sort()
      .join(';');
    const samples = (schema.sample_data || [])
      .map((r: any) => {
        const valObj = r && typeof r === 'object' && 'values' in r && r.values ? r.values : r;
        return valObj && typeof valObj === 'object'
          ? Object.entries(valObj).sort().map(([k, v]) => `${k}:${v}`).join(',')
          : String(r);
      })
      .sort()
      .join('__');
    return `${schema.name}#${attrs}#${keys}#${fds}#${mvds}#${samples}`;
  }, [schema]);

  const [fingerprintMap, setFingerprintMap] = useState<string>('');

  const runAnalysis = useCallback(async (targetSchema: RelationSchema) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await normalizationService.analyzeFullNormalization(targetSchema);
      setAnalysisResult(res);
      setFingerprintMap(currentFingerprint);
      // Automatically record analysis in persistent history
      historyService.recordNormalizationAnalysis(targetSchema, res);
    } catch (err: unknown) {
      const errDetail =
        err && typeof err === 'object' && 'detail' in err
          ? String((err as { detail: unknown }).detail)
          : err instanceof Error
          ? err.message
          : 'Failed to complete normalization analysis';
      setErrorMessage(errDetail);
    } finally {
      setIsLoading(false);
    }
  }, [currentFingerprint]);

  // Initial analysis on mount
  useEffect(() => {
    runAnalysis(schema);
  }, []);

  const isStale = useMemo(() => {
    return fingerprintMap !== '' && fingerprintMap !== currentFingerprint;
  }, [fingerprintMap, currentFingerprint]);

  const handleLoadExample = (exampleIndex: number) => {
    const ex = EXAMPLE_SCHEMAS[exampleIndex];
    if (ex) {
      setSchema(ex.schema);
      runAnalysis(ex.schema);
      // Automatically switch tab to target normal form topic
      if (ex.id === '3nf-transitive-dep') {
        setActiveStage('3NF');
      } else if (ex.id === '4nf-mvd') {
        setActiveStage('4NF');
      } else if (ex.id === '1nf-atomicity') {
        setActiveStage('1NF');
      } else {
        setActiveStage('2NF');
      }
    }
  };

  const openExplainWhyStage = useCallback((stage: '1NF' | '2NF' | '3NF' | '4NF') => {
    if (!analysisResult) return;

    if (stage === '1NF') {
      const isPass = analysisResult.nf1.status === 'SATISFIED';
      setWhyModalData({
        title: `Why does ${schema.name} ${isPass ? 'satisfy' : 'violate'} 1NF?`,
        stage: '1NF',
        status: analysisResult.nf1.status,
        formalCondition: 'All attribute values must be atomic (indivisible domain elements) and no repeating groups may exist.',
        evidence: {
          candidateKeys: analysisResult.candidate_keys,
        },
        conclusion: analysisResult.nf1.message || (isPass ? 'All attributes contain atomic values and a valid key exists.' : 'Non-atomic values or repeating attributes detected.'),
        remedy: isPass ? undefined : 'Ensure each cell contains a single indivisible value and eliminate repeating columns.',
      });
    } else if (stage === '2NF') {
      const isPass = analysisResult.nf2.status === 'SATISFIED';
      const firstPartial = analysisResult.nf2.partial_dependencies?.[0];
      setWhyModalData({
        title: `Why does ${schema.name} ${isPass ? 'satisfy' : 'violate'} 2NF?`,
        stage: '2NF',
        status: analysisResult.nf2.status,
        formalCondition: 'Every non-prime attribute must be fully functionally dependent on every candidate key (no partial dependencies on proper subsets of composite keys).',
        checkedItem: firstPartial ? `${firstPartial.determinant.join(', ')} → ${firstPartial.dependent_attributes.join(', ')}` : undefined,
        evidence: {
          candidateKeys: analysisResult.candidate_keys,
          dependencies: analysisResult.nf2.partial_dependencies?.map((p) => `${p.determinant.join(', ')} → ${p.dependent_attributes.join(', ')}`),
          affectedAttributes: firstPartial?.dependent_attributes,
          isPrime: false,
          isSuperkey: false,
        },
        conclusion: analysisResult.nf2.message || (isPass ? 'No non-prime attributes depend on proper subsets of any candidate keys.' : 'Partial dependencies detected.'),
        remedy: isPass ? undefined : 'Decompose the relation by moving the partial determinant and its dependent attributes into a new sub-relation.',
      });
    } else if (stage === '3NF') {
      const isPass = analysisResult.nf3?.status === 'SATISFIED';
      const firstViol = analysisResult.nf3?.violations?.[0];
      setWhyModalData({
        title: `Why does ${schema.name} ${isPass ? 'satisfy' : 'violate'} 3NF?`,
        stage: '3NF',
        status: analysisResult.nf3?.status,
        formalCondition: 'For every non-trivial functional dependency X → A, either X is a superkey OR A is a prime attribute.',
        checkedItem: firstViol?.functional_dependency ? `${firstViol.functional_dependency.left.join(', ')} → ${firstViol.functional_dependency.right.join(', ')}` : undefined,
        evidence: {
          candidateKeys: analysisResult.candidate_keys,
          dependencies: analysisResult.nf3?.violations?.map((v) => `${v.determinant.join(', ')} → ${v.dependent_attributes.join(', ')}`),
          affectedAttributes: firstViol?.dependent_attributes,
          isSuperkey: firstViol?.determinant_is_superkey ?? false,
          isPrime: false,
        },
        conclusion: analysisResult.nf3?.message || (isPass ? 'All non-trivial dependencies have superkeys on the LHS or prime attributes on the RHS.' : 'Transitive dependency detected where a non-superkey determines non-prime attributes.'),
        remedy: isPass ? undefined : 'Decompose via 3NF synthesis using minimal cover or decompose transitive dependency X → A into R1(X, A) and R2(R \\ A).',
      });
    } else if (stage === '4NF') {
      const isPass = analysisResult.nf4?.status === 'SATISFIED';
      const firstMvdViol = analysisResult.nf4?.violations?.[0];
      setWhyModalData({
        title: `Why does ${schema.name} ${isPass ? 'satisfy' : 'violate'} 4NF?`,
        stage: '4NF',
        status: analysisResult.nf4?.status,
        formalCondition: 'For every non-trivial multivalued dependency X ↠ Y, X must be a superkey of the relation.',
        checkedItem: firstMvdViol?.mvd ? `${firstMvdViol.mvd.left.join(', ')} ↠ ${firstMvdViol.mvd.right.join(', ')}` : undefined,
        evidence: {
          candidateKeys: analysisResult.candidate_keys,
          dependencies: analysisResult.nf4?.violations?.map((v) => `${v.determinant.join(', ')} ↠ ${v.dependent_attributes.join(', ')}`),
          isSuperkey: false,
        },
        conclusion: analysisResult.nf4?.message || (isPass ? 'Every non-trivial MVD has a superkey determinant.' : 'Non-trivial MVD exists where determinant is not a superkey.'),
        remedy: isPass ? undefined : 'Decompose into sub-relations R1(X, Y) and R2(R \\ Y) to separate independent multivalued facts.',
      });
    }
    setIsWhyModalOpen(true);
  }, [analysisResult, schema]);

  const openExplainWhyDependency = useCallback((dep: any) => {
    if (!dep) return;
    const isMvd = dep.kind === 'mvd';
    const isViol = dep.isViolation;
    setWhyModalData({
      title: `Why is dependency "${dep.formula}" ${isViol ? 'a violation' : 'valid'}?`,
      stage: dep.violationStage || (isMvd ? '4NF' : '3NF'),
      status: isViol ? 'VIOLATED' : 'SATISFIED',
      formalCondition: isMvd
        ? 'In 4NF, every non-trivial MVD X ↠ Y must have a superkey determinant X.'
        : 'In 3NF, every non-trivial FD X → A must have a superkey determinant X OR prime dependent attributes A.',
      checkedItem: dep.formula,
      evidence: {
        candidateKeys: analysisResult?.candidate_keys,
        closure: dep.left ? `{${dep.left.join(', ')}}⁺` : undefined,
        isSuperkey: false,
        isPrime: false,
      },
      conclusion: dep.explanation || (isViol ? 'Determinant is not a superkey, creating redundancy.' : 'Dependency satisfies relational constraints.'),
      remedy: isViol ? 'Isolate this dependency in a dedicated sub-relation during decomposition.' : undefined,
    });
    setIsWhyModalOpen(true);
  }, [analysisResult]);

  const handleSyncDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSchema(parsed);
        runAnalysis(parsed);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Normalization Lab: 1NF–4NF Engine
            </h1>
            <Badge variant="accent" size="sm">Active</Badge>
            <Badge variant="neutral" size="sm">1NF–4NF Engine</Badge>
            {analysisResult?.highest_confirmed_normal_form && (
              <Badge variant="info" size="sm" className="font-semibold">
                Highest Form: {analysisResult.highest_confirmed_normal_form}
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Deterministic 1NF to 4NF evaluation, interactive assistant, and practice exercises.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Download Report Button */}
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Download className="w-3.5 h-3.5 text-indigo-500" />}
            onClick={() => setIsReportModalOpen(true)}
            id="open-download-report-btn"
            disabled={!analysisResult}
            className="shadow-xs"
          >
            Download Report
          </Button>

          {/* Bookmark / Save to History Button */}
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Bookmark className="w-3.5 h-3.5 text-indigo-500" />}
            onClick={() => {
              if (analysisResult) {
                historyService.recordNormalizationAnalysis(schema, analysisResult);
                setSavedHistoryToast(true);
                setTimeout(() => setSavedHistoryToast(false), 2500);
              }
            }}
            id="bookmark-history-btn"
            disabled={!analysisResult}
            className="shadow-xs"
            title="Save current analysis to History"
          >
            {savedHistoryToast ? '✓ Saved to History' : 'Save to History'}
          </Button>

          {/* History Page Link */}
          <Link to="/history" id="view-history-link-btn">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<History className="w-3.5 h-3.5 text-slate-500" />}
              title="View past execution and analysis history"
            >
              History
            </Button>
          </Link>

          {/* Assistant Trigger Button */}
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
            onClick={() => setIsAssistantOpen(true)}
            id="open-assistant-btn"
            className="shadow-sm"
          >
            Assistant
          </Button>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleSyncDraft}
            id="sync-analyzer-draft-btn"
          >
            Sync Draft
          </Button>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => runAnalysis(schema)}
            disabled={isLoading}
            id="run-normalization-analysis-btn"
          >
            {isLoading ? 'Analyzing...' : 'Re-run Analysis'}
          </Button>
        </div>
      </div>

      {/* Stale Result Warning Banner */}
      {isStale && (
        <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Schema Input Modified:</strong> The schema attributes, keys, dependencies, or sample data have changed since the last analysis run.
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={() => runAnalysis(schema)}>
            Update Results
          </Button>
        </div>
      )}

      {/* Relation Context Card & Curated Example Pills */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Relation Under Analysis:
              </span>
              <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {schema.name}({schema.attributes.join(', ')})
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-500 dark:text-slate-400">Curated Presets:</span>
              <button
                onClick={() => handleLoadExample(1)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]"
              >
                2NF Partial (Enrollment)
              </button>
              <button
                onClick={() => handleLoadExample(2)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]"
              >
                3NF Transitive (Staff)
              </button>
              <button
                onClick={() => handleLoadExample(3)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]"
              >
                4NF MVD (Restaurant)
              </button>
              <button
                onClick={() => handleLoadExample(0)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]"
              >
                1NF Multi-valued
              </button>
              <button
                onClick={() => handleLoadExample(4)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px]"
              >
                Normalized (Clean)
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Candidate Keys: </span>
              <span className="font-mono">
                {schema.candidate_keys && schema.candidate_keys.length > 0
                  ? schema.candidate_keys.map((k) => `(${k.join(', ')})`).join(', ')
                  : 'Auto-derived'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">FDs ({schema.functional_dependencies.length}): </span>
              <span className="font-mono">
                {schema.functional_dependencies.length > 0
                  ? schema.functional_dependencies.map((fd) => `${fd.left.join(', ')} → ${fd.right.join(', ')}`).join(' | ')
                  : 'None'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">MVDs ({schema.multivalued_dependencies?.length || 0}): </span>
              <span className="font-mono">
                {schema.multivalued_dependencies && schema.multivalued_dependencies.length > 0
                  ? schema.multivalued_dependencies.map((mvd) => `${mvd.left.join(', ')} ↠ ${mvd.right.join(', ')}`).join(' | ')
                  : 'None'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Sample Tuples: </span>
              <span>{schema.sample_data?.length || 0} row(s)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Normalization Journey Stepper */}
      <NormalizationJourneyStepper
        nf1Status={analysisResult?.nf1.status}
        nf2Status={analysisResult?.nf2.status}
        nf3Status={analysisResult?.nf3?.status}
        nf4Status={analysisResult?.nf4?.status}
        activeStage={activeStage}
        onSelectStage={setActiveStage}
      />

      {/* Error Display */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-800 dark:text-rose-300">
          <strong>Analysis Error: </strong> {errorMessage}
        </div>
      )}

      {/* View Mode Selector: Interactive Visualizer vs Detailed Academic Cards */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setLabView('visualizer')}
            id="tab-view-visualizer"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              labView === 'visualizer'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Interactive Visualizer & Journey
          </button>
          <button
            onClick={() => setLabView('cards')}
            id="tab-view-cards"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              labView === 'cards'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Academic Stage Cards (1NF-4NF)
          </button>
          <button
            onClick={() => setLabView('decomposition')}
            id="tab-view-decomposition"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              labView === 'decomposition'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Decomposition Workspace
          </button>
          <button
            onClick={() => setLabView('practice')}
            id="tab-view-practice"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              labView === 'practice'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Practice Mode</span>
          </button>
          <button
            onClick={() => setLabView('all')}
            id="tab-view-all"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              labView === 'all'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All Views
          </button>
        </div>

        <div className="text-[11px] text-slate-500 dark:text-slate-400 px-2 font-medium">
          Active Stage: <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeStage}</span>
        </div>
      </div>

      {/* Interactive Visualizer & Journey (Phase 8 Engine) */}
      {(labView === 'visualizer' || labView === 'all') && (
        <div id="section-interactive-visualizer" className="space-y-4">
          <VisualizationWorkspace
            schema={schema}
            analysisResult={analysisResult}
            initialStage={activeStage}
            initialMode="journey"
            onExplainWhyStage={openExplainWhyStage}
            onExplainWhyDependency={openExplainWhyDependency}
          />
        </div>
      )}

      {/* Practice Mode (Phase 9 Engine) */}
      {(labView === 'practice' || labView === 'all') && (
        <div id="section-practice-mode" className="pt-2">
          <PracticeMode />
        </div>
      )}

      {/* Stage Views (Academic Cards) */}
      {analysisResult && (labView === 'cards' || labView === 'all') && (
        <div className="space-y-6" id="section-academic-cards">
          {/* 1NF Card (visible when 1NF is active or in combined 2NF mode) */}
          {(activeStage === '1NF' || activeStage === '2NF') && (
            <div id="section-1nf-analysis">
              <NF1AnalysisCard result={analysisResult.nf1} />
            </div>
          )}

          {/* 2NF Card (visible when 2NF is active) */}
          {activeStage === '2NF' && (
            <div id="section-2nf-analysis">
              <NF2AnalysisCard result={analysisResult.nf2} />
            </div>
          )}

          {/* 3NF Card (visible when 3NF is active) */}
          {activeStage === '3NF' && analysisResult.nf3 && (
            <div id="section-3nf-analysis">
              <NF3AnalysisCard result={analysisResult.nf3} />
            </div>
          )}

          {/* 4NF Card (visible when 4NF is active) */}
          {activeStage === '4NF' && analysisResult.nf4 && (
            <div id="section-4nf-analysis">
              <NF4AnalysisCard result={analysisResult.nf4} />
            </div>
          )}
        </div>
      )}

      {/* Phase 7 Formal Decomposition & Verification Workspace */}
      {analysisResult && (labView === 'decomposition' || labView === 'all') && (
        <div id="decomposition-workspace" className="pt-2">
          <DecompositionWorkspace
            schema={schema}
            initialTargetNF={activeStage === '4NF' ? '4NF' : activeStage === '3NF' ? '3NF' : '2NF'}
          />
        </div>
      )}

      {/* Normalization Assistant Slide-Over Drawer */}
      <NormalizationAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        schema={schema}
        analysis={analysisResult}
        onOpenDecomposition={() => setLabView('decomposition')}
        onOpenJourney={() => setLabView('visualizer')}
      />

      {/* Grounded Explain-Why Modal */}
      <WhyModal
        isOpen={isWhyModalOpen}
        onClose={() => setIsWhyModalOpen(false)}
        data={whyModalData}
      />

      {/* Phase 10 Academic Report Download Modal */}
      <ReportDownloadModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        schema={schema}
        analysisResult={analysisResult}
      />

      {/* Cross-Phase Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Link to="/analyzer">
            <Button size="sm" variant="outline" leftIcon={<Sliders className="w-3.5 h-3.5" />}>
              Schema Builder
            </Button>
          </Link>
          <Link to="/closure">
            <Button size="sm" variant="outline" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
              Closure Lab
            </Button>
          </Link>
          <Link to="/keys">
            <Button size="sm" variant="outline" leftIcon={<Key className="w-3.5 h-3.5" />}>
              Keys Lab
            </Button>
          </Link>
        </div>

        <div className="text-slate-500 dark:text-slate-400 text-right">
          Contextual Assistant & Educational Lab
        </div>
      </div>
    </div>
  );
};
