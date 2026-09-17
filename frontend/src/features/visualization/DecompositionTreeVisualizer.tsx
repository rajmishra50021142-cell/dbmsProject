import React from 'react';
import { GitBranch, CheckCircle2, XCircle } from 'lucide-react';
import type { DecompositionTreeNode, SelectedEntity } from '../../types';

interface DecompositionTreeVisualizerProps {
  treeNodes: DecompositionTreeNode[];
  onSelectEntity?: (entity: SelectedEntity) => void;
}

export const DecompositionTreeVisualizer: React.FC<DecompositionTreeVisualizerProps> = ({
  treeNodes,
  onSelectEntity,
}) => {
  if (treeNodes.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 text-xs font-mono">
        No decomposition tree available. Run decomposition analysis to generate lineage.
      </div>
    );
  }

  const rootNode = treeNodes.find((n) => !n.parentId) || treeNodes[0];
  const childNodes = treeNodes.filter((n) => n.parentId === rootNode.id);

  return (
    <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-xs">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <GitBranch className="w-4 h-4 text-indigo-500" />
          Hierarchical Decomposition Lineage Tree
        </h3>
        <span className="text-xs font-mono text-slate-500">
          {treeNodes.length} Relation Node{treeNodes.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="flex flex-col items-center space-y-6">
        {/* Root Node: Source Relation */}
        <div
          onClick={() =>
            onSelectEntity?.({
              type: 'relation',
              name: rootNode.name,
              attributes: rootNode.attributes,
              primaryKey: rootNode.primaryKey,
            })
          }
          className="p-4 rounded-2xl border-2 border-indigo-400 dark:border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 shadow-sm cursor-pointer hover:scale-102 transition-transform text-center min-w-[220px]"
        >
          <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300 font-mono tracking-wider">
            Original Relation
          </span>
          <h4 className="text-base font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
            {rootNode.name}
          </h4>
          <div className="mt-2 flex flex-wrap gap-1 justify-center">
            {rootNode.attributes.map((attr) => (
              <span
                key={attr}
                className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              >
                {attr}
              </span>
            ))}
          </div>
        </div>

        {/* Tree Branch Split Indicator */}
        {childNodes.length > 0 && (
          <div className="flex flex-col items-center space-y-1">
            <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
            <div className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs">
              Decomposed via {childNodes[0].stage || 'Target NF'}
            </div>
            <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700" />
          </div>
        )}

        {/* Child Sub-Relations */}
        {childNodes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            {childNodes.map((child) => (
              <div
                key={child.id}
                onClick={() =>
                  onSelectEntity?.({
                    type: 'relation',
                    name: child.name,
                    attributes: child.attributes,
                    primaryKey: child.primaryKey,
                  })
                }
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer transition-all shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                    {child.name}
                  </h5>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                    {child.stage} SUB
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {child.attributes.map((attr) => {
                    const isPk = child.primaryKey?.includes(attr);
                    return (
                      <span
                        key={attr}
                        className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                          isPk
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-800'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {isPk ? `🔑 ${attr}` : attr}
                      </span>
                    );
                  })}
                </div>

                {/* Section 58: Verification Status in Tree Node */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[10px]">
                  <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                    {child.isLossless ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-500" />
                    )}
                    Lossless Join
                  </span>

                  <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                    {child.isPreserved ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-rose-500" />
                    )}
                    Preserved
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
