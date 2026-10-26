import React, { useState, useRef, useMemo, useEffect } from 'react';
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
  Database,
  XCircle,
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
  const [appliedModeA, setAppliedModeA] = useState<boolean>(false);

  // Mode B: Schema discovery
  const [relationName, setRelationName] = useState<string>('');
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<ExcelSuggestResponse | null>(null);
  const [acceptedFDs, setAcceptedFDs] = useState<Record<number, boolean>>({});
  const [acceptedKeys, setAcceptedKeys] = useState<Record<number, boolean>>({});
  const [appliedModeB, setAppliedModeB] = useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Clean helper to sanitize relation names
  const sanitizeName = (raw: string): string => {
    return raw.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_').toUpperCase();
  };

  // Helper to initialize column mapping based on case-insensitive matches
  // CRITICAL FIX: Never silently map unmatched attributes to columns[0]
  const autoMapColumns = (attributes: string[], columns: string[]) => {
    const mapping: Record<string, string> = {};
    attributes.forEach((attr) => {
      const cleanAttr = attr.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const exactMatch = columns.find(
        (col) => col.trim().toLowerCase() === attr.trim().toLowerCase()
      );
      if (exactMatch) {
        mapping[attr] = exactMatch;
      } else {
        const fuzzyMatch = columns.find(
          (col) => col.trim().toLowerCase().replace(/[^a-z0-9]/g, '') === cleanAttr
        );
        mapping[attr] = fuzzyMatch || '';
      }
    });
    setColumnMapping(mapping);
    return mapping;
  };

  // Inspect workbook and initialize workflow
  const handleFileUpload = async (file: File, sheet?: string, headerIdx: number = 0) => {
    setSelectedFile(file);
    setIsInspecting(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setInspectData(null);
    setSuggestions(null);
    setRowValidationResult(null);
    setAppliedModeA(false);
    setAppliedModeB(false);

    try {
      const res = await excelService.inspectWorkbook(file, sheet, headerIdx);
      setInspectData(res);
      setSelectedSheet(res.selected_sheet);
      setHeaderRowIndex(res.header_row_index);

      // Default relation name for Mode B: prefer filename or non-generic sheet name
      const defaultName =
        res.selected_sheet && res.selected_sheet.toLowerCase() !== 'sheet1'
          ? sanitizeName(res.selected_sheet)
          : sanitizeName(res.filename.replace(/\.[^/.]+$/, ''));
      setRelationName(defaultName);

      // Run auto mapping for Mode A
      const initialMap = autoMapColumns(currentSchema.attributes, res.columns);

      // Detect if declared schema mismatches the workbook columns
      const matchedCount = currentSchema.attributes.filter((attr) => Boolean(initialMap[attr])).length;
      if (currentSchema.attributes.length > 0 && matchedCount === 0) {
        // If 0 attributes matched, user likely wants Mode B (Discover from workbook)
        setActiveWorkflow('modeB');
      }
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

  // Compute mapping validation status for Mode A
  const mappingValidation = useMemo(() => {
    if (!inspectData || currentSchema.attributes.length === 0) {
      return { isValid: true, unmappedAttrs: [], duplicateCols: [] };
    }

    const unmappedAttrs: string[] = [];
    const colUsage: Record<string, string[]> = {};

    currentSchema.attributes.forEach((attr) => {
      const mappedCol = columnMapping[attr];
      if (!mappedCol) {
        unmappedAttrs.push(attr);
      } else {
        if (!colUsage[mappedCol]) {
          colUsage[mappedCol] = [];
        }
        colUsage[mappedCol].push(attr);
      }
    });

    const duplicateCols: { column: string; attributes: string[] }[] = [];
    Object.entries(colUsage).forEach(([col, attrs]) => {
      if (attrs.length > 1) {
        duplicateCols.push({ column: col, attributes: attrs });
      }
    });

    const isValid = unmappedAttrs.length === 0 && duplicateCols.length === 0;
    return { isValid, unmappedAttrs, duplicateCols };
  }, [inspectData, currentSchema.attributes, columnMapping]);

  // Check if current declared schema is completely distinct from Excel columns
  const isSchemaMismatch = useMemo(() => {
    if (!inspectData || currentSchema.attributes.length === 0) return false;
    const matchedCount = currentSchema.attributes.filter((attr) => Boolean(columnMapping[attr])).length;
    return matchedCount === 0 || (currentSchema.attributes.length >= 3 && matchedCount < currentSchema.attributes.length / 2);
  }, [inspectData, currentSchema.attributes, columnMapping]);

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

  // Mode A: Apply mapped schema and worksheet data to canonical analysis pipeline
  const handleApplyMappedSchema = () => {
    if (!inspectData) return;
    if (!mappingValidation.isValid) {
      setErrorMessage('Please resolve unmapped attributes and duplicate column mappings before applying.');
      return;
    }

    setErrorMessage(null);

    // Project worksheet preview rows to schema attributes based on column mapping
    const mappedSampleData = inspectData.preview_rows.map((row) => {
      const tuple: Record<string, any> = {};
      currentSchema.attributes.forEach((attr) => {
        const col = columnMapping[attr];
        if (col && row[col] !== undefined) {
          tuple[attr] = row[col];
        }
      });
      return tuple;
    });

    const updatedSchema: RelationSchema = {
      ...currentSchema,
      sample_data: mappedSampleData,
      source: 'excel',
      source_metadata: {
        filename: inspectData.filename,
        worksheet: selectedSheet,
        total_rows: inspectData.total_rows,
        columns: inspectData.columns,
        header_row_index: headerRowIndex,
        mode: 'modeA',
      },
    };

    onApplySchema(updatedSchema);
    setAppliedModeA(true);
    setSuccessMessage(
      `Linked ${mappedSampleData.length} worksheet row(s) to relation '${currentSchema.name}'. Live Relational Preview, Keys Lab, and Normalization updated.`
    );
    setTimeout(() => setSuccessMessage(null), 5000);
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
      if (res.relation_name) {
        setRelationName(sanitizeName(res.relation_name));
      }

      // Default: accept high confidence suggestions
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

  // Automatically discover schema suggestions when switching to Mode B
  useEffect(() => {
    if (activeWorkflow === 'modeB' && inspectData && !suggestions && !isSuggesting) {
      handleDiscoverSchema();
    }
  }, [activeWorkflow, inspectData]);

  // Mode B: Apply discovered schema to workspace & run canonical analysis
  const handleApplyDiscoveredSchema = () => {
    if (!inspectData) return;

    const chosenKeys: string[][] = suggestions
      ? suggestions.candidate_keys.filter((_, idx) => acceptedKeys[idx]).map((k) => k.attributes)
      : [];

    const chosenFDs: FunctionalDependency[] = suggestions
      ? suggestions.functional_dependencies
          .filter((_, idx) => acceptedFDs[idx])
          .map((fd) => ({
            id: fd.id || `fd-${Math.random().toString(36).substring(2, 7)}`,
            left: fd.determinant,
            right: fd.dependent,
          }))
      : [];

    const finalName = relationName.trim() ? sanitizeName(relationName) : 'EXCEL_RELATION';

    const newSchema: RelationSchema = {
      name: finalName,
      attributes: inspectData.columns,
      candidate_keys: chosenKeys.length > 0 ? chosenKeys : undefined,
      functional_dependencies: chosenFDs,
      multivalued_dependencies: [],
      sample_data: inspectData.preview_rows.slice(0, 20),
      source: 'excel',
      source_metadata: {
        filename: inspectData.filename,
        worksheet: selectedSheet,
        total_rows: inspectData.total_rows,
        columns: inspectData.columns,
        header_row_index: headerRowIndex,
        mode: 'modeB',
        unconfirmed_keys: suggestions ? suggestions.candidate_keys.map((k) => k.attributes) : [],
        unconfirmed_fds: suggestions
          ? suggestions.functional_dependencies.map((fd) => ({
              determinant: fd.determinant,
              dependent: fd.dependent,
              notation: fd.notation,
              confidence: fd.confidence,
            }))
          : [],
      },
    };

    onApplySchema(newSchema);
    setAppliedModeB(true);
    setSuccessMessage(
      `Discovered schema '${finalName}' (${inspectData.columns.length} attributes, ${chosenFDs.length} FDs) applied to workspace. Live Relational Preview, Keys, and Normalization updated.`
    );
    setTimeout(() => setSuccessMessage(null), 5000);
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
            accept=".xlsx, .xls, .csv"
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
              Supports Microsoft Excel (.xlsx, .xls) & CSV • Automatic header detection & multi-sheet parsing
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
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-mono">
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
                  setAppliedModeA(false);
                  setAppliedModeB(false);
                  setErrorMessage(null);
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
                  id="excel-worksheet-select"
                  aria-label="Worksheet"
                  value={selectedSheet}
                  onChange={(e) => handleSheetChange(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-200 font-mono"
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
                id="excel-header-row-select"
                aria-label="Header Row"
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

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
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
              Mode A: Link to Declared Schema
            </button>
            <button
              onClick={() => setActiveWorkflow('modeB')}
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

          {/* WORKFLOW A: LINK DECLARED SCHEMA */}
          {activeWorkflow === 'modeA' && (
            <div className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
              {/* Schema Mismatch Notice */}
              {isSchemaMismatch && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-100">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Schema Mismatch with Current Relation</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    The declared schema in your workspace is <strong>{currentSchema.name}</strong> with attributes ({currentSchema.attributes.join(', ')}), but this worksheet contains columns ({inspectData.columns.join(', ')}).
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      size="xs"
                      variant="primary"
                      onClick={() => setActiveWorkflow('modeB')}
                      leftIcon={<Sparkles className="w-3 h-3 text-amber-300" />}
                    >
                      Switch to Mode B: Discover Schema from Worksheet
                    </Button>
                    <span className="text-[11px] text-amber-700 dark:text-amber-300">
                      Or manually map columns below if this is an alternate representation.
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    Column Mapping for Relation: {currentSchema.name}
                  </h4>
                  <Badge variant={mappingValidation.isValid ? 'success' : 'warning'} size="sm">
                    {mappingValidation.isValid ? 'Mapping Valid' : 'Mapping Incomplete'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Map each declared attribute of <strong>{currentSchema.name}</strong> to a distinct column in worksheet <strong>{selectedSheet}</strong>.
                </p>
              </div>

              {/* Column Mapping Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentSchema.attributes.map((attr) => {
                  const mappedCol = columnMapping[attr] || '';
                  const isUnmapped = !mappedCol;
                  const isDup = mappingValidation.duplicateCols.some(
                    (d) => d.column === mappedCol && mappedCol !== ''
                  );

                  return (
                    <div
                      key={attr}
                      className={`flex items-center justify-between p-2 rounded border transition-colors ${
                        isUnmapped
                          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                          : isDup
                          ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span
                        className="font-mono font-medium text-slate-800 dark:text-slate-200 truncate pr-2 max-w-[140px]"
                        title={attr}
                      >
                        {attr}
                      </span>
                      <select
                        value={mappedCol}
                        onChange={(e) =>
                          setColumnMapping({ ...columnMapping, [attr]: e.target.value })
                        }
                        className="bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-200 max-w-[150px] font-mono"
                      >
                        <option value="">-- Unmapped --</option>
                        {inspectData.columns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>

              {/* Mapping Validation Diagnostic Warnings */}
              {!mappingValidation.isValid && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-800 dark:text-rose-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Mapping Issues Detected</span>
                  </div>
                  {mappingValidation.unmappedAttrs.length > 0 && (
                    <p className="text-[11px]">
                      Required attributes not yet mapped: <strong>{mappingValidation.unmappedAttrs.join(', ')}</strong>.
                    </p>
                  )}
                  {mappingValidation.duplicateCols.map((dup, i) => (
                    <p key={i} className="text-[11px]">
                      Duplicate mapping: Excel column <strong>{dup.column}</strong> is mapped to multiple attributes ({dup.attributes.join(', ')}).
                    </p>
                  ))}
                </div>
              )}

              {/* Actions & Validations */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleApplyMappedSchema}
                  disabled={!mappingValidation.isValid}
                  leftIcon={<Database className="w-3.5 h-3.5" />}
                  id="apply-mapped-schema-btn"
                >
                  {appliedModeA ? 'Update Linked Data in Analysis' : 'Apply Mapped Data & Analyze'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleValidateRows}
                  isLoading={isValidatingRows}
                  disabled={!mappingValidation.isValid}
                  leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                >
                  Validate Rows vs FDs
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportWorkbook}
                  isLoading={isExporting}
                  leftIcon={<Download className="w-3.5 h-3.5 text-indigo-500" />}
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
              {/* Relation Name & Attribute Proposal */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Proposed Relation Definition
                  </span>
                  <Badge variant="accent" size="sm">
                    {inspectData.columns.length} Attributes
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Relation Name:
                  </label>
                  <input
                    type="text"
                    value={relationName}
                    onChange={(e) => setRelationName(e.target.value.toUpperCase())}
                    placeholder="RELATION_NAME"
                    className="font-mono text-xs px-2.5 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold max-w-[220px]"
                    id="excel-relation-name-input"
                  />
                  <span className="text-xs text-slate-400 font-mono">
                    ({inspectData.columns.join(', ')})
                  </span>
                </div>
              </div>

              {/* Scientific & Academic Disclaimer */}
              <div className="p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-lg text-xs text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  Empirical Schema Discovery Disclaimer
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                  Candidate keys and functional dependencies below are mined empirically from the finite sample rows. True relational constraints represent formal business assertions. Review and select the constraints that reflect business reality before applying to the normalization engine.
                </p>
              </div>

              {isSuggesting && (
                <div className="py-6 text-center space-y-2">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-indigo-500" />
                  <p className="text-xs text-slate-500">Mining candidate keys and functional dependencies from sample rows...</p>
                </div>
              )}

              {suggestions && (
                <div className="space-y-4">
                  {/* Discovered Candidate Keys */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Observed Candidate Keys ({suggestions.candidate_keys.length})
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Select to confirm as schema candidate keys
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {suggestions.candidate_keys.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No simple unique keys detected in sample rows.</p>
                      ) : (
                        suggestions.candidate_keys.map((key, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                          >
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(acceptedKeys[idx])}
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
                            </label>
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
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Observed Functional Dependencies ({suggestions.functional_dependencies.length})
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Select to confirm for normalization analysis
                      </span>
                    </div>
                    <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                      {suggestions.functional_dependencies.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No non-trivial functional dependencies detected in sample.</p>
                      ) : (
                        suggestions.functional_dependencies.map((fd, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                          >
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(acceptedFDs[idx])}
                                onChange={(e) =>
                                  setAcceptedFDs({ ...acceptedFDs, [idx]: e.target.checked })
                                }
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                                {fd.notation}
                              </span>
                              <Badge
                                variant={fd.confidence === 'Strong' ? 'success' : 'accent'}
                                size="sm"
                              >
                                {fd.confidence}
                              </Badge>
                            </label>
                            <span className="text-[11px] text-slate-400 max-w-[200px] truncate" title={fd.notes}>
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

                  {/* Readiness Summary & Confirm Button */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Confirmed: <strong>{Object.values(acceptedKeys).filter(Boolean).length} key(s)</strong> • <strong>{Object.values(acceptedFDs).filter(Boolean).length} FD(s)</strong>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={handleApplyDiscoveredSchema}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                      id="apply-discovered-schema-btn"
                    >
                      {appliedModeB ? 'Update Schema in Analysis' : 'Apply Discovered Schema to Workspace'}
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
              <span className="text-[11px] text-slate-400 font-mono">
                Sheet: {selectedSheet}
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
