import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Download,
  Sparkles,
  RefreshCw,
  Table,
  Check,
  Layers,
  FileCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { excelService } from '../../services/excelService';
import type {
  ExcelInspectResponse,
  ExcelSuggestResponse,
  RowValidationResponse,
} from '../../types/excel';
import type { RelationSchema, FunctionalDependency } from '../../types';

interface ExcelWorkbookManagerProps {
  currentSchema: RelationSchema;
  onApplySchema: (newSchema: RelationSchema) => void;
}

export const ExcelWorkbookManager: React.FC<ExcelWorkbookManagerProps> = ({
  currentSchema,
  onApplySchema,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [inspectData, setInspectData] = useState<ExcelInspectResponse | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [headerRowIndex, setHeaderRowIndex] = useState<number>(0);

  // Workflow modes
  const [activeWorkflow, setActiveWorkflow] = useState<'modeA' | 'modeB'>('modeA');

  // Mode A: Column mapping & FD validation
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [isValidatingRows, setIsValidatingRows] = useState<boolean>(false);
  const [rowValidationResult, setRowValidationResult] = useState<RowValidationResponse | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Mode B: Schema discovery
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<ExcelSuggestResponse | null>(null);
  const [acceptedFDs, setAcceptedFDs] = useState<Record<number, boolean>>({});
  const [acceptedKeys, setAcceptedKeys] = useState<Record<number, boolean>>({});

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to initialize column mapping based on case-insensitive matches
  const autoMapColumns = (attributes: string[], columns: string[]) => {
    const mapping: Record<string, string> = {};
    attributes.forEach((attr) => {
      const match = columns.find(
        (col) => col.trim().toLowerCase() === attr.trim().toLowerCase()
      );
      if (match) {
        mapping[attr] = match;
      } else {
        mapping[attr] = columns[0] || '';
      }
    });
    setColumnMapping(mapping);
  };

  const handleFileUpload = async (file: File, sheet?: string, headerIdx: number = 0) => {
    setSelectedFile(file);
    setIsInspecting(true);
    setErrorMessage(null);
    setInspectData(null);
    setSuggestions(null);
    setRowValidationResult(null);

    try {
      const res = await excelService.inspectWorkbook(file, sheet, headerIdx);
      setInspectData(res);
      setSelectedSheet(res.selected_sheet);
      setHeaderRowIndex(res.header_row_index);
      autoMapColumns(currentSchema.attributes, res.columns);
    } catch (err: any) {
      console.error('Failed to inspect workbook:', err);
      setErrorMessage(err.message || 'Failed to parse Excel workbook. Please verify file format.');
    } finally {
      setIsInspecting(false);
    }
  };

  const handleSheetChange = (newSheet: string) => {
    if (selectedFile) {
      setSelectedSheet(newSheet);
      handleFileUpload(selectedFile, newSheet, headerRowIndex);
    }
  };

  const handleHeaderRowChange = (idx: number) => {
    setHeaderRowIndex(idx);
    if (selectedFile) {
      handleFileUpload(selectedFile, selectedSheet, idx);
    }
  };

  // Mode A: Validate rows against FDs
  const handleValidateRows = async () => {
    if (!inspectData) return;
    setIsValidatingRows(true);
    setErrorMessage(null);
    try {
      const res = await excelService.validateRows({
        columns: inspectData.columns,
        rows: inspectData.preview_rows,
        functional_dependencies: currentSchema.functional_dependencies,
        column_mapping: columnMapping,
      });
      setRowValidationResult(res);
    } catch (err: any) {
      setErrorMessage(err.message || 'Row validation against dependencies failed.');
    } finally {
      setIsValidatingRows(false);
    }
  };

  // Mode A: Export normalized workbook
  const handleExportWorkbook = async () => {
    if (!inspectData) return;
    setIsExporting(true);
    setErrorMessage(null);
    try {
      const blob = await excelService.exportNormalizedWorkbook({
        relation_name: currentSchema.name || inspectData.filename.replace(/\.xlsx$/i, ''),
        attributes: currentSchema.attributes,
        functional_dependencies: currentSchema.functional_dependencies,
        multivalued_dependencies: currentSchema.multivalued_dependencies || [],
        candidate_keys: currentSchema.candidate_keys || [],
        rows: inspectData.preview_rows,
        column_mapping: columnMapping,
      });
      const exportName = `${currentSchema.name || 'Relation'}_Normalized_Decomposition.xlsx`;
      excelService.triggerDownload(blob, exportName);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to generate normalized workbook export.');
    } finally {
      setIsExporting(false);
    }
  };

  // Mode B: Discover schema and dependencies
  const handleDiscoverSchema = async () => {
    if (!inspectData) return;
    setIsSuggesting(true);
    setErrorMessage(null);
    try {
      const res = await excelService.suggestSchemaAndDependencies(
        inspectData.columns,
        inspectData.preview_rows
      );
      setSuggestions(res);
      // Default: accept all confident suggestions
      const keysMap: Record<number, boolean> = {};
      res.candidate_keys.forEach((_, idx) => {
        keysMap[idx] = true;
      });
      setAcceptedKeys(keysMap);

      const fdsMap: Record<number, boolean> = {};
      res.functional_dependencies.forEach((_, idx) => {
        fdsMap[idx] = true;
      });
      setAcceptedFDs(fdsMap);
    } catch (err: any) {
      setErrorMessage(err.message || 'Schema discovery from data failed.');
    } finally {
      setIsSuggesting(false);
    }
  };

  // Apply discovered schema
  const handleApplyDiscoveredSchema = () => {
    if (!suggestions || !inspectData) return;

    const chosenKeys: string[][] = suggestions.candidate_keys
      .filter((_, idx) => acceptedKeys[idx])
      .map((k) => k.attributes);

    const chosenFDs: FunctionalDependency[] = suggestions.functional_dependencies
      .filter((_, idx) => acceptedFDs[idx])
      .map((fd) => ({
        id: fd.id || `fd-${Math.random().toString(36).substring(2, 7)}`,
        left: fd.determinant,
        right: fd.dependent,
      }));

    const newSchema: RelationSchema = {
      name: suggestions.relation_name || 'DISCOVERED_RELATION',
      attributes: inspectData.columns,
      candidate_keys: chosenKeys.length > 0 ? chosenKeys : undefined,
      functional_dependencies: chosenFDs,
      multivalued_dependencies: [],
      sample_data: inspectData.preview_rows.slice(0, 10),
    };

    onApplySchema(newSchema);
  };

  return (
    <div className="space-y-4">
      {/* File Upload / Dropzone */}
      {!inspectData ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl p-6 text-center bg-slate-50/50 dark:bg-slate-900/30 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            accept=".xlsx, .xls"
            className="hidden"
            id="excel-file-upload-input"
          />
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            {isInspecting ? (
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
            ) : (
              <FileSpreadsheet className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {isInspecting ? 'Inspecting workbook structure...' : 'Click to upload or drag & drop Excel workbook'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Supports Microsoft Excel (.xlsx, .xls) • Automatic header detection & multi-sheet parsing
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
            <Button size="sm" variant="outline" disabled={isInspecting}>
              <UploadCloud className="w-4 h-4 mr-2" />
              Select Spreadsheet
            </Button>
            <a
              href="/Normalization_Lab_Demo_Dataset.xlsx"
              download="Normalization_Lab_Demo_Dataset.xlsx"
              onClick={(e) => e.stopPropagation()}
              id="download-demo-dataset-btn"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Download Demo Dataset (.xlsx)
            </a>
          </div>
        </div>
      ) : (
        /* Workbook Loaded Info Header */
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {inspectData.filename}
              </span>
              <Badge variant="accent" size="sm">
                {inspectData.total_rows} rows • {inspectData.columns.length} columns
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="xs"
                variant="outline"
                onClick={() => {
                  setInspectData(null);
                  setSelectedFile(null);
                  setSuggestions(null);
                  setRowValidationResult(null);
                }}
              >
                Change File
              </Button>
            </div>
          </div>

          {/* Sheet & Header controls */}
          <div className="flex flex-wrap items-center gap-3 text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
            {inspectData.sheet_names.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-medium">Worksheet:</span>
                <select
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-200"
                >
                  {inspectData.sheet_names.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Header Row:</span>
              <select
                value={headerRowIndex}
                onChange={(e) => handleHeaderRowChange(Number(e.target.value))}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value={0}>Row 1 (Top)</option>
                <option value={1}>Row 2</option>
                <option value={2}>Row 3</option>
              </select>
            </div>

            {inspectData.has_non_atomic_values && (
              <Badge variant="warning" size="sm" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Non-atomic cell values detected (1NF Review)
              </Badge>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-lg text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Content Area after File Inspection */}
      {inspectData && (
        <div className="space-y-4">
          {/* Workflow Toggle Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveWorkflow('modeA')}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeWorkflow === 'modeA'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Mode A: Link Schema & Export Normalized (.xlsx)
            </button>
            <button
              onClick={() => {
                setActiveWorkflow('modeB');
                if (!suggestions && !isSuggesting) {
                  handleDiscoverSchema();
                }
              }}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeWorkflow === 'modeB'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Mode B: Discover Schema From Data
            </button>
          </div>

          {/* WORKFLOW A: LINK SCHEMA & DECOMPOSE */}
          {activeWorkflow === 'modeA' && (
            <div className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  Column Mapping
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Map each relation attribute to the corresponding column header in your Excel worksheet.
                </p>
              </div>

              {/* Column Mapping Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentSchema.attributes.map((attr) => (
                  <div
                    key={attr}
                    className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                  >
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                      {attr}
                    </span>
                    <select
                      value={columnMapping[attr] || ''}
                      onChange={(e) =>
                        setColumnMapping({ ...columnMapping, [attr]: e.target.value })
                      }
                      className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 max-w-[140px]"
                    >
                      {inspectData.columns.map((col) => (
                        <option key={col} value={col}>
                          {col}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              {/* Actions & Validations */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleValidateRows}
                  isLoading={isValidatingRows}
                  leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                >
                  Validate Rows vs FDs
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleExportWorkbook}
                  isLoading={isExporting}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  id="download-normalized-excel-btn"
                >
                  Download Normalized Workbook (.xlsx)
                </Button>
              </div>

              {/* Row validation feedback */}
              {rowValidationResult && (
                <div
                  className={`p-3 rounded-lg border text-xs space-y-1 ${
                    rowValidationResult.valid
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  <div className="font-semibold flex items-center gap-1.5">
                    {rowValidationResult.valid ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        Sample rows satisfy all {currentSchema.functional_dependencies.length} defined FDs without contradiction.
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        Found {rowValidationResult.violations_count} contradiction issue(s) between uploaded rows and defined dependencies.
                      </>
                    )}
                  </div>
                  {rowValidationResult.issues.length > 0 && (
                    <ul className="list-disc list-inside space-y-0.5 pt-1 text-[11px]">
                      {rowValidationResult.issues.map((issue, idx) => (
                        <li key={idx}>{issue.message}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* WORKFLOW B: SCHEMA DISCOVERY */}
          {activeWorkflow === 'modeB' && (
            <div className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
              {/* Scientific Disclaimer */}
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-lg text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  Empirical Schema Discovery Disclaimer
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                  The candidate keys and functional dependencies below are mined empirically from the current spreadsheet sample.
                  True relational constraints represent formal business assertions and require confirmation before applying to canonical normalization.
                </p>
              </div>

              {isSuggesting && (
                <div className="py-6 text-center space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500" />
                  <p className="text-xs text-slate-500">Mining candidate keys and functional dependencies...</p>
                </div>
              )}

              {suggestions && (
                <div className="space-y-4">
                  {/* Discovered Candidate Keys */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Observed Candidate Keys
                    </span>
                    <div className="space-y-1.5">
                      {suggestions.candidate_keys.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No simple unique keys detected in sample rows.</p>
                      ) : (
                        suggestions.candidate_keys.map((key, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={!!acceptedKeys[idx]}
                                onChange={(e) =>
                                  setAcceptedKeys({ ...acceptedKeys, [idx]: e.target.checked })
                                }
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                {'{' + key.attributes.join(', ') + '}'}
                              </span>
                              <Badge
                                variant={key.confidence === 'High' ? 'success' : 'neutral'}
                                size="sm"
                              >
                                {key.confidence} Confidence ({Math.round(key.uniqueness_ratio * 100)}% unique)
                              </Badge>
                            </div>
                            <span className="text-[11px] text-slate-400">
                              {key.null_count === 0 ? 'No nulls' : `${key.null_count} nulls`}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Discovered FDs */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Observed Functional Dependencies
                    </span>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {suggestions.functional_dependencies.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No strong non-trivial functional dependencies found.</p>
                      ) : (
                        suggestions.functional_dependencies.map((fd, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={!!acceptedFDs[idx]}
                                onChange={(e) =>
                                  setAcceptedFDs({ ...acceptedFDs, [idx]: e.target.checked })
                                }
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="font-mono text-slate-800 dark:text-slate-200">
                                {fd.notation}
                              </span>
                              <Badge
                                variant={fd.confidence === 'Strong' ? 'success' : 'accent'}
                                size="sm"
                              >
                                {fd.confidence}
                              </Badge>
                            </div>
                            <span className="text-[11px] text-slate-400 max-w-[200px] truncate">
                              {fd.notes}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* 1NF Atomicity Review Items */}
                  {suggestions.atomicity_reviews.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        1NF Atomicity Review Required
                      </span>
                      <div className="space-y-1.5">
                        {suggestions.atomicity_reviews.map((rev, idx) => (
                          <div
                            key={idx}
                            className="p-2 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded text-xs space-y-0.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold font-mono text-amber-800 dark:text-amber-300">
                                Column: {rev.attribute}
                              </span>
                              <Badge variant="warning" size="sm">
                                Delimiter: "{rev.delimiter_detected}"
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400">
                              {rev.reason} (e.g. "{rev.sample_value}") — {rev.suggested_action}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confirm & Apply Button */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleApplyDiscoveredSchema}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      id="apply-discovered-schema-btn"
                    >
                      Apply Discovered Schema to Workspace
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Table Preview (First few rows) */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
            <div className="bg-slate-50 dark:bg-slate-800/80 px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Table className="w-3.5 h-3.5 text-indigo-500" />
                Worksheet Sample Rows ({inspectData.preview_rows.length} rows previewed)
              </span>
            </div>
            <div className="overflow-x-auto max-h-44 text-xs font-mono">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <th className="px-2.5 py-1.5 font-semibold text-center w-8">#</th>
                    {inspectData.columns.map((col) => (
                      <th key={col} className="px-2.5 py-1.5 font-semibold border-l border-slate-200 dark:border-slate-700">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {inspectData.preview_rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="px-2.5 py-1 text-slate-400 text-center text-[11px]">{rIdx + 1}</td>
                      {inspectData.columns.map((col) => (
                        <td
                          key={col}
                          className="px-2.5 py-1 text-slate-700 dark:text-slate-300 border-l border-slate-100 dark:border-slate-800 truncate max-w-[160px]"
                        >
                          {row[col] !== undefined && row[col] !== null ? String(row[col]) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
