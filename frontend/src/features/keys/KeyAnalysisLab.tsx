import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Key,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Layers,
  Search,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ExampleModal } from '../analyzer/ExampleModal';
import { keyService } from '../../services/keyService';
import { historyService } from '../../services/historyService';
import { EXAMPLE_SCHEMAS } from '../../config/examples';
import type {
  RelationSchema,
  KeyVerificationResult,
  CandidateKeyAnalysisResult,
} from '../../types';

const DRAFT_STORAGE_KEY = 'normalization_lab_draft_v1';

interface KeyAnalysisLabProps {
  initialSchema?: RelationSchema;
}

export const KeyAnalysisLab: React.FC<KeyAnalysisLabProps> = ({ initialSchema }) => {
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

  // Analysis State
  const [analysisResult, setAnalysisResult] = useState<CandidateKeyAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Custom key testing input
  const [customKeyAttrs, setCustomKeyAttrs] = useState<string[]>([]);
  const [customKeyResult, setCustomKeyResult] = useState<KeyVerificationResult | null>(null);
  const [isVerifyingCustom, setIsVerifyingCustom] = useState<boolean>(false);

  // Active expanded proof/reasoning states
  const [expandedReasoningIndex, setExpandedReasoningIndex] = useState<number | null>(null);
  const [expandedProofKey, setExpandedProofKey] = useState<string | null>(null);

  // Example Modal
  const [isExampleModalOpen, setIsExampleModalOpen] = useState<boolean>(false);

  // Load from Analyzer draft
  const handleLoadFromDraft = () => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSchema(parsed);
        setAnalysisResult(null);
        setCustomKeyResult(null);
        setError(null);
        return;
      }
    } catch {
      // ignore
    }
    setError('No saved schema draft found in localStorage.');
  };

  // Run full automatic key analysis & user-provided key verification
  const handleRunAnalysis = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await keyService.analyzeKeys({
        relation_name: schema.name,
        attributes: schema.attributes,
        functional_dependencies: schema.functional_dependencies,
        user_candidate_keys: schema.candidate_keys || [],
      });
      setAnalysisResult(res);
      // Persist to history
      historyService.recordKeyAnalysis(schema, res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to analyze candidate keys.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify custom interactive key selection
  const handleVerifyCustomKey = async () => {
    if (customKeyAttrs.length === 0) return;
    setIsVerifyingCustom(true);
    try {
      const res = await keyService.verifyKey({
        relation_name: schema.name,
        attributes: schema.attributes,
        functional_dependencies: schema.functional_dependencies,
        candidate_key: customKeyAttrs,
      });
      setCustomKeyResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to verify key.';
      setError(msg);
    } finally {
      setIsVerifyingCustom(false);
    }
  };

  const toggleCustomKeyAttr = (attr: string) => {
    if (customKeyAttrs.includes(attr)) {
      setCustomKeyAttrs(customKeyAttrs.filter((a) => a !== attr));
    } else {
      setCustomKeyAttrs([...customKeyAttrs, attr]);
    }
    setCustomKeyResult(null);
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
            {(schema.candidate_keys || []).length > 0 && (
              <Badge variant="neutral" size="sm">
                {schema.candidate_keys?.length} User Key{schema.candidate_keys?.length === 1 ? '' : 's'}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Candidate-Key derivation engine, minimality testing, and prime attribute classification.
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
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={handleRunAnalysis}
            isLoading={isLoading}
            id="find-candidate-keys-btn"
          >
            Find Candidate Keys
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Discovered Keys, Prime Attributes & Concepts (Cols 1-7) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Primary Discovered Candidate Keys Card */}
          <Card className="border-indigo-200 dark:border-indigo-900/60 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-500" />
                  Candidate Keys Discovered
                </CardTitle>
                {analysisResult && (
                  <Badge variant="accent" size="sm">
                    {analysisResult.discovered_candidate_keys.length} Key
                    {analysisResult.discovered_candidate_keys.length === 1 ? '' : 's'} Found
                  </Badge>
                )}
              </div>
              <CardDescription>
                Minimal superkeys that uniquely determine every tuple in the relation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!analysisResult ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Awaiting Candidate-Key Discovery
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    Click <strong>"Find Candidate Keys"</strong> above to derive all minimal superkeys
                    using deterministic attribute closure and superset pruning.
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleRunAnalysis}
                    isLoading={isLoading}
                    leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  >
                    Run Key Analysis
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {analysisResult.discovered_candidate_keys.map((keyAttrs, idx) => {
                    const keyString = keyAttrs.join(', ');
                    const isComposite = keyAttrs.length > 1;
                    const isProofExpanded = expandedProofKey === keyString;

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-indigo-200/80 dark:border-indigo-900/60 space-y-3 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                              <Key className="w-4 h-4" />
                            </span>
                            <div>
                              <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                                🔑 ({keyString})
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                {isComposite
                                  ? `Composite Key (${keyAttrs.length} attributes)`
                                  : 'Single Attribute Key'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="success" size="sm">
                              ✓ Minimal Superkey
                            </Badge>
                            <Link to="/closure" title="Explore closure in Closure Lab">
                              <Button size="sm" variant="outline">
                                View Closure ($X^+$)
                              </Button>
                            </Link>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setExpandedProofKey(isProofExpanded ? null : keyString)
                              }
                              leftIcon={
                                isProofExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )
                              }
                            >
                              Proof
                            </Button>
                          </div>
                        </div>

                        {/* Minimality Proof Drawer */}
                        {isProofExpanded && (
                          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                            <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Minimality & Uniqueness Proof</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                              1. <strong>Superkey Property</strong>: The closure ({keyString})⁺ = {'{'}
                              {schema.attributes.join(', ')}{'}'} covers all attributes of {schema.name}.
                            </p>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                              2. <strong>Minimality Property</strong>:{' '}
                              {isComposite
                                ? `All ${keyAttrs.length} proper subsets were evaluated. Removing any attribute causes the closure to lose complete relation coverage.`
                                : `Single-attribute set has no non-empty proper subsets; therefore minimality is trivially satisfied.`}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Prime vs. Non-Prime Attributes Partition Card */}
          {analysisResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Attribute Classification
                  </CardTitle>
                  <span className="text-xs font-mono text-slate-400">
                    {schema.attributes.length} Total
                  </span>
                </div>
                <CardDescription>
                  Essential for evaluating Second (2NF) and Third (3NF) Normal Forms.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prime Attributes */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200 uppercase tracking-wider">
                        Prime Attributes ({analysisResult.prime_attributes.length})
                      </span>
                      <Badge variant="accent" size="sm">
                        Key Members
                      </Badge>
                    </div>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 leading-tight">
                      Attributes that participate in at least one candidate key.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {analysisResult.prime_attributes.map((attr) => (
                        <span
                          key={attr}
                          className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-white dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 shadow-2xs"
                        >
                          {attr}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Non-Prime Attributes */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Non-Prime Attributes ({analysisResult.non_prime_attributes.length})
                      </span>
                      <Badge variant="neutral" size="sm">
                        Non-Key
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      Attributes that do not belong to any candidate key.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {analysisResult.non_prime_attributes.length === 0 ? (
                        <span className="text-xs font-mono text-slate-400 italic">
                          None (All attributes are prime)
                        </span>
                      ) : (
                        analysisResult.non_prime_attributes.map((attr) => (
                          <span
                            key={attr}
                            className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs"
                          >
                            {attr}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. Educational Theory Callout: Superkey vs Candidate Key */}
          <Card className="bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/60 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-wider font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                DBMS Academic Principles: Superkey vs. Candidate Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-indigo-500" />
                    Superkey ($SK$)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Any attribute set $X$ whose functional closure equals the complete relation ($X^+ = R$). May include extraneous/redundant attributes.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 space-y-1">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-indigo-500" />
                    Candidate Key ($CK$)
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    A <strong>minimal superkey</strong>. It satisfies $K^+ = R$ AND no proper subset $S \subset K$ is a superkey.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: User Key Verification & Discovery Steps (Cols 8-12) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. User-Provided Key Verification */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-500" />
                  User-Provided Key Verification
                </CardTitle>
                <Badge variant="neutral" size="sm">
                  {(schema.candidate_keys || []).length} In Schema
                </Badge>
              </div>
              <CardDescription>
                Validates student-provided keys for both the Superkey and Minimality conditions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing keys from schema */}
              {(schema.candidate_keys || []).length === 0 ? (
                <div className="p-3 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-center">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    No candidate keys were manually entered in the schema builder.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(analysisResult?.user_key_verifications || []).map((v, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                        v.is_candidate_key
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                          : v.is_superkey
                          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                          : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                          ({v.candidate_key.join(', ')})
                        </span>
                        <Badge
                          variant={
                            v.is_candidate_key
                              ? 'success'
                              : v.is_superkey
                              ? 'warning'
                              : 'error'
                          }
                          size="sm"
                        >
                          {v.is_candidate_key
                            ? 'Valid Key'
                            : v.is_superkey
                            ? 'Superkey (Not Minimal)'
                            : 'Not a Superkey'}
                        </Badge>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                        {v.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Interactive Custom Key Tester */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Test Arbitrary Attribute Set
                  </span>
                  <span className="text-[11px] font-mono text-indigo-500">
                    ({customKeyAttrs.join(', ') || '∅'})
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  {schema.attributes.map((attr) => {
                    const isSelected = customKeyAttrs.includes(attr);
                    return (
                      <button
                        key={attr}
                        type="button"
                        onClick={() => toggleCustomKeyAttr(attr)}
                        className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                        }`}
                      >
                        {isSelected ? `✓ ${attr}` : attr}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  {customKeyAttrs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCustomKeyAttrs([])}
                      className="text-xs text-slate-400 hover:text-slate-600 underline"
                    >
                      Clear
                    </button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={customKeyAttrs.length === 0}
                    onClick={handleVerifyCustomKey}
                    isLoading={isVerifyingCustom}
                    className="ml-auto"
                    leftIcon={<Search className="w-3.5 h-3.5" />}
                    id="verify-custom-key-btn"
                  >
                    Verify ({customKeyAttrs.join(', ') || 'K'})
                  </Button>
                </div>

                {customKeyResult && (
                  <div
                    className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                      customKeyResult.is_candidate_key
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                        : customKeyResult.is_superkey
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                        : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        ({customKeyResult.candidate_key.join(', ')})
                      </span>
                      <Badge
                        variant={
                          customKeyResult.is_candidate_key
                            ? 'success'
                            : customKeyResult.is_superkey
                            ? 'warning'
                            : 'error'
                        }
                        size="sm"
                      >
                        {customKeyResult.is_candidate_key
                          ? 'Valid Candidate Key'
                          : customKeyResult.is_superkey
                          ? 'Superkey (Not Minimal)'
                          : 'Not a Superkey'}
                      </Badge>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                      {customKeyResult.explanation}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Step-by-Step Discovery Reasoning Timeline */}
          {analysisResult && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-500" />
                    Discovery Derivation Trace
                  </CardTitle>
                  <Badge variant="neutral" size="sm">
                    {analysisResult.reasoning_steps.length} Steps
                  </Badge>
                </div>
                <CardDescription>
                  Mathematical steps taken by the algorithm to discover candidate keys.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.reasoning_steps.map((step, idx) => {
                  const isExpanded = expandedReasoningIndex === idx;

                  return (
                    <div
                      key={step.step_number}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => setExpandedReasoningIndex(isExpanded ? null : idx)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold flex items-center justify-center">
                            {step.step_number}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {step.title}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {step.description}
                      </p>

                      {isExpanded && step.details && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-1">
                          {Object.entries(step.details).map(([key, val]) => (
                            <div key={key} className="flex items-start gap-1">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {key}:
                              </span>
                              <span className="break-all">
                                {Array.isArray(val) ? val.join(', ') || '∅' : JSON.stringify(val)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Example Modal */}
      <ExampleModal
        isOpen={isExampleModalOpen}
        onClose={() => setIsExampleModalOpen(false)}
        onSelectExample={(selectedSchema) => {
          setSchema(selectedSchema);
          setAnalysisResult(null);
          setCustomKeyResult(null);
          setError(null);
          setIsExampleModalOpen(false);
        }}
      />
    </div>
  );
};
