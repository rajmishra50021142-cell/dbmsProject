import React from 'react';
import { Table, Plus, Trash2, Info } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type { SampleTuple } from '../../types';

interface SampleDataEditorProps {
  attributes: string[];
  sampleData: SampleTuple[];
  onChange: (data: SampleTuple[]) => void;
}

export const SampleDataEditor: React.FC<SampleDataEditorProps> = ({
  attributes,
  sampleData,
  onChange,
}) => {
  const handleAddRow = () => {
    const newRow: SampleTuple = {};
    attributes.forEach((attr) => {
      newRow[attr] = '';
    });
    onChange([...sampleData, newRow]);
  };

  const handleRemoveRow = (indexToRemove: number) => {
    onChange(sampleData.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCellChange = (rowIndex: number, attr: string, value: string) => {
    const updated = [...sampleData];
    updated[rowIndex] = {
      ...updated[rowIndex],
      [attr]: value,
    };
    onChange(updated);
  };

  const handleClearAll = () => {
    if (sampleData.length > 0) {
      onChange([]);
    }
  };

  if (attributes.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-center space-y-2">
        <Table className="w-6 h-6 text-slate-400 mx-auto" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Define attributes in the relation schema first before editing sample tuples.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Table className="w-3.5 h-3.5 text-emerald-500" />
            Sample Data (Optional)
          </label>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Optional tuple instances to demonstrate data-level atomicity or 1NF violations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={sampleData.length > 0 ? 'accent' : 'neutral'} size="sm">
            {sampleData.length} {sampleData.length === 1 ? 'row' : 'rows'}
          </Badge>
          {sampleData.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {sampleData.length === 0 ? (
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-900/40 space-y-3 text-center">
          <div className="inline-flex p-2 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              No sample data provided
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              Dependency-based normalization analysis (candidate keys, 2NF, 3NF, BCNF, 4NF) can still
              be fully performed without sample tuples. Sample tuples are useful for verifying 1NF
              atomicity.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleAddRow}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            id="add-sample-row-btn"
          >
            Add First Row
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700/80 shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-2 py-1.5 w-10 text-center text-[10px] text-slate-400">#</th>
                  {attributes.map((attr) => (
                    <th key={attr} className="px-3 py-1.5 font-semibold">
                      {attr}
                    </th>
                  ))}
                  <th className="px-2 py-1.5 w-12 text-center text-[10px] text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900 font-mono">
                {sampleData.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-2 py-1 text-center text-[10px] text-slate-400">
                      {rowIdx + 1}
                    </td>
                    {attributes.map((attr) => {
                      const val = row[attr] ?? '';
                      return (
                        <td key={attr} className="p-1">
                          <input
                            type="text"
                            value={String(val)}
                            onChange={(e) => handleCellChange(rowIdx, attr, e.target.value)}
                            placeholder={`Value for ${attr}`}
                            className="w-full px-2 py-1 text-xs rounded bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900"
                          />
                        </td>
                      );
                    })}
                    <td className="px-2 py-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(rowIdx)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors"
                        title="Delete tuple"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 italic">
              Non-atomic values (e.g. "DBMS, OS, CN") can be entered to demonstrate 1NF violations.
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAddRow}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Row
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
