import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { SectionHeading } from '../components/ui/SectionHeading';
import {
  Database,
  Table,
  RotateCcw,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Layers,
  Network,
  HelpCircle,
  Key,
} from 'lucide-react';
import { SampleDataEditor } from '../features/analyzer/SampleDataEditor';
import { RawInputEditor } from '../features/analyzer/RawInputEditor';
import { SchemaPreview } from '../features/analyzer/SchemaPreview';
import { ValidationSummaryPanel } from '../features/analyzer/ValidationSummaryPanel';
import { ExampleModal } from '../features/analyzer/ExampleModal';
import { ResetConfirmModal } from '../features/analyzer/ResetConfirmModal';
import { VisualizationWorkspace } from '../features/visualization/VisualizationWorkspace';
import { schemaService } from '../services/schemaService';
import { EXAMPLE_SCHEMAS } from '../config/examples';
import type { RelationSchema, ValidationResult } from '../types';

const DRAFT_STORAGE_KEY = 'normalization_lab_draft_v1';

const DEFAULT_INITIAL_SCHEMA: RelationSchema = EXAMPLE_SCHEMAS[1].schema; // ENROLLMENT (Classic 2NF)

export const AnalyzerPage: React.FC = () => {
  const [inputTab, setInputTab] = useState<'raw' | 'sample'>('raw');
  const [selectedStage, setSelectedStage] = useState<'1NF' | '2NF' | '3NF' | '4NF'>('1NF');

  // Core canonical schema state
  const [schema, setSchema] = useState<RelationSchema>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return DEFAULT_INITIAL_SCHEMA;
  });

  // Validation state
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Modals
  const [isExampleModalOpen, setIsExampleModalOpen] = useState<boolean>(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Debounced auto-save & backend validation
  const validationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runValidation = useCallback(async (schemaToValidate: RelationSchema) => {
    setIsValidating(true);
    try {
      const res = await schemaService.validateSchema(schemaToValidate);
      setValidationResult(res);
    } catch (err) {
      console.warn('Backend validation unreachable, using optimistic local validation', err);
      // Fallback local check
      const errors = [];
      if (!schemaToValidate.name?.trim()) {
        errors.push({
          code: 'EMPTY_RELATION_NAME',
          path: 'name',
          message: 'Relation name is required.',
          severity: 'error' as const,
        });
      }
      if (schemaToValidate.attributes.length === 0) {
        errors.push({
          code: 'NO_ATTRIBUTES',
          path: 'attributes',
          message: 'Relation must contain at least one attribute.',
          severity: 'error' as const,
        });
      }
      setValidationResult({
        valid: errors.length === 0,
        errors,
        warnings: [],
        canonical_input: schemaToValidate,
      });
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Update schema and persist
  const updateSchema = useCallback(
    (newSchema: RelationSchema) => {
      setSchema(newSchema);
      setSaveStatus('saving');

      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(newSchema));
        setTimeout(() => setSaveStatus('saved'), 300);
      } catch (err) {
        console.error('Failed to save draft to localStorage', err);
      }

      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
      validationTimeoutRef.current = setTimeout(() => {
        runValidation(newSchema);
      }, 400);
    },
    [runValidation]
  );

  // Initial validation on mount
  useEffect(() => {
    runValidation(schema);
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, []);

  const handleResetConfirm = () => {
    const emptySchema: RelationSchema = {
      name: 'NEW_RELATION',
      attributes: ['ID', 'Name'],
      candidate_keys: [['ID']],
      functional_dependencies: [],
      multivalued_dependencies: [],
      sample_data: [],
    };
    updateSchema(emptySchema);
  };

  const handleSelectExample = (exampleSchema: RelationSchema) => {
    updateSchema(exampleSchema);
  };

  const inputTabs = [
    { id: 'raw', label: 'Raw Notation', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'sample', label: 'Sample Data', icon: <Table className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
      {/* Top Workspace Header */}
      <SectionHeading
        title="Normalization Analysis Workspace"
        subtitle="Desktop-first laboratory for relational schema definition, dependency validation, and 1NF–4NF decomposition."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm">
              Raw Notation & Validation
            </Badge>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              {saveStatus === 'saving' ? '● Saving...' : '✓ Saved locally'}
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<BookOpen className="w-3.5 h-3.5" />}
              onClick={() => setIsExampleModalOpen(true)}
              id="load-example-header-btn"
            >
              Load Example
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={() => setIsResetModalOpen(true)}
              title="Reset workspace to clean schema"
              id="reset-workspace-header-btn"
            >
              Reset
            </Button>
            <Link to="/closure" id="header-closure-lab-btn">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                title="Launch Attribute Closure Lab"
              >
                Closure Lab
              </Button>
            </Link>
            <Link to="/keys" id="header-keys-lab-btn">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Key className="w-3.5 h-3.5 text-indigo-500" />}
                title="Launch Candidate Key & Superkey Lab"
              >
                Keys Lab
              </Button>
            </Link>
            <Button
              size="sm"
              variant="primary"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => runValidation(schema)}
              isLoading={isValidating}
              id="validate-continue-btn"
            >
              Validate Input
            </Button>
          </div>
        }
      />

      {/* 3-Column Desktop Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: Schema Input Workspace (Cols 1-4) */}
        <section className="lg:col-span-4 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-500" />
                  Schema & Dependency Input
                </CardTitle>
                <Badge variant={inputTab === 'raw' ? 'accent' : 'neutral'} size="sm">
                  {inputTab === 'raw' ? 'Raw Mode' : 'Data Mode'}
                </Badge>
              </div>
              <CardDescription>
                Define relational attributes, candidate keys, and dependencies using raw DBMS notation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs
                tabs={inputTabs}
                activeTab={inputTab}
                onChange={(tabId) => setInputTab(tabId as 'raw' | 'sample')}
              />

              {/* TAB 1: RAW DBMS NOTATION */}
              {inputTab === 'raw' && (
                <RawInputEditor
                  initialSchema={schema}
                  onParsedSuccess={(parsed) => updateSchema(parsed)}
                />
              )}

              {/* TAB 2: SAMPLE DATA TABLE */}
              {inputTab === 'sample' && (
                <SampleDataEditor
                  attributes={schema.attributes}
                  sampleData={schema.sample_data || []}
                  onChange={(data) => updateSchema({ ...schema, sample_data: data })}
                />
              )}
            </CardContent>
          </Card>
        </section>

        {/* COLUMN 2: Live Preview & Canvas Shell (Cols 5-8) */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Live Relational Preview
                </CardTitle>
                <Badge variant="neutral" size="sm">
                  Canonical Signature
                </Badge>
              </div>
              <CardDescription>
                Synchronized preview of the relational schema, candidate keys, and dependencies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SchemaPreview schema={schema} />
            </CardContent>
          </Card>

          {/* Phase 8 Interactive Normalization Visualizer & Dependency Graph */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Interactive Visualization & Normalization Engine
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {(['1NF', '2NF', '3NF', '4NF'] as const).map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setSelectedStage(stage)}
                    className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-colors ${
                      selectedStage === stage
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
                <Badge variant="accent" size="sm">
                  Interactive Graph
                </Badge>
              </div>
            </div>
            <VisualizationWorkspace
              schema={schema}
              initialMode="graph"
              initialStage={selectedStage}
            />
          </div>
        </section>

        {/* COLUMN 3: Validation Summary & Academic Insights (Cols 9-12) */}
        <section className="lg:col-span-3 flex flex-col gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                  Validation Summary
                </CardTitle>
                <Badge variant={validationResult?.valid ? 'success' : 'error'} size="sm">
                  {validationResult?.valid ? 'Valid Schema' : 'Validation Needed'}
                </Badge>
              </div>
              <CardDescription>
                Layered structural, referential, and uniqueness checks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ValidationSummaryPanel
                schema={schema}
                validationResult={validationResult}
                isValidating={isValidating}
                onValidate={() => runValidation(schema)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  Academic Criteria
                </CardTitle>
                <Badge variant="neutral" size="sm">
                  {selectedStage} Focus
                </Badge>
              </div>
              <CardDescription>
                Theoretical requirements for Normal Form stages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Normal Form Criteria: {selectedStage}
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {selectedStage === '1NF' &&
                    'Requires all attribute values to be atomic and indivisible. Disallows multi-valued attributes and repeating groups.'}
                  {selectedStage === '2NF' &&
                    'Requires 1NF + no non-prime attribute may depend on a proper subset of any composite candidate key (no partial dependencies).'}
                  {selectedStage === '3NF' &&
                    'Requires 2NF + for every non-trivial FD X → A, either X is a superkey or A is a prime attribute (no transitive dependencies).'}
                  {selectedStage === '4NF' &&
                    'Requires BCNF/3NF + for every non-trivial multivalued dependency X ↠ Y, X must be a superkey.'}
                </p>
              </div>

              <div className="p-4 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-center">
                <HelpCircle className="w-5 h-5 text-slate-400 mx-auto mb-2" />
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Awaiting Normalization Engine
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Attribute closure traces ($X^+$), automatic candidate keys, and decomposition steps
                  are computed automatically by the normalization engine.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Modals */}
      <ExampleModal
        isOpen={isExampleModalOpen}
        onClose={() => setIsExampleModalOpen(false)}
        onSelectExample={handleSelectExample}
      />
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirm}
      />
    </div>
  );
};
