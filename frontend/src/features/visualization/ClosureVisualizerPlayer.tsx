import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { visualizationService } from '../../services/visualizationService';
import type { RelationSchema, ClosureVisualizationData, ClosureVisualizationStep } from '../../types';

interface ClosureVisualizerPlayerProps {
  schema: RelationSchema;
  initialTarget?: string[];
}

export const ClosureVisualizerPlayer: React.FC<ClosureVisualizerPlayerProps> = ({
  schema,
  initialTarget,
}) => {
  const [selectedAttrs, setSelectedAttrs] = useState<string[]>(() => {
    if (initialTarget && initialTarget.length > 0) return initialTarget;
    if (schema.candidate_keys && schema.candidate_keys.length > 0) return schema.candidate_keys[0];
    return schema.attributes.slice(0, 1);
  });

  const [closureData, setClosureData] = useState<ClosureVisualizationData | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const playTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load closure data whenever target or schema changes
  useEffect(() => {
    let isMounted = true;
    const loadClosure = async () => {
      if (selectedAttrs.length === 0) return;
      setIsLoading(true);
      try {
        const data = await visualizationService.getClosurePlayerData(
          schema.attributes,
          schema.functional_dependencies,
          selectedAttrs
        );
        if (isMounted) {
          setClosureData(data);
          setCurrentStepIndex(0);
          setIsPlaying(false);
        }
      } catch (err) {
        console.error('Failed to load closure player data', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadClosure();
    return () => {
      isMounted = false;
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [selectedAttrs, schema]);

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying || !closureData) return;

    if (currentStepIndex >= closureData.steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    playTimerRef.current = setTimeout(() => {
      setCurrentStepIndex((prev) => Math.min(prev + 1, closureData.steps.length - 1));
    }, 1200);

    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, currentStepIndex, closureData]);

  const toggleAttrSelection = (attr: string) => {
    if (selectedAttrs.includes(attr)) {
      if (selectedAttrs.length > 1) {
        setSelectedAttrs(selectedAttrs.filter((a) => a !== attr));
      }
    } else {
      setSelectedAttrs([...selectedAttrs, attr]);
    }
  };

  const steps = closureData?.steps || [];
  const currentStep: ClosureVisualizationStep | null = steps[currentStepIndex] || null;

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-5 shadow-xs">
      {/* Header & Target Attribute Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Interactive Attribute Closure Player (X⁺)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Step-by-step mathematical expansion based on Armstrong&apos;s axioms and attribute closure algorithms.
          </p>
        </div>

        {/* Quick select attribute pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 font-medium">Target X:</span>
          {schema.attributes.map((attr) => {
            const isSelected = selectedAttrs.includes(attr);
            return (
              <button
                key={attr}
                onClick={() => toggleAttrSelection(attr)}
                className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {attr}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-400 font-mono">
          Calculating closure trace...
        </div>
      ) : currentStep ? (
        <div className="space-y-5">
          {/* Step Timeline Indicator & Scrubber */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span className="text-slate-500 text-[11px]">
                {currentStep.isStarting
                  ? 'Reflexivity Base'
                  : currentStep.isFixedPoint
                  ? 'Fixed Point Reached'
                  : 'FD Fired'}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={steps.length - 1}
              value={currentStepIndex}
              onChange={(e) => {
                setIsPlaying(false);
                setCurrentStepIndex(Number(e.target.value));
              }}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>

          {/* Current Closure Badges Display */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Current Closure State: {'{'}{selectedAttrs.join(', ')}{'}'}⁺ =
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {schema.attributes.map((attr) => {
                const inClosure = currentStep.currentClosure.includes(attr);
                const isStart = selectedAttrs.includes(attr);
                const isNewlyAdded = currentStep.newlyAdded.includes(attr) && !isStart;

                if (!inClosure) {
                  return (
                    <span
                      key={attr}
                      className="px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 font-mono text-xs opacity-50"
                    >
                      {attr}
                    </span>
                  );
                }

                return (
                  <div
                    key={attr}
                    className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all ${
                      isNewlyAdded
                        ? 'border-indigo-500 bg-indigo-600 text-white ring-2 ring-indigo-500/30 scale-105'
                        : isStart
                        ? 'border-slate-400 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                        : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    <span>{attr}</span>
                    <span className="text-[9px] font-sans opacity-80 uppercase tracking-tighter">
                      {isNewlyAdded ? 'NEW' : isStart ? 'BASE' : 'DERIVED'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Reasoning Box */}
          <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs space-y-1">
            <div className="font-bold text-indigo-900 dark:text-indigo-200">
              {(() => {
                if (!currentStep.appliedFd) return 'Reflexive Basis';
                const fd = currentStep.appliedFd as any;
                const lhs = Array.isArray(fd.left)
                  ? fd.left.join(', ')
                  : Array.isArray(fd.lhs)
                  ? fd.lhs.join(', ')
                  : String(fd.left || fd.lhs || '');
                const rhs = Array.isArray(fd.right)
                  ? fd.right.join(', ')
                  : Array.isArray(fd.rhs)
                  ? fd.rhs.join(', ')
                  : String(fd.right || fd.rhs || '');
                if (lhs && rhs) return `Applied: ${lhs} → ${rhs}`;
                if (typeof fd === 'string') return `Applied: ${fd}`;
                return 'FD Fired';
              })()}
            </div>
            <p className="text-slate-600 dark:text-slate-400">{currentStep.explanation}</p>
          </div>

          {/* Fixed-Point or Superkey Milestone */}
          {currentStep.isFixedPoint && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                currentStep.isSuperkey
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
              }`}
            >
              {currentStep.isSuperkey ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong>Superkey Condition Satisfied: </strong>
                    {'{'}{selectedAttrs.join(', ')}{'}'}⁺ contains all {schema.attributes.length} attributes of relation {schema.name}.
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-slate-500 shrink-0" />
                  <div>
                    <strong>Fixed Point Reached: </strong>
                    No additional functional dependencies can fire. Closure computation complete.
                  </div>
                </>
              )}
            </div>
          )}

          {/* Player Controls Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex(0);
                }}
                title="Restart"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
                }}
                disabled={currentStepIndex === 0}
                title="Previous Step"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs transition-colors"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
                }}
                disabled={currentStepIndex === steps.length - 1}
                title="Next Step"
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs transition-colors"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400">
              Final Size: {closureData?.finalClosure.length}/{schema.attributes.length} attributes
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
