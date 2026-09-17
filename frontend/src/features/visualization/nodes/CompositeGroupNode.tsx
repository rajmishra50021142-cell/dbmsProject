import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Key, Layers } from 'lucide-react';

export interface CompositeGroupNodeData {
  attributes: string[];
  isPrime?: boolean;
  isCandidateKey?: boolean;
  isViolation?: boolean;
  label?: string;
  [key: string]: unknown;
}

export const CompositeGroupNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeData = data as CompositeGroupNodeData;
  const attrs = nodeData.attributes || [];
  const isKey = Boolean(nodeData.isCandidateKey);

  return (
    <div
      className={`relative px-4 py-3 rounded-2xl border transition-all duration-200 shadow-sm min-w-[180px] select-none ${
        selected
          ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/80 shadow-md'
          : isKey
          ? 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 hover:border-amber-400'
          : 'border-slate-300 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/90 hover:border-slate-400'
      }`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 border-2 border-white dark:border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-2.5 h-2.5 bg-indigo-500 border-2 border-white dark:border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 bg-indigo-500 border-2 border-white dark:border-slate-900"
      />

      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          Composite Determinant
        </span>
        {isKey && (
          <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-mono text-[10px]">
            <Key className="w-3 h-3" /> KEY
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
        {attrs.map((attr) => (
          <span
            key={attr}
            className="px-2 py-0.5 rounded-md font-mono text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs"
          >
            {attr}
          </span>
        ))}
      </div>
    </div>
  );
});

CompositeGroupNode.displayName = 'CompositeGroupNode';
