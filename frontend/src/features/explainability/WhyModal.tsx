import React, { useEffect, useRef } from 'react';
import { X, HelpCircle, CheckCircle2, AlertOctagon, ArrowRight, FlaskConical, Calculator } from 'lucide-react';
import type { ExplainWhyData } from '../../types';

interface WhyModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExplainWhyData | null;
  onOpenExperiment?: () => void;
  onOpenClosure?: (attrs: string[]) => void;
}

export const WhyModal: React.FC<WhyModalProps> = ({
  isOpen,
  onClose,
  data,
  onOpenExperiment,
  onOpenClosure,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Trap focus inside modal
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  const isViolated = data.status === 'VIOLATED' || data.title.toLowerCase().includes('violate') || data.title.toLowerCase().includes('fail');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="why-modal-title"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isViolated ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'}`}>
              {isViolated ? <AlertOctagon className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 id="why-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">
                {data.title}
              </h3>
              {data.stage && (
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Stage: {data.stage} Formal Reasoning
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close explanation modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Formal Condition */}
          <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/70 dark:border-indigo-900/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300 mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" /> Formal Relational Condition
            </h4>
            <p className="text-sm text-indigo-950 dark:text-indigo-200 font-mono leading-relaxed">
              {data.formalCondition}
            </p>
          </div>

          {/* Checked Item / Dependency */}
          {data.checkedItem && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Evaluated Target
              </h4>
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-lg font-mono text-sm text-slate-900 dark:text-slate-100 font-semibold">
                {data.checkedItem}
              </div>
            </div>
          )}

          {/* Evidence Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Authoritative Mathematical Evidence
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.evidence.candidateKeys && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Candidate Key(s)</span>
                  <span className="font-mono text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {data.evidence.candidateKeys.map((k) => `{${k.join(', ')}}`).join(' OR ') || 'None'}
                  </span>
                </div>
              )}

              {data.evidence.closure && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Determinant Closure</span>
                  <span className="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                    {data.evidence.closure}
                  </span>
                </div>
              )}

              {data.evidence.isSuperkey !== undefined && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Is Determinant a Superkey?</span>
                  <span className={`text-sm font-bold ${data.evidence.isSuperkey ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {data.evidence.isSuperkey ? 'Yes (Closure covers relation)' : 'No (Closure missing attributes)'}
                  </span>
                </div>
              )}

              {data.evidence.isPrime !== undefined && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Are Dependent Attribute(s) Prime?</span>
                  <span className={`text-sm font-bold ${data.evidence.isPrime ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {data.evidence.isPrime ? 'Yes (Part of a Candidate Key)' : 'No (Non-Prime Attribute)'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mathematical Conclusion */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-indigo-500" /> Mathematical Conclusion
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {data.conclusion}
            </p>
          </div>

          {/* Remediation */}
          {data.remedy && (
            <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 mb-1">
                Remediation Strategy
              </h4>
              <p className="text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
                {data.remedy}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            {onOpenExperiment && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenExperiment();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
              >
                <FlaskConical className="w-3.5 h-3.5" /> Test in Experiment Mode
              </button>
            )}
            {onOpenClosure && data.evidence.closure && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  // Extract target from checked item or closure
                  onOpenClosure(['A']);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" /> Calculate Closure
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};
