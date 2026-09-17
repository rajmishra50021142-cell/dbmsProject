import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, GitFork } from 'lucide-react';
import type { RelationSchema, FunctionalDependency, MultivaluedDependency } from '../../types';

interface ExperimentEditorProps {
  schema: RelationSchema;
  onChange: (updated: RelationSchema) => void;
}

export const ExperimentEditor: React.FC<ExperimentEditorProps> = ({ schema, onChange }) => {
  const [newAttr, setNewAttr] = useState('');
  const [fdLhs, setFdLhs] = useState('');
  const [fdRhs, setFdRhs] = useState('');
  const [mvdLhs, setMvdLhs] = useState('');
  const [mvdRhs, setMvdRhs] = useState('');

  // Attribute handlers
  const handleAddAttribute = () => {
    const trimmed = newAttr.trim();
    if (!trimmed || schema.attributes.includes(trimmed)) return;
    onChange({
      ...schema,
      attributes: [...schema.attributes, trimmed],
    });
    setNewAttr('');
  };

  const handleRemoveAttribute = (attr: string) => {
    // Remove attribute and cascade from FDs and MVDs
    onChange({
      ...schema,
      attributes: schema.attributes.filter((a) => a !== attr),
      functional_dependencies: schema.functional_dependencies
        .map((fd) => ({
          ...fd,
          left: fd.left.filter((a) => a !== attr),
          right: fd.right.filter((a) => a !== attr),
        }))
        .filter((fd) => fd.left.length > 0 && fd.right.length > 0),
      multivalued_dependencies: (schema.multivalued_dependencies || [])
        .map((mvd) => ({
          ...mvd,
          left: mvd.left.filter((a) => a !== attr),
          right: mvd.right.filter((a) => a !== attr),
        }))
        .filter((mvd) => mvd.left.length > 0 && mvd.right.length > 0),
    });
  };

  // FD handlers
  const handleAddFd = () => {
    const lhs = fdLhs.split(',').map((s) => s.trim()).filter(Boolean);
    const rhs = fdRhs.split(',').map((s) => s.trim()).filter(Boolean);
    if (lhs.length === 0 || rhs.length === 0) return;

    const newFd: FunctionalDependency = {
      id: `fd-exp-${Date.now()}`,
      left: lhs,
      right: rhs,
    };

    onChange({
      ...schema,
      functional_dependencies: [...schema.functional_dependencies, newFd],
    });
    setFdLhs('');
    setFdRhs('');
  };

  const handleRemoveFd = (index: number) => {
    onChange({
      ...schema,
      functional_dependencies: schema.functional_dependencies.filter((_, idx) => idx !== index),
    });
  };

  // MVD handlers
  const handleAddMvd = () => {
    const lhs = mvdLhs.split(',').map((s) => s.trim()).filter(Boolean);
    const rhs = mvdRhs.split(',').map((s) => s.trim()).filter(Boolean);
    if (lhs.length === 0 || rhs.length === 0) return;

    const newMvd: MultivaluedDependency = {
      id: `mvd-exp-${Date.now()}`,
      left: lhs,
      right: rhs,
    };

    onChange({
      ...schema,
      multivalued_dependencies: [...(schema.multivalued_dependencies || []), newMvd],
    });
    setMvdLhs('');
    setMvdRhs('');
  };

  const handleRemoveMvd = (index: number) => {
    onChange({
      ...schema,
      multivalued_dependencies: (schema.multivalued_dependencies || []).filter((_, idx) => idx !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Attributes Section */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          1. Schema Attributes ({schema.attributes.length})
        </h4>
        
        {/* Attribute chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {schema.attributes.map((attr) => (
            <span
              key={attr}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
            >
              <span>{attr}</span>
              <button
                type="button"
                onClick={() => handleRemoveAttribute(attr)}
                title={`Remove ${attr}`}
                className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
          {schema.attributes.length === 0 && (
            <span className="text-xs text-slate-400 italic">No attributes defined.</span>
          )}
        </div>

        {/* Add attribute form */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newAttr}
            onChange={(e) => setNewAttr(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddAttribute();
              }
            }}
            placeholder="New attribute name (e.g. Department)..."
            className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={handleAddAttribute}
            disabled={!newAttr.trim()}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      {/* Functional Dependencies Section */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          2. Functional Dependencies ({schema.functional_dependencies.length})
        </h4>

        <div className="space-y-2 mb-3">
          {schema.functional_dependencies.map((fd, idx) => (
            <div
              key={fd.id || idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {fd.left.join(', ')}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {fd.right.join(', ')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveFd(idx)}
                title="Remove FD"
                className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {schema.functional_dependencies.length === 0 && (
            <span className="text-xs text-slate-400 italic block">No functional dependencies.</span>
          )}
        </div>

        {/* Add FD form */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <input
            type="text"
            value={fdLhs}
            onChange={(e) => setFdLhs(e.target.value)}
            placeholder="LHS (e.g. StudentID)"
            className="sm:col-span-2 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
          <div className="flex items-center justify-center text-slate-400">
            <ArrowRight className="w-4 h-4 hidden sm:block" />
          </div>
          <input
            type="text"
            value={fdRhs}
            onChange={(e) => setFdRhs(e.target.value)}
            placeholder="RHS (e.g. StudentName)"
            className="sm:col-span-2 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>
        <button
          type="button"
          onClick={handleAddFd}
          disabled={!fdLhs.trim() || !fdRhs.trim()}
          className="mt-2 w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Functional Dependency
        </button>
      </div>

      {/* Multivalued Dependencies Section */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
          <GitFork className="w-3.5 h-3.5" /> 3. Multivalued Dependencies ({(schema.multivalued_dependencies || []).length})
        </h4>

        <div className="space-y-2 mb-3">
          {(schema.multivalued_dependencies || []).map((mvd, idx) => (
            <div
              key={mvd.id || idx}
              className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {mvd.left.join(', ')}
                </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">↠</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {mvd.right.join(', ')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveMvd(idx)}
                title="Remove MVD"
                className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {(schema.multivalued_dependencies || []).length === 0 && (
            <span className="text-xs text-slate-400 italic block">No multivalued dependencies.</span>
          )}
        </div>

        {/* Add MVD form */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <input
            type="text"
            value={mvdLhs}
            onChange={(e) => setMvdLhs(e.target.value)}
            placeholder="LHS (e.g. Course)"
            className="sm:col-span-2 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
          <div className="flex items-center justify-center font-bold text-indigo-500">
            ↠
          </div>
          <input
            type="text"
            value={mvdRhs}
            onChange={(e) => setMvdRhs(e.target.value)}
            placeholder="RHS (e.g. TextBook)"
            className="sm:col-span-2 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>
        <button
          type="button"
          onClick={handleAddMvd}
          disabled={!mvdLhs.trim() || !mvdRhs.trim()}
          className="mt-2 w-full inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add Multivalued Dependency
        </button>
      </div>
    </div>
  );
};
