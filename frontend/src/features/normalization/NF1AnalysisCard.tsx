import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Table as TableIcon,
  Eye,
  ListOrdered,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { NF1Result } from '../../types';

interface NF1AnalysisCardProps {
  result: NF1Result;
}

export const NF1AnalysisCard: React.FC<NF1AnalysisCardProps> = ({ result }) => {
  const [showTransformationModal, setShowTransformationModal] = useState<boolean>(false);
  const [showReasoning, setShowReasoning] = useState<boolean>(false);

  const getStatusBadge = () => {
    switch (result.status) {
      case 'SATISFIED':
        return <Badge variant="success" size="md">1NF Satisfied</Badge>;
      case 'VIOLATED':
        return <Badge variant="error" size="md">1NF Violated</Badge>;
      case 'INSUFFICIENT_DATA':
        return <Badge variant="info" size="md">Insufficient Data (Unverified)</Badge>;
      default:
        return <Badge variant="neutral" size="md">{result.status}</Badge>;
    }
  };

  const getStatusHeaderIcon = () => {
    switch (result.status) {
      case 'SATISFIED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'VIOLATED':
        return <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'INSUFFICIENT_DATA':
        return <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-xs">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 flex items-center justify-center">
              {getStatusHeaderIcon()}
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                First Normal Form (1NF) Analysis
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Evaluation of cell-level atomicity, multi-valued values, and repeating attribute groups.
              </CardDescription>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Status Message */}
        <div
          className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
            result.status === 'SATISFIED'
              ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-300'
              : result.status === 'VIOLATED'
              ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-300'
              : 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-300'
          }`}
        >
          <span className="font-bold">Evaluation Summary: </span>
          {result.message}
        </div>

        {/* Limitations Notice if Insufficient Data */}
        {result.status === 'INSUFFICIENT_DATA' && result.limitations.length > 0 && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
              Academic Limitation Notice
            </div>
            <p className="leading-relaxed">
              First Normal Form is fundamentally concerned with the atomicity of values stored in tuples.
              When no sample rows are provided, the analyzer cannot inspect data cells for multi-valued entries.
              To inspect data-level atomicity, add sample tuples in the Schema Builder.
            </p>
          </div>
        )}

        {/* Violations Details if Violated */}
        {result.status === 'VIOLATED' && result.violations.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Detected 1NF Violations ({result.violations.length})
              </h4>
              {result.transformation && (
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                  onClick={() => setShowTransformationModal(true)}
                  id="preview-1nf-transformation-btn"
                >
                  1NF Transformation Preview
                </Button>
              )}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
              {result.violations.map((violation, idx) => (
                <div key={idx} className="p-3 text-xs space-y-1 bg-rose-50/20 dark:bg-rose-950/10">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      Attribute: {violation.attribute}
                    </span>
                    {typeof violation.row_index === 'number' && (
                      <Badge variant="neutral" size="sm">
                        Row #{violation.row_index + 1}
                      </Badge>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {violation.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reasoning Steps Toggle */}
        {result.reasoning_steps.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <button
              onClick={() => setShowReasoning(!showReasoning)}
              className="w-full flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-1"
            >
              <span className="flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-indigo-500" />
                1NF Evaluation Trace ({result.reasoning_steps.length} steps)
              </span>
              {showReasoning ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showReasoning && (
              <ul className="mt-2 space-y-1.5 pl-4 list-disc text-xs text-slate-600 dark:text-slate-300">
                {result.reasoning_steps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {step}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>

      {/* Conceptual 1NF Transformation Preview Modal */}
      {showTransformationModal && result.transformation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Conceptual 1NF Transformation Preview
                </h3>
              </div>
              <button
                onClick={() => setShowTransformationModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-lg text-amber-900 dark:text-amber-300 leading-relaxed">
                <span className="font-bold">Educational Demonstration: </span>
                {result.transformation.explanation} User's original schema input is preserved.
              </div>

              {/* Comparison Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Original Tuples */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    Original Tuples (with multi-valued cells)
                  </div>
                  <div className="overflow-x-auto max-h-56">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          {Object.keys(result.transformation.original_tuples[0] || {}).map((col) => (
                            <th key={col} className="p-2 font-bold text-slate-600 dark:text-slate-400">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {result.transformation.original_tuples.map((t, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            {Object.entries(t).map(([c, val], cIdx) => (
                              <td
                                key={cIdx}
                                className={`p-2 ${
                                  result.attributes_involved.includes(c)
                                    ? 'bg-rose-50/70 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 font-bold'
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Transformed 1NF Tuples */}
                <div className="border border-emerald-200 dark:border-emerald-900/60 rounded-xl overflow-hidden bg-emerald-50/10">
                  <div className="p-2.5 bg-emerald-100/60 dark:bg-emerald-950/50 font-bold text-emerald-800 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-900">
                    1NF Atomic Tuples (Unnested)
                  </div>
                  <div className="overflow-x-auto max-h-56">
                    <table className="w-full text-left font-mono text-[11px]">
                      <thead className="bg-emerald-50/40 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-900/40">
                        <tr>
                          {Object.keys(result.transformation.transformed_tuples[0] || {}).map((col) => (
                            <th key={col} className="p-2 font-bold text-emerald-700 dark:text-emerald-400">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-emerald-100/50 dark:divide-emerald-900/20">
                        {result.transformation.transformed_tuples.map((t, rIdx) => (
                          <tr key={rIdx} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-900/20">
                            {Object.values(t).map((val, cIdx) => (
                              <td key={cIdx} className="p-2 text-slate-800 dark:text-slate-200">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setShowTransformationModal(false)}>
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
