import React, { memo, useState } from 'react';
import {
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
  type EdgeProps,
} from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

export interface DependencyEdgeData {
  notation?: string;
  lhs?: string[];
  rhs?: string[];
  fullRhs?: string[];
  isViolation?: boolean;
  violationStage?: string | null;
  violationReason?: string;
  type?: 'fd' | 'mvd';
  [key: string]: unknown;
}

export const DependencyEdge: React.FC<EdgeProps> = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const edgeData = (data || {}) as DependencyEdgeData;
  const isMvd = edgeData.type === 'mvd';
  const isViolation = Boolean(edgeData.isViolation);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Dynamic styling based on selection, violation, and MVD
  const strokeColor = selected
    ? '#6366f1' // Indigo
    : isViolation
    ? '#f43f5e' // Rose
    : isMvd
    ? '#8b5cf6' // Purple
    : '#64748b'; // Slate

  const strokeWidth = selected ? 3 : isViolation ? 2.5 : 2;
  const strokeDasharray = isMvd ? '6,4' : undefined;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray,
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
        markerEnd={markerEnd}
      />

      {/* Invisible wider stroke for easier hover/interaction */}
      <path
        d={edgePath}
        fill="none"
        strokeOpacity={0}
        strokeWidth={20}
        className="cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Edge badge */}
          <div
            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-xs border flex items-center gap-1 cursor-pointer transition-transform ${
              selected
                ? 'bg-indigo-600 text-white border-indigo-700 scale-110'
                : isViolation
                ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse'
                : isMvd
                ? 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            {isViolation && <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />}
            <span>{isMvd ? '↠' : '→'}</span>
          </div>

          {/* Hover Tooltip per Section 16 */}
          {isHovered && (
            <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-xl bg-slate-900/95 dark:bg-slate-950/95 text-white text-xs shadow-xl border border-slate-700 backdrop-blur-xs pointer-events-none transition-opacity">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 pb-1 border-b border-slate-800">
                <span>{isMvd ? 'Multivalued Dependency' : 'Functional Dependency'}</span>
                {edgeData.violationStage && (
                  <span className="text-rose-400 font-mono">{edgeData.violationStage} VIOLATION</span>
                )}
              </div>
              <div className="mt-1.5 font-mono text-xs font-bold text-indigo-300">
                {edgeData.notation || `${edgeData.lhs?.join(', ')} → ${edgeData.rhs?.join(', ')}`}
              </div>
              {isViolation && (
                <div className="mt-1 text-[11px] text-rose-300 flex items-center gap-1">
                  <span>{edgeData.violationReason || 'Violates normal form conditions.'}</span>
                </div>
              )}
              <div className="mt-1.5 text-[9px] text-slate-400 font-sans">
                Click edge to inspect details & related candidate keys
              </div>
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

DependencyEdge.displayName = 'DependencyEdge';
