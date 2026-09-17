import React from 'react';
import { X, BookOpen, ArrowRight } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EXAMPLE_SCHEMAS } from '../../config/examples';
import type { RelationSchema } from '../../types';

interface ExampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExample: (schema: RelationSchema) => void;
}

export const ExampleModal: React.FC<ExampleModalProps> = ({
  isOpen,
  onClose,
  onSelectExample,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Load Textbook Reference Example
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instantly populate your workspace with classic textbook normalization problems.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Examples List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {EXAMPLE_SCHEMAS.map((ex) => (
            <div
              key={ex.id}
              className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">
                    {ex.title}
                  </h4>
                  <Badge variant="accent" size="sm">
                    {ex.target_topic}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {ex.description}
                </p>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-0.5">
                  R({ex.schema.attributes.join(', ')}) • {ex.schema.functional_dependencies.length} FDs • {ex.schema.multivalued_dependencies.length} MVDs
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 group-hover:border-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                onClick={() => {
                  onSelectExample(ex.schema);
                  onClose();
                }}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Load
              </Button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
