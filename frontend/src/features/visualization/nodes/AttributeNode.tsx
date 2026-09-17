import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Key, Circle } from 'lucide-react';

export interface AttributeNodeData {
  attribute: string;
  isPrime?: boolean;
  isCandidateKey?: boolean;
  isDeterminant?: boolean;
  isDependent?: boolean;
  isViolation?: boolean;
  label?: string;
  [key: string]: unknown;
}

export const AttributeNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeData = data as AttributeNodeData;
  const isPrime = Boolean(nodeData.isPrime);
  const isKey = Boolean(nodeData.isCandidateKey);
  const isViolation = Boolean(nodeData.isViolation);

  return (
    <div
      className={`relative px-4 py-2.5 rounded-xl border transition-all duration-200 shadow-xs min-w-[140px] text-center select-none ${
        selected
          ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/90 dark:bg-indigo-950/80 shadow-md'
          : isViolation
          ? 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/40 hover:border-rose-400'
          : isKey
          ? 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 hover:border-amber-400'
          : isPrime
          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 hover:border-emerald-400'
          : 'border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      {/* Handles for connections */}
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
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 bg-slate-400 dark:bg-slate-500 border-2 border-white dark:border-slate-900"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 bg-indigo-500 border-2 border-white dark:border-slate-900"
      />

      <div className="flex items-center justify-center gap-1.5 font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
        {isKey ? (
          <span title="Candidate Key Attribute">
            <Key className="w-3.5 h-3.5 text-amber-500" />
          </span>
        ) : isPrime ? (
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Prime Attribute" />
        ) : (
          <span title="Non-Prime Attribute">
            <Circle className="w-2.5 h-2.5 text-slate-400" />
          </span>
        )}
        <span>{nodeData.attribute || nodeData.label}</span>
      </div>

      <div className="mt-1 flex items-center justify-center gap-1">
        {isKey ? (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-semibold">
            KEY
          </span>
        ) : isPrime ? (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-medium">
            PRIME
          </span>
        ) : (
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
            NON-PRIME
          </span>
        )}
      </div>
    </div>
  );
});

AttributeNode.displayName = 'AttributeNode';
