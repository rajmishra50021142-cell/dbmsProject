import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Download,
  CheckSquare,
  Square,
  X,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Printer,
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import type { RelationSchema, FullNormalizationAnalysisResult, ReportSectionSelection } from '../../types';

interface ReportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: RelationSchema;
  analysisResult: FullNormalizationAnalysisResult | null;
}

export const ReportDownloadModal: React.FC<ReportDownloadModalProps> = ({
  isOpen,
  onClose,
  schema,
  analysisResult,
}) => {
  const [format, setFormat] = useState<'pdf' | 'docx' | 'txt'>('pdf');
  const [sections, setSections] = useState<ReportSectionSelection>({
    user_inputs: true,
    processing_steps: true,
    intermediate_results: true,
    final_output: true,
    decomposition: true,
    verification: true,
    figures: true,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleSection = (key: keyof ReportSectionSelection) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = async () => {
    if (!analysisResult) {
      setErrorMessage('No active analysis results available. Run an analysis before generating a report.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const { blob, filename } = await reportService.generateReport({
        format,
        sections,
        schema_definition: schema,
        analysis_result: analysisResult,
      });

      reportService.triggerDownload(blob, filename);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Report generation encountered an error.';
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        className="w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
      >
        {/* Modal Header */}
        <CardHeader className="bg-slate-50/70 dark:bg-slate-900/70 border-b border-slate-200/80 dark:border-slate-800/80 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle id="report-modal-title" className="text-base sm:text-lg font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Generate Academic Normalization Report
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Export formal proofs, candidate keys, and lossless verification for relation{' '}
                <strong className="font-mono text-indigo-600 dark:text-indigo-400">{schema.name}</strong>.
              </CardDescription>
            </div>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        {/* Modal Body */}
        <CardContent className="p-6 space-y-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Format Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
              Select Output Document Format
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'pdf', label: 'PDF Document', ext: '.pdf', desc: 'Publication print format' },
                { id: 'docx', label: 'Microsoft Word', ext: '.docx', desc: 'Editable office document' },
                { id: 'txt', label: 'Plain Text', ext: '.txt', desc: 'Clean ASCII terminal format' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                    format === f.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{f.label}</span>
                    <span className="font-mono text-[10px] text-slate-400 uppercase">{f.ext}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Granular Section Checkboxes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Included Report Sections
              </label>
              <button
                type="button"
                onClick={() => {
                  const allOn = Object.values(sections).every(Boolean);
                  setSections({
                    user_inputs: !allOn,
                    processing_steps: !allOn,
                    intermediate_results: !allOn,
                    final_output: !allOn,
                    decomposition: !allOn,
                    verification: !allOn,
                    figures: !allOn,
                  });
                }}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Toggle All
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'user_inputs', label: 'User Inputs', desc: 'Original relation schema, attributes, keys, and FDs/MVDs' },
                { key: 'processing_steps', label: 'Processing Reasoning Traces', desc: 'Step-by-step mathematical reasoning from the analysis engine' },
                { key: 'intermediate_results', label: 'Intermediate Derivations', desc: 'Discovered candidate keys, prime attributes, and violation details' },
                { key: 'final_output', label: 'Final Output Verdicts', desc: '1NF, 2NF, 3NF, and 4NF summary table and highest normal form' },
                { key: 'decomposition', label: 'Decomposition Proposals', desc: 'Sub-relations and schema refinement lineage' },
                { key: 'verification', label: 'Reconstruction Verification', desc: 'Tableau Chase lossless join and dependency preservation' },
                { key: 'figures', label: 'Visual Schematics', desc: 'ASCII / vector diagrams of normalization journey' },
              ].map((sec) => (
                <div
                  key={sec.key}
                  onClick={() => toggleSection(sec.key as keyof ReportSectionSelection)}
                  className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer select-none transition-colors"
                >
                  <button type="button" className="mt-0.5 text-indigo-600 dark:text-indigo-400 shrink-0">
                    {sections[sec.key as keyof ReportSectionSelection] ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {sec.label}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{sec.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              <strong>Safe Export:</strong> This report is generated strictly from active analysis cache. Your active inputs will not be altered.
            </span>
          </div>
        </CardContent>

        {/* Modal Footer */}
        <CardFooter className="bg-slate-50/70 dark:bg-slate-900/70 border-t border-slate-200/80 dark:border-slate-800/80 px-6 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={() => {
                if (analysisResult) {
                  reportService.printHtmlReport({
                    format: 'pdf',
                    sections,
                    schema_definition: schema,
                    analysis_result: analysisResult,
                  });
                }
              }}
              disabled={isGenerating || !analysisResult}
              title="Open printable HTML report to save as PDF via browser print"
            >
              Print / Save PDF
            </Button>
          </div>

          <Button
            size="sm"
            variant="primary"
            leftIcon={
              isGenerating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )
            }
            onClick={handleDownload}
            disabled={isGenerating || !analysisResult}
            id="confirm-generate-report-btn"
          >
            {isGenerating ? 'Building Document...' : `Generate & Download (${format.toUpperCase()})`}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
