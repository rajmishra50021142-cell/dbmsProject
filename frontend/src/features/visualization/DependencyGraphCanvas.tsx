import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AttributeNode } from './nodes/AttributeNode';
import { CompositeGroupNode } from './nodes/CompositeGroupNode';
import { DependencyEdge } from './edges/DependencyEdge';
import type { VisualizationGraphData, SelectedEntity } from '../../types';
import {
  Search,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  X,
  Network,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

interface DependencyGraphCanvasProps {
  graphData: VisualizationGraphData;
  selectedEntity: SelectedEntity;
  onSelectEntity: (entity: SelectedEntity) => void;
  className?: string;
}

const nodeTypes = {
  attribute: AttributeNode,
  composite_determinant: CompositeGroupNode,
};

const edgeTypes = {
  fd: DependencyEdge,
  mvd: DependencyEdge,
};

export const DependencyGraphCanvas: React.FC<DependencyGraphCanvasProps> = ({
  graphData,
  selectedEntity,
  onSelectEntity,
  className = '',
}) => {
  const [showLabels, setShowLabels] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Map graphData to React Flow initial nodes
  const initialNodes: Node[] = useMemo(() => {
    return graphData.nodes.map((n) => {
      const isSelected =
        selectedEntity?.type === 'attribute' &&
        n.attributes.includes(selectedEntity.attribute);

      return {
        id: n.id,
        type: n.type === 'composite_determinant' ? 'composite_determinant' : 'attribute',
        position: n.position || { x: 0, y: 0 },
        data: {
          ...n.data,
          label: n.label,
          attributes: n.attributes,
          isPrime: n.is_prime,
          isCandidateKey: n.is_candidate_key,
        },
        selected: isSelected,
      };
    });
  }, [graphData.nodes, selectedEntity]);

  // Map graphData to React Flow initial edges
  const initialEdges: Edge[] = useMemo(() => {
    return graphData.edges.map((e) => {
      const isSelected =
        selectedEntity?.type === 'dependency' &&
        e.data?.notation === selectedEntity.formula;

      const isMvd = e.type === 'mvd';
      const isViol = Boolean(e.is_violation);

      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
        data: {
          ...e.data,
          type: e.type,
          isViolation: isViol,
          violationStage: e.violation_stage,
        },
        selected: isSelected,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isSelected ? '#6366f1' : isViol ? '#f43f5e' : isMvd ? '#8b5cf6' : '#64748b',
          width: 14,
          height: 14,
        },
      };
    });
  }, [graphData.edges, selectedEntity]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state when graphData or selection changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Auto fit-view on maximize/minimize
  useEffect(() => {
    const timer = setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isMaximized, reactFlowInstance]);

  // Handle ESC key to exit maximized mode
  useEffect(() => {
    if (!isMaximized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMaximized(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMaximized]);

  // Click handlers
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'composite_determinant') {
        const attrs = (node.data?.attributes as string[]) || [];
        onSelectEntity({
          type: 'attribute',
          attribute: attrs.join(', '),
          candidateKeys: graphData.candidateKeys,
        });
      } else {
        const attr = (node.data?.attribute as string) || node.id.replace('attr-', '');
        onSelectEntity({
          type: 'attribute',
          attribute: attr,
          isPrime: Boolean(node.data?.isPrime),
          candidateKeys: graphData.candidateKeys,
        });
      }
    },
    [onSelectEntity, graphData.candidateKeys]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      const data = edge.data as any;
      onSelectEntity({
        type: 'dependency',
        formula: data?.notation || `${edge.source} → ${edge.target}`,
        left: data?.lhs || [],
        right: data?.rhs || [],
        kind: data?.type === 'mvd' ? 'mvd' : 'fd',
        isViolation: data?.isViolation,
        violationStage: data?.violationStage,
        explanation: data?.isViolation
          ? `Violates ${data?.violationStage} requirements.`
          : 'Satisfies current normal form conditions.',
      });
    },
    [onSelectEntity]
  );

  // Focus on node from search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !reactFlowInstance) return;

    const query = searchQuery.trim().toLowerCase();
    const foundNode = nodes.find(
      (n) =>
        n.id.toLowerCase().includes(query) ||
        (n.data?.label as string)?.toLowerCase().includes(query) ||
        (n.data?.attributes as string[])?.some((a) => a.toLowerCase().includes(query))
    );

    if (foundNode) {
      reactFlowInstance.setCenter(foundNode.position.x + 80, foundNode.position.y + 40, {
        zoom: 1.2,
        duration: 800,
      });
      // Select found entity
      if (foundNode.type === 'attribute') {
        onSelectEntity({
          type: 'attribute',
          attribute: (foundNode.data?.attribute as string) || foundNode.id.replace('attr-', ''),
          isPrime: Boolean(foundNode.data?.isPrime),
          candidateKeys: graphData.candidateKeys,
        });
      }
    }
  };

  const handleResetView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2, duration: 500 });
    }
  };

  const toggleMaximize = () => {
    setIsMaximized((prev) => !prev);
  };

  return (
    <>
      {/* Maximized Overlay Backdrop (when active) */}
      {isMaximized && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 flex flex-col animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Maximized Dependency Graph View"
        >
          <div className="relative w-full h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl overflow-hidden flex flex-col">
            {/* Maximized Header Toolbar */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    Relational Dependency Graph
                    <Badge variant="accent" size="sm">
                      Maximized
                    </Badge>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {nodes.length} nodes · {edges.length} dependencies
                  </p>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-2">
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Find attribute/key..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 w-44 sm:w-56"
                    />
                  </div>
                </form>

                <button
                  type="button"
                  onClick={handleResetView}
                  title="Fit View to Screen"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-xs font-semibold shadow-xs transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Fit View</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLabels(!showLabels)}
                  title={showLabels ? 'Hide Labels' : 'Show Labels'}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-xs transition-colors"
                >
                  {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={toggleMaximize}
                  title="Minimize (Esc)"
                  aria-label="Minimize Graph"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Exit Fullscreen</span>
                </button>
              </div>
            </div>

            {/* Maximized Canvas Area */}
            <div className="flex-1 w-full relative bg-slate-50/50 dark:bg-slate-950">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                onEdgeClick={handleEdgeClick}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                onInit={setReactFlowInstance}
                fitView
                fitViewOptions={{ padding: 0.2 }}
                minZoom={0.2}
                maxZoom={2.5}
                attributionPosition="bottom-left"
                aria-label="Maximized Relational Dependency Graph Canvas"
              >
                <Background gap={18} size={1.2} color="#94a3b8" className="opacity-25 dark:opacity-15" />
                <Controls
                  showInteractive={false}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"
                />
                <MiniMap
                  nodeColor={(n) => (n.type === 'composite_determinant' ? '#6366f1' : '#94a3b8')}
                  className="bg-white/90 dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md"
                />
              </ReactFlow>

              {/* Floating Mini-Inspector in Maximized View */}
              {selectedEntity && (
                <div className="absolute bottom-5 right-5 z-20 max-w-sm w-80 p-3.5 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-indigo-200 dark:border-indigo-800/80 shadow-xl backdrop-blur-md text-xs space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800/80 pb-1.5">
                    <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                      {selectedEntity.type === 'attribute'
                        ? 'Selected Attribute'
                        : selectedEntity.type === 'dependency'
                        ? 'Selected Dependency'
                        : selectedEntity.type === 'stage'
                        ? 'Selected Stage'
                        : 'Selected Entity'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectEntity(null as any)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">
                    {selectedEntity.type === 'attribute'
                      ? selectedEntity.attribute
                      : selectedEntity.type === 'dependency'
                      ? selectedEntity.formula
                      : selectedEntity.type === 'stage'
                      ? selectedEntity.stage
                      : selectedEntity.type === 'key'
                      ? selectedEntity.key.join(', ')
                      : (selectedEntity as any).name || ''}
                  </p>
                  {selectedEntity.type === 'attribute' && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {selectedEntity.isPrime ? 'Prime Attribute (member of a candidate key)' : 'Non-Prime Attribute'}
                    </p>
                  )}
                  {selectedEntity.type === 'dependency' && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      {selectedEntity.isViolation
                        ? `Violates ${selectedEntity.violationStage} requirements`
                        : 'Satisfies current normal form conditions'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Standard In-Page Canvas View */}
      <div
        ref={containerRef}
        className={`relative w-full h-[520px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 overflow-hidden shadow-xs ${className}`}
      >
        {/* Search & Action Bar */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <form onSubmit={handleSearch} className="flex items-center">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Find attribute/key..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 w-40 sm:w-48 backdrop-blur-xs"
              />
            </div>
          </form>

          <button
            type="button"
            onClick={handleResetView}
            title="Fit View"
            className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-xs backdrop-blur-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            title={showLabels ? 'Hide Labels' : 'Show Labels'}
            className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-xs backdrop-blur-xs transition-colors"
          >
            {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          {/* Maximize Button */}
          <button
            type="button"
            onClick={toggleMaximize}
            title="Maximize Graph (Fullscreen)"
            aria-label="Maximize Graph"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-xs backdrop-blur-xs transition-all text-xs font-semibold"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Maximize</span>
          </button>
        </div>

        {/* React Flow Canvas */}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onInit={setReactFlowInstance}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.3}
          maxZoom={2.0}
          attributionPosition="bottom-left"
          aria-label="Relational Dependency Graph Canvas"
        >
          <Background gap={16} size={1} color="#94a3b8" className="opacity-20 dark:opacity-10" />
          <Controls showInteractive={false} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg shadow-sm" />
          <MiniMap
            nodeColor={(n) => (n.type === 'composite_determinant' ? '#6366f1' : '#94a3b8')}
            className="bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
          />
        </ReactFlow>
      </div>
    </>
  );
};
