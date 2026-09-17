import React, { useState } from 'react';
import { Bookmark, Trash2, ArrowRight, X, Plus } from 'lucide-react';
import type { ExperimentSnapshot, RelationSchema } from '../../types';
import {
  getExperimentSnapshots,
  saveExperimentSnapshot,
  deleteExperimentSnapshot,
} from '../../services/experimentService';
import { historyService } from '../../services/historyService';

interface ExperimentHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  currentSchema: RelationSchema;
  highestNormalForm: string;
  onRestoreSnapshot: (schema: RelationSchema) => void;
}

export const ExperimentHistory: React.FC<ExperimentHistoryProps> = ({
  isOpen,
  onClose,
  currentSchema,
  highestNormalForm,
  onRestoreSnapshot,
}) => {
  const [snapshots, setSnapshots] = useState<ExperimentSnapshot[]>(getExperimentSnapshots());
  const [newTitle, setNewTitle] = useState('');

  const refresh = () => {
    setSnapshots(getExperimentSnapshots());
  };

  const handleSave = () => {
    const title = newTitle.trim() || `Snapshot #${snapshots.length + 1}`;
    const newSnapshot: ExperimentSnapshot = {
      id: `snap-${Date.now()}`,
      title,
      timestamp: new Date().toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      schema: JSON.parse(JSON.stringify(currentSchema)),
      highestNormalForm,
    };
    saveExperimentSnapshot(newSnapshot);
    historyService.recordSnapshot(currentSchema, title, highestNormalForm);
    setNewTitle('');
    refresh();
  };

  const handleDelete = (id: string) => {
    deleteExperimentSnapshot(id);
    refresh();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Experiment Snapshots
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Session history stored locally in your browser
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Save new snapshot */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Label current state (e.g., Added A → D)..."
              className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Save Snapshot
            </button>
          </div>

          {/* List */}
          <div className="space-y-2">
            {snapshots.map((snap) => (
              <div
                key={snap.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                      {snap.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                      {snap.highestNormalForm}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {snap.timestamp} • {snap.schema.attributes.length} attrs, {snap.schema.functional_dependencies.length} FDs
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onRestoreSnapshot(snap.schema);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-300 transition-colors"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(snap.id)}
                    title="Delete snapshot"
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {snapshots.length === 0 && (
              <div className="text-center py-6 text-xs text-slate-400 italic">
                No saved snapshots yet. Save your current experiment to restore it later!
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
