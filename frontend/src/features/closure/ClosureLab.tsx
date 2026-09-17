import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Key,
  Layers,
  AlertCircle,
  Search,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ExampleModal } from '../analyzer/ExampleModal';
import { closureService } from '../../services/closureService';
import { historyService } from '../../services/historyService';
import { EXAMPLE_SCHEMAS } from '../../config/examples';
import type {
  RelationSchema,
  ClosureResult,
  ClosureStep,
  DeterminationResult,
} from '../../types';

const DRAFT_STORAGE_KEY = 'normalization_lab_draft_v1';

interface ClosureLabProps {
  initialSchema?: RelationSchema;
}

export const ClosureLab: React.FC<ClosureLabProps> = ({ initialSchema }) => {
  // Schema State
  const [schema, setSchema] = useState<RelationSchema>(() => {
    if (initialSchema) return initialSchema;
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return EXAMPLE_SCHEMAS[1].schema; // ENROLLMENT
  });

  // Target attribute selection
  const [selectedAttrs, setSelectedAttrs] = useState<string[]>(() => {
    return schema.attributes.length > 0 ? [schema.attributes[0]] : [];
  });

  // Computation State
  const [closureResult, setClosureResult] = useState<ClosureResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  // Determination Query State (Does X -> Y hold?)
  const [queryLhs, setQueryLhs] = useState<string[]>([]);
  const [queryRhs, setQueryRhs] = useState<string[]>([]);
  const [queryResult, setQueryResult] = useState<DeterminationResult | null>(null);
  const [isQueryLoading, setIsQueryLoading] = useState<boolean>(false);

  // Example Modal
  const [isExampleModalOpen, setIsExampleModalOpen] = useState<boolean>(false);

  // Load from Analyzer draft
  const handleLoadFromDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSchema(parsed);
        setSelectedAttrs(parsed.attributes.length > 0 ? [parsed.attributes[0]] : []);
        setClosureResult(null);
        setQueryResult(null);
        setError(null);
        return;
      }
    } catch {
      // ignore
    }
    setError('No saved schema draft found in localStorage.');
  };

  const toggleTargetAttr = (attr: string) => {
    if (selectedAttrs.includes(attr)) {
      setSelectedAttrs(selectedAttrs.filter((a) => a !== attr));
    } else {
      setSelectedAttrs([...selectedAttrs, attr]);
    }
    setError(null);
  };

  const handleComputeClosure = async () => {
    if (selectedAttrs.length === 0) {
      setError('Please select at least one starting attribute to compute its closure.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await closureService.computeClosure({
        relation_name: schema.name,
        attributes: schema.attributes,
        functional_dependencies: schema.functional_dependencies,
        target_attributes: selectedAttrs,
      });
      setClosureResult(res);
      setActiveStepIndex(res.steps.length - 1); // jump to final step
      // Persist to history
      historyService.recordClosureAnalysis(schema, selectedAttrs, res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to compute attribute closure.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Implication Query
  const handleCheckImplication = async () => {
    if (queryLhs.length === 0 || queryRhs.length === 0) {
      return;
    }
    setIsQueryLoading(true);
    try {
      const res = await closureService.checkDetermination({
        relation_name: schema.name,
        attributes: schema.attributes,
        functional_dependencies: schema.functional_dependencies,
        lhs: queryLhs,
        rhs: queryRhs,
      });
      setQueryResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to evaluate implication.';
      setError(msg);
    } finally {
      setIsQueryLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Workspace Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
              {schema.name || 'R'}
            </span>
            <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
              ({schema.attributes.join(', ')})
            </span>
            <Badge variant="accent" size="sm">
              {schema.functional_dependencies.length} FDs
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Active schema loaded for mathematical dependency and closure computation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleLoadFromDraft}
            title="Reload from Analyzer workspace draft"
          >
            Sync Analyzer Draft
          </Button>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<BookOpen className="w-3.5 h-3.5" />}
            onClick={() => setIsExampleModalOpen(true)}
          >
            Load Example
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Target Attribute Selector & FDs (Cols 1-5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Attribute Selection Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Select Starting Attributes ($X$)
                </CardTitle>
                <Badge variant="accent" size="sm">
                  {selectedAttrs.length} selected
                </Badge>
              </div>
              <CardDescription>
                Choose one or more attributes to calculate their full functional closure $X^+$.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
                {schema.attributes.map((attr) => {
                  const isSelected = selectedAttrs.includes(attr);
                  return (
                    <button
                      key={attr}
                      type="button"
                      onClick={() => toggleTargetAttr(attr)}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-500/30'
                          : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                      }`}
                    >
                      {isSelected ? `✓ ${attr}` : attr}
                    </button>
                  );
                })}
              </div>

              {/* Selection Status & Compute Action */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  Target: <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    ({selectedAttrs.join(', ') || '∅'})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedAttrs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedAttrs([])}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline"
                    >
                      Clear
                    </button>
                  )}
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={selectedAttrs.length === 0}
                    onClick={handleComputeClosure}
                    isLoading={isLoading}
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                    id="calculate-closure-btn"
                  >
                    Calculate Closure ({selectedAttrs.join(', ') || 'X'})⁺
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Functional Dependencies Pool */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-indigo-500" />
                  Active Dependencies ($F$)
                </CardTitle>
                <Badge variant="neutral" size="sm">
                  {schema.functional_dependencies.length} FDs
                </Badge>
              </div>
              <CardDescription>
                Relational constraints available to expand the closure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schema.functional_dependencies.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No functional dependencies defined. The closure will equal the starting set $X$.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {schema.functional_dependencies.map((fd, idx) => {
                    const fdLhs: string[] = Array.isArray(fd.left) ? fd.left : Array.isArray((fd as any).lhs) ? (fd as any).lhs : [];
                    const fdRhs: string[] = Array.isArray(fd.right) ? fd.right : Array.isArray((fd as any).rhs) ? (fd as any).rhs : [];
                    const isDeterminantSatisfied = fdLhs.length > 0 && fdLhs.every((a: string) =>
                      (closureResult?.closure_attributes || selectedAttrs).includes(a)
                    );

                    return (
                      <div
                        key={fd.id || idx}
                        className={`flex items-center justify-between p-2 rounded-lg border text-xs font-mono transition-colors ${
                          isDeterminantSatisfied && closureResult
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{fdLhs.join(', ')}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{fdRhs.join(', ')}</span>
                        </div>
                        {isDeterminantSatisfied && closureResult && (
                          <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                            Fired
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. Dependency Implication Query (Does X -> Y hold?) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-500" />
                Query Implication ($X \to Y$)
              </CardTitle>
              <CardDescription>
                Check whether an arbitrary dependency is logically implied by $F$.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                    LHS (Determinant)
                  </label>
                  <select
                    multiple
                    value={queryLhs}
                    onChange={(e) =>
                      setQueryLhs(Array.from(e.target.selectedOptions, (opt) => opt.value))
                    }
                    className="w-full mt-1 p-1 text-xs font-mono rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 h-24"
                  >
                    {schema.attributes.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                    RHS (Dependent)
                  </label>
                  <select
                    multiple
                    value={queryRhs}
                    onChange={(e) =>
                      setQueryRhs(Array.from(e.target.selectedOptions, (opt) => opt.value))
                    }
                    className="w-full mt-1 p-1 text-xs font-mono rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 h-24"
                  >
                    {schema.attributes.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-mono text-slate-500">
                  {queryLhs.join(', ') || '...'} → {queryRhs.join(', ') || '...'}?
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={queryLhs.length === 0 || queryRhs.length === 0}
                  onClick={handleCheckImplication}
                  isLoading={isQueryLoading}
                >
                  Test Implication
                </Button>
              </div>

              {queryResult && (
                <div
                  className={`p-3 rounded-lg border text-xs leading-relaxed ${
                    queryResult.determined
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    {queryResult.determined ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{queryResult.determined ? 'Holds Under F' : 'Does Not Hold'}</span>
                  </div>
                  <p>{queryResult.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Closure Result, Superkey Status & Step Stepper (Cols 6-12) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Primary Closure Result Banner */}
          <Card className="border-indigo-200 dark:border-indigo-900/60 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-500" />
                  Attribute Closure Result
                </CardTitle>
                {closureResult && (
                  <Badge variant={closureResult.is_superkey ? 'success' : 'info'} size="sm">
                    {closureResult.is_superkey ? 'Superkey' : 'Partial Determinant'}
                  </Badge>
                )}
              </div>
              <CardDescription>
                Deterministic fixed-point closure of the starting attribute set.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!closureResult ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                  <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Awaiting Closure Execution
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Select starting attributes on the left and click "Calculate Closure" to
                    compute the complete set of functionally determined attributes.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Large Math Notation Box */}
                  <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono space-y-2">
                    <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                      Mathematical Notation
                    </div>
                    <div className="text-base sm:text-lg font-bold flex flex-wrap items-center gap-1.5 break-all">
                      <span className="text-indigo-400">
                        ({closureResult.input_attributes.join(', ')})⁺
                      </span>
                      <span className="text-slate-400">=</span>
                      <span>{'{'}</span>
                      {closureResult.closure_attributes.map((attr, idx) => {
                        const isOriginal = closureResult.input_attributes.includes(attr);
                        return (
                          <span key={attr} className="inline-flex items-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
                                isOriginal
                                  ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/40'
                                  : 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40'
                              }`}
                              title={isOriginal ? 'Starting Attribute' : 'Derived via Functional Dependency'}
                            >
                              {attr}
                            </span>
                            {idx < closureResult.closure_attributes.length - 1 && (
                              <span className="text-slate-500 ml-1">,</span>
                            )}
                          </span>
                        );
                      })}
                      <span>{'}'}</span>
                    </div>

                    <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400 border-t border-slate-800">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        Starting ({closureResult.input_attributes.length})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Derived ({closureResult.closure_attributes.length - closureResult.input_attributes.length})
                      </span>
                      <span className="ml-auto text-slate-400">
                        Converged in {closureResult.iterations} {closureResult.iterations === 1 ? 'pass' : 'passes'}
                      </span>
                    </div>
                  </div>

                  {/* Superkey Status Box */}
                  <div
                    className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                      closureResult.is_superkey
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                        : 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      {closureResult.is_superkey ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      )}
                      <span>
                        {closureResult.is_superkey
                          ? 'Superkey Criteria Satisfied'
                          : 'Not a Superkey'}
                      </span>
                    </div>
                    <p>{closureResult.superkey_reason}</p>
                    {closureResult.is_superkey && (
                      <div className="pt-2">
                        <Link to="/keys">
                          <Button size="sm" variant="primary" leftIcon={<Key className="w-3 h-3" />}>
                            Verify Candidate-Key Minimality in Keys Lab &rarr;
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Step-by-Step Reasoning Timeline */}
          {closureResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Closure Derivation Trace
                  </CardTitle>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={activeStepIndex === 0}
                      onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <span className="text-xs font-mono px-2 text-slate-600 dark:text-slate-400">
                      Step {activeStepIndex + 1} of {closureResult.steps.length}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={activeStepIndex === closureResult.steps.length - 1}
                      onClick={() =>
                        setActiveStepIndex((prev) =>
                          Math.min(closureResult.steps.length - 1, prev + 1)
                        )
                      }
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Step-by-step application of functional dependencies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Active Step Highlight Card */}
                {(() => {
                  const step: ClosureStep | undefined =
                    closureResult.steps[activeStepIndex] || closureResult.steps[0];
                  if (!step) return null;
                  const appliedLhs = step.applied_fd
                    ? Array.isArray(step.applied_fd.left)
                      ? step.applied_fd.left
                      : Array.isArray((step.applied_fd as any).lhs)
                      ? (step.applied_fd as any).lhs
                      : []
                    : [];
                  const appliedRhs = step.applied_fd
                    ? Array.isArray(step.applied_fd.right)
                      ? step.applied_fd.right
                      : Array.isArray((step.applied_fd as any).rhs)
                      ? (step.applied_fd as any).rhs
                      : []
                    : [];

                  return (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-2">
                        <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase">
                          {step.step_number === 1
                            ? 'Step 1: Initialization'
                            : `Step ${step.step_number}: Dependency Application`}
                        </span>
                        {step.applied_fd && appliedLhs.length > 0 && (
                          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            {appliedLhs.join(', ')} → {appliedRhs.join(', ')}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {step.explanation}
                      </p>

                      <div className="grid grid-cols-2 gap-3 pt-1 text-xs font-mono">
                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 block mb-0.5">
                            Before Step:
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">
                            {'{'} {(step.before_attributes || []).join(', ') || '∅'} {'}'}
                          </span>
                        </div>
                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900">
                          <span className="text-[10px] text-indigo-500 block mb-0.5 font-bold">
                            After Step:
                          </span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                            {'{'} {(step.after_attributes || []).join(', ') || '∅'} {'}'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Stepper Timeline List */}
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    Full Step History
                  </span>
                  <div className="space-y-1.5">
                    {closureResult.steps.map((s, idx) => {
                      const sLhs = s.applied_fd
                        ? Array.isArray(s.applied_fd.left)
                          ? s.applied_fd.left
                          : Array.isArray((s.applied_fd as any).lhs)
                          ? (s.applied_fd as any).lhs
                          : []
                        : [];
                      const sRhs = s.applied_fd
                        ? Array.isArray(s.applied_fd.right)
                          ? s.applied_fd.right
                          : Array.isArray((s.applied_fd as any).rhs)
                          ? (s.applied_fd as any).rhs
                          : []
                        : [];
                      const sAdded = s.added_attributes || [];
                      const sAfter = s.after_attributes || [];

                      return (
                        <button
                          key={s.step_number || idx}
                          type="button"
                          onClick={() => setActiveStepIndex(idx)}
                          className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                            activeStepIndex === idx
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-700 text-indigo-950 dark:text-indigo-200 shadow-xs'
                              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {s.step_number || idx + 1}
                            </span>
                            <span className="truncate">
                              {s.applied_fd && sLhs.length > 0
                                ? `${sLhs.join(', ')} → ${sRhs.join(', ')} (Added: ${sAdded.join(', ')})`
                                : `Initial set {${sAfter.join(', ')}}`}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 ml-2 shrink-0">
                            {sAfter.length} attrs
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. Pedagogical Guidance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                DBMS Academic Principles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div>
                <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  What is Attribute Closure ($X^+$)?
                </h5>
                <p>
                  The closure of an attribute set $X$ under a set of functional dependencies $F$,
                  denoted $X^+$, is the maximal set of all attributes that are uniquely determined
                  by $X$ using Armstrong's Inference Axioms.
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Armstrong's Inference Axioms
                </h5>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <strong>Reflexivity:</strong> If $Y \subseteq X$, then $X \to Y$.
                  </li>
                  <li>
                    <strong>Augmentation:</strong> If $X \to Y$, then $XZ \to YZ$.
                  </li>
                  <li>
                    <strong>Transitivity:</strong> If $X \to Y$ and $Y \to Z$, then $X \to Z$.
                  </li>
                </ul>
              </div>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <h5 className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Relationship to Candidate Keys
                </h5>
                <p>
                  An attribute set $K$ is a <em>superkey</em> if $K^+ = R$. To be a true{' '}
                  <em>candidate key</em>, $K$ must additionally be <em>minimal</em>: no proper subset
                  of $K$ may determine $R$. Candidate-key minimization is evaluated in the Keys Lab.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Example Selection Modal */}
      <ExampleModal
        isOpen={isExampleModalOpen}
        onClose={() => setIsExampleModalOpen(false)}
        onSelectExample={(exSchema) => {
          setSchema(exSchema);
          setSelectedAttrs(exSchema.attributes.length > 0 ? [exSchema.attributes[0]] : []);
          setClosureResult(null);
          setQueryResult(null);
          setError(null);
        }}
      />
    </div>
  );
};
