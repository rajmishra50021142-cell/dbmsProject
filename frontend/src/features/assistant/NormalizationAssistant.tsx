import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  RotateCcw,
  FlaskConical,
  ArrowRight,
  GitCommit,
} from 'lucide-react';
import { assistantService } from '../../services/assistantService';
import type {
  AssistantContext,
  AssistantMessage,
  FullNormalizationAnalysisResult,
  RelationSchema,
} from '../../types';

interface NormalizationAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  schema?: RelationSchema | null;
  analysis?: FullNormalizationAnalysisResult | null;
  onOpenExperiment?: () => void;
  onOpenDecomposition?: () => void;
  onOpenJourney?: () => void;
  onOpenClosure?: (attrs: string[]) => void;
}

export const NormalizationAssistant: React.FC<NormalizationAssistantProps> = ({
  isOpen,
  onClose,
  schema,
  analysis,
  onOpenExperiment,
  onOpenDecomposition,
  onOpenJourney,
  onOpenClosure,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: (
        "Hello! I am your deterministic **DBMS Normalization Assistant**. " +
        "I provide mathematically proven explanations about your current schema, normal form stages (1NF–4NF), " +
        "candidate keys, closures, and decompositions without external LLM dependencies or hallucinations.\n\n" +
        "Select a quick question below or ask anything about your schema!"
      ),
      supported: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages, loading]);

  // Construct AssistantContext from active state
  const buildContext = (): AssistantContext | null => {
    if (!schema && !analysis) return null;

    const normalForms: Record<string, string> = {};
    const violations: Array<Record<string, any>> = [];

    if (analysis) {
      if (analysis.nf1?.status) normalForms['1NF'] = analysis.nf1.status;
      if (analysis.nf2?.status) normalForms['2NF'] = analysis.nf2.status;
      if (analysis.nf3?.status) normalForms['3NF'] = analysis.nf3.status;
      if (analysis.nf4?.status) normalForms['4NF'] = analysis.nf4.status;

      if (analysis.nf1?.violations) {
        analysis.nf1.violations.forEach((v, idx) => {
          violations.push({ id: `1nf-${idx}`, stage: '1NF', description: str(v) });
        });
      }
      if (analysis.nf2?.partial_dependencies) {
        analysis.nf2.partial_dependencies.forEach((p, idx) => {
          violations.push({
            id: `2nf-${idx}`,
            stage: '2NF',
            dependency: `${p.determinant.join(', ')} → ${p.dependent_attributes.join(', ')}`,
            lhs: p.determinant,
            rhs: p.dependent_attributes,
          });
        });
      }
      if (analysis.nf3?.violations) {
        analysis.nf3.violations.forEach((v, idx) => {
          violations.push({
            id: `3nf-${idx}`,
            stage: '3NF',
            dependency: v.functional_dependency ? `${v.functional_dependency.left.join(', ')} → ${v.functional_dependency.right.join(', ')}` : '',
            lhs: v.determinant,
            rhs: v.dependent_attributes,
          });
        });
      }
      if (analysis.nf4?.violations) {
        analysis.nf4.violations.forEach((v, idx) => {
          violations.push({
            id: `4nf-${idx}`,
            stage: '4NF',
            dependency: v.mvd ? `${v.mvd.left.join(', ')} ↠ ${v.mvd.right.join(', ')}` : '',
            lhs: v.determinant,
            rhs: v.dependent_attributes,
          });
        });
      }
    }

    return {
      relation: schema?.name || analysis?.relation_name || 'R',
      attributes: schema?.attributes || analysis?.attributes || [],
      candidate_keys: analysis?.candidate_keys || schema?.candidate_keys || [],
      prime_attributes: analysis?.prime_attributes || [],
      non_prime_attributes: analysis?.non_prime_attributes || [],
      functional_dependencies: schema?.functional_dependencies || [],
      multivalued_dependencies: schema?.multivalued_dependencies || [],
      normal_forms: normalForms,
      highest_confirmed_normal_form: analysis?.highest_confirmed_normal_form || null,
      violations,
    };
  };

  const str = (v: any): string => {
    return typeof v === 'string' ? v : JSON.stringify(v);
  };

  const handleSend = async (questionToSend?: string) => {
    const q = (questionToSend || inputQuestion).trim();
    if (!q || loading) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const context = buildContext();
      const res = await assistantService.askAssistant({
        question: q,
        context,
      });

      const assistantMsg: AssistantMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: res.answer,
        intent: res.intent,
        evidence_ids: res.evidence_ids,
        suggested_actions: res.suggested_actions,
        supported: res.supported,
        learning_topic: res.learning_topic,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          text: `Error contacting assistant service: ${err.message || 'Unknown network error'}.`,
          supported: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic contextual suggestion chips
  const getSuggestions = () => {
    const suggestions: string[] = [];
    if (analysis) {
      if (analysis.nf2?.status === 'VIOLATED') {
        suggestions.push('Why is this relation not in 2NF?');
      }
      if (analysis.nf3?.status === 'VIOLATED') {
        suggestions.push('Why is 3NF failing?');
      }
      if (analysis.nf4?.status === 'VIOLATED') {
        suggestions.push('Which MVD violates 4NF?');
      }
      if (analysis.highest_confirmed_normal_form === '4NF') {
        suggestions.push('Why does this satisfy 4NF?');
      }
    }
    suggestions.push('What are my candidate keys?');
    if (schema?.attributes && schema.attributes.length > 0) {
      suggestions.push(`Calculate closure of ${schema.attributes.slice(0, 2).join('')}`);
    }
    suggestions.push('What should I do next?');
    return suggestions.slice(0, 4);
  };

  const handleActionClick = (action: string) => {
    if (action === 'open_experiment' && onOpenExperiment) onOpenExperiment();
    if (action === 'view_decomposition' && onOpenDecomposition) onOpenDecomposition();
    if (action === 'show_journey' && onOpenJourney) onOpenJourney();
    if (action === 'open_closure_lab' && onOpenClosure) {
      const firstKey = analysis?.candidate_keys[0] || [schema?.attributes[0] || 'A'];
      onOpenClosure(firstKey);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      role="complementary"
      aria-label="DBMS Normalization Assistant Panel"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Normalization Assistant
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Deterministic Engine • Grounded in Analysis</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setMessages([
                {
                  id: 'reset',
                  role: 'assistant',
                  text: 'Assistant reset. What would you like to know about your normalization analysis?',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            title="Clear chat history"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistant panel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 shrink-0 uppercase tracking-wider">
          Suggested:
        </span>
        {getSuggestions().map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(chip)}
            disabled={loading}
            className="shrink-0 px-2.5 py-1 text-xs font-medium rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors shadow-sm disabled:opacity-50"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              {/* Message text with basic Markdown line breaks & bold formatting */}
              <div className="whitespace-pre-wrap font-sans">
                {m.text.split('\n').map((line, lIdx) => (
                  <p key={lIdx} className={lIdx > 0 ? 'mt-1.5' : ''}>
                    {line}
                  </p>
                ))}
              </div>

              {/* Action Buttons */}
              {m.suggested_actions && m.suggested_actions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70 flex flex-wrap gap-1.5">
                  {m.suggested_actions.map((act) => {
                    if (act === 'open_experiment' && onOpenExperiment) {
                      return (
                        <button
                          key={act}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
                        >
                          <FlaskConical className="w-3 h-3" /> Test in Experiment
                        </button>
                      );
                    }
                    if (act === 'view_decomposition' && onOpenDecomposition) {
                      return (
                        <button
                          key={act}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                        >
                          <ArrowRight className="w-3 h-3" /> View Decomposition
                        </button>
                      );
                    }
                    if (act === 'open_closure_lab' && onOpenClosure) {
                      return (
                        <button
                          key={act}
                          type="button"
                          onClick={() => handleActionClick(act)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
                        >
                          <GitCommit className="w-3 h-3" /> Open Closure Lab
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>

            <span className="text-[10px] text-slate-400 mt-1 px-1">
              {m.timestamp}
            </span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl rounded-bl-none text-xs text-slate-500 dark:text-slate-400 w-fit border border-slate-200 dark:border-slate-700">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
            <span className="ml-1 font-medium">Evaluating formal relational proof...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            placeholder="Ask about 1NF–4NF, keys, closures..."
            disabled={loading}
            className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || loading}
            aria-label="Send question"
            className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
