import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ReportDownloadModal } from '../features/reports/ReportDownloadModal';
import {
  historyService,
  HISTORY_UPDATED_EVENT,
} from '../services/historyService';
import { EXAMPLE_SCHEMAS } from '../config/examples';
import type {
  HistoryItem,
  HistoryAnalysisType,
  RelationSchema,
  FullNormalizationAnalysisResult,
} from '../types';
import {
  History,
  Layers,
  Key,
  Sparkles,
  Bookmark,
  Download,
  Trash2,
  RotateCcw,
  Play,
  Search,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Eye,
  RefreshCw,
  Clock,
  Database,
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  // Modals state
  const [inspectItem, setInspectItem] = useState<HistoryItem | null>(null);
  const [reportItem, setReportItem] = useState<HistoryItem | null>(null);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState<boolean>(false);

  // Hidden file input ref for JSON import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch items from historyService
  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await historyService.getHistory();
      setItems(data);
    } catch (err) {
      console.warn('Error loading history', err);
      setItems(historyService.getLocalHistory());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();

    const handleHistoryUpdate = () => {
      loadHistory();
    };

    window.addEventListener(HISTORY_UPDATED_EVENT, handleHistoryUpdate);
    return () => {
      window.removeEventListener(HISTORY_UPDATED_EVENT, handleHistoryUpdate);
    };
  }, [loadHistory]);

  const showToast = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Type filter
      if (selectedType !== 'all' && item.analysis_type !== selectedType) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inTitle = item.title?.toLowerCase().includes(query);
        const inRelation = item.relation_name?.toLowerCase().includes(query);
        const inHnf = item.highest_normal_form?.toLowerCase().includes(query);
        const inAttrs = item.schema_data?.attributes?.some((a) =>
          a.toLowerCase().includes(query)
        );
        return inTitle || inRelation || inHnf || inAttrs;
      }
      return true;
    });
  }, [items, selectedType, searchQuery]);

  // Metric counts
  const counts = useMemo(() => {
    const total = items.length;
    const normalization = items.filter((i) => i.analysis_type === 'normalization').length;
    const keys = items.filter((i) => i.analysis_type === 'keys').length;
    const closure = items.filter((i) => i.analysis_type === 'closure').length;
    const snapshots = items.filter((i) => i.analysis_type === 'snapshot').length;
    return { total, normalization, keys, closure, snapshots };
  }, [items]);

  // Actions
  const handleDeleteItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await historyService.deleteHistoryItem(id);
    showToast('Record removed from history.');
    loadHistory();
  };

  const handleClearAll = async () => {
    await historyService.clearAllHistory();
    setIsClearConfirmOpen(false);
    showToast('All execution history records cleared.');
    loadHistory();
  };

  const handleRestoreToWorkspace = (schema: RelationSchema, destination: 'analyzer' | 'normalize') => {
    historyService.restoreSchemaToWorkspace(schema);
    showToast(`Restored schema ${schema.name} to active workspace.`);
    if (destination === 'normalize') {
      navigate('/normalize');
    } else {
      navigate('/analyzer');
    }
  };

  const handleExportJson = () => {
    const jsonStr = historyService.exportHistoryJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `normalization-lab-history-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Exported history as JSON.');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const count = await historyService.importHistoryJson(text);
        showToast(`Successfully imported ${count} history record${count === 1 ? '' : 's'}.`);
        loadHistory();
      } catch (err) {
        alert(`Failed to import history file: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSampleHistory = async () => {
    setIsLoading(true);
    try {
      // 1. Enrollment 2NF Run
      const ex2 = EXAMPLE_SCHEMAS[1].schema;
      await historyService.recordNormalizationAnalysis(ex2, {
        relation_name: ex2.name,
        attributes: ex2.attributes,
        functional_dependencies: ex2.functional_dependencies,
        multivalued_dependencies: [],
        candidate_keys: [['StudentID', 'CourseID']],
        prime_attributes: ['StudentID', 'CourseID'],
        non_prime_attributes: ['StudentName', 'CourseName', 'Grade'],
        step_analyses: {
          '1NF': { status: 'SATISFIED', message: 'All attribute values atomic.' },
          '2NF': {
            status: 'VIOLATED',
            message: 'Partial dependencies detected on composite key (StudentID, CourseID).',
            violations: [
              {
                determinant: ['StudentID'],
                dependent_attributes: ['StudentName'],
                determinant_is_superkey: false,
                is_partial: true,
              },
              {
                determinant: ['CourseID'],
                dependent_attributes: ['CourseName'],
                determinant_is_superkey: false,
                is_partial: true,
              },
            ],
          },
          '3NF': { status: 'NOT_EVALUATED' },
          '4NF': { status: 'NOT_EVALUATED' },
        },
        highest_confirmed_normal_form: '1NF',
        decomposition_result: {
          sub_relations: [
            { name: 'ENROLLMENT_1', attributes: ['StudentID', 'StudentName'] },
            { name: 'ENROLLMENT_2', attributes: ['CourseID', 'CourseName'] },
            { name: 'ENROLLMENT_3', attributes: ['StudentID', 'CourseID', 'Grade'] },
          ],
          is_lossless: true,
          is_dependency_preserving: true,
        },
      } as any, 'ENROLLMENT (Classic 2NF Partial Dependency)');

      // 2. Staff Branch 3NF Run
      const ex3 = EXAMPLE_SCHEMAS[2].schema;
      await historyService.recordNormalizationAnalysis(ex3, {
        relation_name: ex3.name,
        attributes: ex3.attributes,
        functional_dependencies: ex3.functional_dependencies,
        multivalued_dependencies: [],
        candidate_keys: [['StaffNo']],
        prime_attributes: ['StaffNo'],
        non_prime_attributes: ['SName', 'Position', 'Salary', 'BranchNo', 'BAddress'],
        step_analyses: {
          '1NF': { status: 'SATISFIED' },
          '2NF': { status: 'SATISFIED' },
          '3NF': {
            status: 'VIOLATED',
            message: 'Transitive dependency BranchNo → BAddress detected.',
            violations: [
              {
                determinant: ['BranchNo'],
                dependent_attributes: ['BAddress'],
                determinant_is_superkey: false,
              },
            ],
          },
          '4NF': { status: 'NOT_EVALUATED' },
        },
        highest_confirmed_normal_form: '2NF',
        decomposition_result: {
          sub_relations: [
            { name: 'STAFF_1', attributes: ['StaffNo', 'SName', 'Position', 'Salary', 'BranchNo'] },
            { name: 'STAFF_2', attributes: ['BranchNo', 'BAddress'] },
          ],
          is_lossless: true,
          is_dependency_preserving: true,
        },
      } as any, 'STAFF_BRANCH (Transitive Dependency & 3NF)');

      // 3. Candidate Key Analysis Run
      await historyService.recordKeyAnalysis(ex2, {
        relation_name: ex2.name,
        attributes: ex2.attributes,
        functional_dependencies: ex2.functional_dependencies,
        candidate_keys: [['StudentID', 'CourseID']],
        superkeys: [['StudentID', 'CourseID'], ['StudentID', 'CourseID', 'Grade']],
        prime_attributes: ['StudentID', 'CourseID'],
        non_prime_attributes: ['StudentName', 'CourseName', 'Grade'],
        reasoning_steps: [
          'Initial core attributes with no RHS incoming edges: {StudentID, CourseID}.',
          'Attribute closure {StudentID, CourseID}⁺ derives all attributes: {StudentID, CourseID, StudentName, CourseName, Grade}.',
          'Minimal superkey condition satisfied: (StudentID, CourseID) is the unique candidate key.',
        ],
      } as any, 'ENROLLMENT Key Derivation');

      // 4. Attribute Closure Calculation Run
      await historyService.recordClosureAnalysis(ex2, ['StudentID'], {
        relation_name: ex2.name,
        target_attributes: ['StudentID'],
        closure: ['StudentID', 'StudentName'],
        is_superkey: false,
        steps: [
          { step_number: 1, current_closure: ['StudentID'], fired_fd: null, explanation: 'Starting target set.' },
          { step_number: 2, current_closure: ['StudentID', 'StudentName'], fired_fd: { left: ['StudentID'], right: ['StudentName'] }, explanation: 'Fired StudentID → StudentName.' },
        ],
      } as any, '{StudentID}⁺ Attribute Closure');

      showToast('Loaded 4 academic sample history records.');
      await loadHistory();
    } catch (err) {
      console.error('Failed to load sample history', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeBadge = (type: HistoryAnalysisType, hnf?: string) => {
    switch (type) {
      case 'normalization':
        return (
          <div className="flex items-center gap-1.5">
            <Badge variant="accent" size="sm" className="flex items-center gap-1 font-semibold">
              <Layers className="w-3 h-3 text-indigo-500" />
              Normalization
            </Badge>
            {hnf && (
              <Badge
                variant={
                  hnf === '3NF' || hnf === 'BCNF' || hnf === '4NF'
                    ? 'success'
                    : hnf === '2NF'
                    ? 'warning'
                    : 'neutral'
                }
                size="sm"
                className="font-mono font-bold"
              >
                {hnf}
              </Badge>
            )}
          </div>
        );
      case 'keys':
        return (
          <Badge variant="warning" size="sm" className="flex items-center gap-1 font-semibold">
            <Key className="w-3 h-3 text-amber-500" />
            Candidate Keys
          </Badge>
        );
      case 'closure':
        return (
          <Badge variant="info" size="sm" className="flex items-center gap-1 font-semibold">
            <Sparkles className="w-3 h-3 text-cyan-500" />
            Attribute Closure
          </Badge>
        );
      case 'snapshot':
        return (
          <Badge variant="neutral" size="sm" className="flex items-center gap-1 font-semibold">
            <Bookmark className="w-3 h-3 text-emerald-500" />
            Snapshot
          </Badge>
        );
      default:
        return <Badge variant="neutral" size="sm">{type}</Badge>;
    }
  };

  return (
    <div className="flex flex-col flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Toast Notification */}
      {feedbackMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-3.5 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xl border border-slate-700 dark:border-slate-300 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Hidden File Input for JSON import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJson}
        accept=".json"
        className="hidden"
      />

      {/* Page Header */}
      <SectionHeading
        title="Execution & Analysis History"
        subtitle="Chronological audit trail of relational schema normalization evaluations, candidate keys, attribute closures, and schema snapshots."
        badge={
          <div className="flex items-center gap-2">
            <Badge variant="accent" size="sm">
              Live Relational Audit Trail
            </Badge>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {items.length} {items.length === 1 ? 'record' : 'records'} stored
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Upload className="w-3.5 h-3.5" />}
              onClick={() => fileInputRef.current?.click()}
              title="Import past runs from JSON file"
              id="import-history-btn"
            >
              Import JSON
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Download className="w-3.5 h-3.5" />}
              onClick={handleExportJson}
              disabled={items.length === 0}
              title="Export all history items as JSON"
              id="export-history-btn"
            >
              Export JSON
            </Button>
            {items.length > 0 ? (
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                onClick={() => setIsClearConfirmOpen(true)}
                title="Clear all stored analysis history"
                id="clear-history-btn"
              >
                Clear All
              </Button>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                onClick={handleLoadSampleHistory}
                title="Load realistic DBMS sample history items"
                id="load-sample-history-btn"
              >
                Load Sample History
              </Button>
            )}
            <Link to="/normalize">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Play className="w-3.5 h-3.5" />}
                id="header-open-lab-btn"
              >
                Normalize Lab
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Overview Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Runs
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {counts.total}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <History className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Normalization
              </p>
              <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {counts.normalization}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Keys & Closures
              </p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {counts.keys + counts.closure}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Key className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Snapshots
              </p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {counts.snapshots}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Bookmark className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
        <CardContent className="p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by relation name, attributes, or normal form..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              id="history-search-input"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase mr-1">
              Filter:
            </span>
            {[
              { id: 'all', label: `All (${counts.total})` },
              { id: 'normalization', label: `Normalization (${counts.normalization})` },
              { id: 'keys', label: `Keys (${counts.keys})` },
              { id: 'closure', label: `Closure (${counts.closure})` },
              { id: 'snapshot', label: `Snapshots (${counts.snapshots})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedType === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* History Items List */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-500">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
          <p className="text-xs">Loading execution history...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="py-16">
            <EmptyState
              icon={<History className="w-8 h-8 text-slate-400" />}
              title={searchQuery || selectedType !== 'all' ? 'No matching records' : 'No analysis history yet'}
              description={
                searchQuery || selectedType !== 'all'
                  ? 'Try adjusting your search query or filter to find past analyses.'
                  : 'Every time you evaluate schemas, derive candidate keys, or compute attribute closures, your run will be stored here automatically for quick retrieval, comparison, and report generation.'
              }
              action={
                <div className="flex items-center gap-3">
                  {items.length === 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                      onClick={handleLoadSampleHistory}
                    >
                      Load Academic Sample History
                    </Button>
                  )}
                  <Link to="/normalize">
                    <Button size="sm" leftIcon={<Play className="w-3.5 h-3.5" />}>
                      Open Normalization Lab
                    </Button>
                  </Link>
                </div>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3.5">
          {filteredItems.map((item) => {
            const dateObj = new Date(item.created_at);
            const dateStr = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) +
                ' at ' +
                dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : item.created_at;

            const schema = item.schema_data;
            const hnf = item.highest_normal_form || item.summary?.highest_normal_form;

            return (
              <Card
                key={item.id}
                className="border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all shadow-xs group"
              >
                <CardContent className="p-5 space-y-3">
                  {/* Top line: Badges & Timestamp */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getTypeBadge(item.analysis_type, hnf)}
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {/* Schema Signature */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Database className="w-3.5 h-3.5 text-indigo-500" />
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {schema.name}
                        </span>
                        <span className="text-slate-500 font-mono">
                          ({schema.attributes?.join(', ')})
                        </span>
                      </div>

                      {/* Summary Metrics */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 flex-wrap">
                        {item.analysis_type === 'normalization' && (
                          <>
                            <span>
                              <strong>Candidate Keys:</strong>{' '}
                              <code className="font-mono text-indigo-600 dark:text-indigo-400">
                                {item.summary?.candidate_keys?.length
                                  ? item.summary.candidate_keys.join(' | ')
                                  : (schema.candidate_keys || []).map((k) => k.join(', ')).join(' | ') || 'None'}
                              </code>
                            </span>
                            <span>
                              <strong>Violations:</strong>{' '}
                              <span
                                className={
                                  (item.summary?.violations_count || 0) > 0
                                    ? 'text-amber-600 dark:text-amber-400 font-medium'
                                    : 'text-emerald-600 dark:text-emerald-400 font-medium'
                                }
                              >
                                {item.summary?.violations_count || 0} detected
                              </span>
                            </span>
                            {item.summary?.decomposed_count ? (
                              <span>
                                <strong>Decomposition:</strong> {item.summary.decomposed_count} sub-relations
                              </span>
                            ) : null}
                          </>
                        )}

                        {item.analysis_type === 'keys' && (
                          <>
                            <span>
                              <strong>Candidate Keys:</strong>{' '}
                              <code className="font-mono text-amber-600 dark:text-amber-400">
                                {item.summary?.candidate_keys?.join(' | ') || 'None'}
                              </code>
                            </span>
                            <span>
                              <strong>Prime:</strong>{' '}
                              {item.summary?.prime_attributes?.join(', ') || 'None'}
                            </span>
                          </>
                        )}

                        {item.analysis_type === 'closure' && (
                          <>
                            <span>
                              <strong>Formula:</strong>{' '}
                              <code className="font-mono text-cyan-600 dark:text-cyan-400">
                                &#123;{item.summary?.target_attributes?.join(', ')}&#125;⁺ = &#123;
                                {item.summary?.closure_attributes?.join(', ')}&#125;
                              </code>
                            </span>
                            <span>
                              <strong>Steps:</strong> {item.summary?.steps_count || 0}
                            </span>
                            <span>
                              {item.summary?.is_superkey ? (
                                <Badge variant="success" size="sm">✓ Superkey</Badge>
                              ) : (
                                <Badge variant="neutral" size="sm">Not Superkey</Badge>
                              )}
                            </span>
                          </>
                        )}

                        {item.analysis_type === 'snapshot' && (
                          <span>
                            <strong>Saved State:</strong> {item.highest_normal_form || 'Snapshot'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap self-end md:self-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Eye className="w-3 h-3 text-slate-500" />}
                        onClick={() => setInspectItem(item)}
                        className="text-xs py-1 px-2.5 h-7"
                        title="Inspect detailed analysis records"
                      >
                        Inspect
                      </Button>

                      {item.analysis_type === 'normalization' && item.analysis_result && (
                        <Button
                          size="sm"
                          variant="secondary"
                          leftIcon={<Download className="w-3 h-3 text-indigo-500" />}
                          onClick={() => setReportItem(item)}
                          className="text-xs py-1 px-2.5 h-7"
                          title="Generate and download academic report (PDF, DOCX, TXT)"
                        >
                          Report
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<Play className="w-3 h-3 text-indigo-500" />}
                        onClick={() => handleRestoreToWorkspace(schema, 'normalize')}
                        className="text-xs py-1 px-2.5 h-7"
                        title="Restore schema into Normalization Lab"
                      >
                        Open in Lab
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        leftIcon={<RotateCcw className="w-3 h-3 text-slate-500" />}
                        onClick={() => handleRestoreToWorkspace(schema, 'analyzer')}
                        className="text-xs py-1 px-2.5 h-7"
                        title="Load into Analyzer Workspace"
                      >
                        To Analyzer
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => handleDeleteItem(e, item.id)}
                        className="text-xs py-1 px-2 h-7 text-rose-500 hover:text-rose-600 hover:border-rose-300"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Inspect Item Modal */}
      {inspectItem && (
        <Modal
          isOpen={!!inspectItem}
          onClose={() => setInspectItem(null)}
          title={`Analysis Record: ${inspectItem.title}`}
          description={`Logged on ${new Date(inspectItem.created_at).toLocaleString()}`}
          maxWidth="lg"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInspectItem(null)}
              >
                Close
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  onClick={() => {
                    handleRestoreToWorkspace(inspectItem.schema_data, 'analyzer');
                    setInspectItem(null);
                  }}
                >
                  Load in Analyzer
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Play className="w-3.5 h-3.5" />}
                  onClick={() => {
                    handleRestoreToWorkspace(inspectItem.schema_data, 'normalize');
                    setInspectItem(null);
                  }}
                >
                  Run in Normalization Lab
                </Button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 text-xs">
            {/* Schema Signature */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  Schema Specification
                </span>
                {inspectItem.highest_normal_form && (
                  <Badge variant="accent" size="sm">
                    Confirmed HNF: {inspectItem.highest_normal_form}
                  </Badge>
                )}
              </div>
              <div className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                {inspectItem.schema_data.name}({inspectItem.schema_data.attributes.join(', ')})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="font-semibold text-slate-500">Candidate Keys: </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {(inspectItem.schema_data.candidate_keys || []).map((k) => `(${k.join(', ')})`).join(', ') || 'Auto-derived'}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">FD Count: </span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {inspectItem.schema_data.functional_dependencies?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Normalization Details if applicable */}
            {inspectItem.analysis_type === 'normalization' && inspectItem.analysis_result && (
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Normal Form Stage Outcomes
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(['1NF', '2NF', '3NF', '4NF'] as const).map((stage) => {
                    const step = inspectItem.analysis_result?.step_analyses?.[stage];
                    const status = step?.status || 'NOT_EVALUATED';
                    const isPass = status === 'SATISFIED';
                    const isViol = status === 'VIOLATED';
                    return (
                      <div
                        key={stage}
                        className={`p-2.5 rounded-lg border text-xs ${
                          isPass
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-300'
                            : isViol
                            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-300'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>{stage} Status:</span>
                          <span>{status}</span>
                        </div>
                        {step?.message && (
                          <p className="mt-1 text-[11px] opacity-90 leading-tight">
                            {step.message}
                          </p>
                        )}
                        {step?.violations && step.violations.length > 0 && (
                          <div className="mt-1.5 pt-1 border-t border-amber-200/60 dark:border-amber-800/60 text-[10px] font-mono">
                            Violations: {step.violations.map((v: any) => `${v.determinant?.join(', ')} → ${v.dependent_attributes?.join(', ')}`).join(' | ')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Decomposition Results if available */}
                {inspectItem.analysis_result.decomposition_result && (
                  <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 space-y-1.5">
                    <span className="font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider text-[10px]">
                      Decomposition Verification
                    </span>
                    <div className="flex items-center gap-3 text-xs">
                      <span>
                        Lossless Join: <strong>{inspectItem.analysis_result.decomposition_result.is_lossless ? '✓ Yes' : '✗ No'}</strong>
                      </span>
                      <span>
                        Dependency Preserving: <strong>{inspectItem.analysis_result.decomposition_result.is_dependency_preserving ? '✓ Yes' : '✗ No'}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Candidate Key Details if applicable */}
            {inspectItem.analysis_type === 'keys' && inspectItem.analysis_result && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Candidate Key Derivation
                </h4>
                <div className="p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs space-y-1.5">
                  <div>
                    <strong>Candidate Keys:</strong>{' '}
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                      {(inspectItem.analysis_result.candidate_keys || []).map((k: string[]) => `(${k.join(', ')})`).join(', ')}
                    </span>
                  </div>
                  <div>
                    <strong>Prime Attributes:</strong>{' '}
                    <span className="font-mono">
                      {(inspectItem.analysis_result.prime_attributes || []).join(', ')}
                    </span>
                  </div>
                  <div>
                    <strong>Non-Prime Attributes:</strong>{' '}
                    <span className="font-mono">
                      {(inspectItem.analysis_result.non_prime_attributes || []).join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Attribute Closure Steps if applicable */}
            {inspectItem.analysis_type === 'closure' && inspectItem.analysis_result && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Closure Computation Steps
                </h4>
                <div className="space-y-1.5">
                  {(inspectItem.analysis_result.steps || []).map((step: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 font-mono text-[11px] flex items-center justify-between"
                    >
                      <span>Step {step.step_number}: &#123;{step.current_closure?.join(', ')}&#125;</span>
                      {step.fired_fd && (
                        <span className="text-indigo-600 dark:text-indigo-400">
                          (via {step.fired_fd.left?.join(', ')} → {step.fired_fd.right?.join(', ')})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Report Download Modal */}
      {reportItem && (
        <ReportDownloadModal
          isOpen={!!reportItem}
          onClose={() => setReportItem(null)}
          schema={reportItem.schema_data}
          analysisResult={reportItem.analysis_result as FullNormalizationAnalysisResult}
        />
      )}

      {/* Clear All Confirmation Modal */}
      <Modal
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        title="Clear All Execution History"
        description="Are you sure you want to delete all historical analysis records? This action cannot be undone."
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsClearConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleClearAll}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Confirm Clear
            </Button>
          </div>
        }
      >
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900/50 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p>
            All {items.length} historical run records stored in local storage and the database will be permanently deleted.
          </p>
        </div>
      </Modal>
    </div>
  );
};
