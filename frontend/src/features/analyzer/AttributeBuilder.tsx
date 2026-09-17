import React, { useState } from 'react';
import { Plus, X, Edit2, Check, AlertCircle } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

interface AttributeBuilderProps {
  attributes: string[];
  onChange: (attributes: string[], renameMap?: { from: string; to: string }) => void;
  referencedAttributesWithWarnings?: string[];
}

export const AttributeBuilder: React.FC<AttributeBuilderProps> = ({
  attributes,
  onChange,
  referencedAttributesWithWarnings = [],
}) => {
  const [newAttrName, setNewAttrName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newAttrName.trim();
    if (!trimmed) {
      setError('Attribute name cannot be empty.');
      return;
    }
    if (attributes.some((attr) => attr.toLowerCase() === trimmed.toLowerCase())) {
      setError(`Duplicate attribute "${trimmed}". Attribute names must be unique within a relation.`);
      return;
    }
    setError(null);
    onChange([...attributes, trimmed]);
    setNewAttrName('');
  };

  const handleRemove = (indexToRemove: number) => {
    const updated = attributes.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    if (editingIndex === indexToRemove) {
      setEditingIndex(null);
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditValue(attributes[index]);
    setError(null);
  };

  const commitEdit = () => {
    if (editingIndex === null) return;
    const trimmed = editValue.trim();
    const oldName = attributes[editingIndex];

    if (!trimmed) {
      setError('Attribute name cannot be empty.');
      return;
    }
    if (
      trimmed.toLowerCase() !== oldName.toLowerCase() &&
      attributes.some((attr) => attr.toLowerCase() === trimmed.toLowerCase())
    ) {
      setError(`Duplicate attribute "${trimmed}". Attribute names must be unique.`);
      return;
    }

    setError(null);
    if (trimmed !== oldName) {
      const updated = [...attributes];
      updated[editingIndex] = trimmed;
      onChange(updated, { from: oldName, to: trimmed });
    }
    setEditingIndex(null);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setError(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Attributes (R)
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Define every atomic attribute belonging to this relation schema.
          </p>
        </div>
        <Badge variant={attributes.length > 0 ? 'accent' : 'warning'} size="sm">
          {attributes.length} {attributes.length === 1 ? 'attribute' : 'attributes'}
        </Badge>
      </div>

      {/* Add Attribute Input Form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. StudentID, CourseID, Grade"
          value={newAttrName}
          onChange={(e) => {
            setNewAttrName(e.target.value);
            if (error) setError(null);
          }}
          className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
          id="attribute-input-field"
        />
        <Button
          type="submit"
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          disabled={!newAttrName.trim()}
          id="add-attribute-btn"
        >
          Add
        </Button>
      </form>

      {error && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-md border border-rose-200 dark:border-rose-900/60">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Attributes Tag Pill List */}
      {attributes.length === 0 ? (
        <div className="p-3.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            No attributes defined yet. Add at least one attribute to build relation R.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
          {attributes.map((attr, idx) => {
            const isEditing = editingIndex === idx;
            const hasWarning = referencedAttributesWithWarnings.includes(attr);

            if (isEditing) {
              return (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1 bg-white dark:bg-slate-900 border-2 border-indigo-500 rounded-md px-1.5 py-0.5 shadow-sm"
                >
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitEdit();
                      } else if (e.key === 'Escape') {
                        cancelEdit();
                      }
                    }}
                    className="w-24 text-xs font-mono bg-transparent border-none text-slate-900 dark:text-slate-100 focus:outline-none p-0"
                  />
                  <button
                    type="button"
                    onClick={commitEdit}
                    className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 p-0.5"
                    title="Save edit"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                    title="Cancel edit"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            }

            return (
              <span
                key={attr}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono transition-all group ${
                  hasWarning
                    ? 'bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                    : 'bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                <span>{attr}</span>
                <span className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 ml-1 transition-opacity">
                  <button
                    type="button"
                    onClick={() => startEditing(idx)}
                    className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5"
                    title={`Rename ${attr}`}
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-0.5"
                    title={`Remove ${attr}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};
