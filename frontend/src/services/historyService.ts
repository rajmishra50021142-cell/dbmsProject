/**
 * Unified Execution & Analysis History Service.
 * Manages persistent storage, retrieval, export/import, and workspace restoration
 * for relational schema normalization runs, candidate key calculations, and closure analyses.
 *
 * Implements dual-persistence:
 * 1. Synchronous LocalStorage cache for offline reliability and instant UI render.
 * 2. Asynchronous backend SQLite API synchronization for durable cross-session tracking.
 */

import { request } from './apiClient';
import type {
  HistoryItem,
  HistoryListResponse,
  HistoryAnalysisType,
  RelationSchema,
  FullNormalizationAnalysisResult,
  CandidateKeyAnalysisResult,
  ClosureResult,
} from '../types';

const HISTORY_STORAGE_KEY = 'normalization_lab_history_v1';
const DRAFT_STORAGE_KEY = 'normalization_lab_draft_v1';
const MAX_LOCAL_ITEMS = 50;

export const HISTORY_UPDATED_EVENT = 'normalization_lab_history_updated';

function notifyHistoryUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(HISTORY_UPDATED_EVENT));
  }
}

/**
 * Load cached history items from LocalStorage synchronously.
 */
export function getLocalHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load local history from localStorage', err);
    return [];
  }
}

/**
 * Persist history items to LocalStorage.
 */
function saveLocalHistory(items: HistoryItem[]): void {
  try {
    const trimmed = items.slice(0, MAX_LOCAL_ITEMS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmed));
    notifyHistoryUpdated();
  } catch (err) {
    console.error('Failed to save history items to localStorage', err);
  }
}

/**
 * Retrieve analysis history. Tries backend API, falls back to LocalStorage cache,
 * and merges backend results into local cache.
 */
export async function getHistory(typeFilter?: HistoryAnalysisType): Promise<HistoryItem[]> {
  try {
    const endpoint = typeFilter ? `/history?type=${typeFilter}` : '/history';
    const response = await request<HistoryListResponse>(endpoint, { timeoutMs: 3000 });
    if (response && Array.isArray(response.items)) {
      // Sync local cache with backend items when fetching all
      if (!typeFilter) {
        saveLocalHistory(response.items);
      }
      return response.items;
    }
  } catch (err) {
    console.warn('Backend history API unavailable, using local cache', err);
  }

  // Fallback to local storage
  const localItems = getLocalHistory();
  if (typeFilter) {
    return localItems.filter((i) => i.analysis_type === typeFilter);
  }
  return localItems;
}

/**
 * Record a new or updated history item.
 */
export async function recordHistoryItem(item: HistoryItem): Promise<HistoryItem> {
  // 1. Immediately persist locally
  const current = getLocalHistory();
  // Filter out any duplicate with same ID, insert at top
  const updated = [item, ...current.filter((i) => i.id !== item.id)].slice(0, MAX_LOCAL_ITEMS);
  saveLocalHistory(updated);

  // 2. Persist to backend database asynchronously
  try {
    const res = await request<HistoryItem>('/history', {
      method: 'POST',
      body: JSON.stringify({
        id: item.id,
        title: item.title,
        analysis_type: item.analysis_type,
        relation_name: item.relation_name,
        highest_normal_form: item.highest_normal_form,
        schema_data: item.schema_data,
        analysis_result: item.analysis_result,
        summary: item.summary,
      }),
      timeoutMs: 4000,
    });
    return res;
  } catch (err) {
    console.warn('Backend failed to persist history item, retained in local storage', err);
    return item;
  }
}

/**
 * Record a Full Normalization Analysis run (1NF–4NF).
 */
export async function recordNormalizationAnalysis(
  schema: RelationSchema,
  result: FullNormalizationAnalysisResult,
  customTitle?: string
): Promise<HistoryItem> {
  const hnf = result.highest_confirmed_normal_form || 'UNNORMALIZED';
  const violationsCount =
    (result.nf1?.violations?.length || 0) +
    (result.nf2?.partial_dependencies?.length || 0) +
    (result.nf3?.violations?.length || 0) +
    (result.nf4?.violations?.length || 0);

  const candidateKeys = (schema.candidate_keys || result.candidate_keys || []).map((k) => k.join(', '));
  const decompCount =
    result.nf2?.decomposition_proposal?.proposed_relations?.length ||
    result.nf3?.decomposition_proposal?.proposed_relations?.length ||
    result.nf4?.decomposition_proposal?.proposed_relations?.length ||
    0;

  const item: HistoryItem = {
    id: `norm-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: customTitle || `${schema.name} Normalization (${hnf})`,
    analysis_type: 'normalization',
    relation_name: schema.name,
    highest_normal_form: hnf,
    schema_data: JSON.parse(JSON.stringify(schema)),
    analysis_result: JSON.parse(JSON.stringify(result)),
    summary: {
      highest_normal_form: hnf,
      violations_count: violationsCount,
      candidate_keys: candidateKeys,
      decomposed_count: decompCount,
    },
    created_at: new Date().toISOString(),
  };

  return recordHistoryItem(item);
}

/**
 * Record Candidate Key Analysis.
 */
export async function recordKeyAnalysis(
  schema: RelationSchema,
  result: CandidateKeyAnalysisResult,
  customTitle?: string
): Promise<HistoryItem> {
  const ckList = (result.discovered_candidate_keys || []).map((k: string[]) => k.join(', '));
  const primeAttrs = result.prime_attributes || [];
  const nonPrimeAttrs = result.non_prime_attributes || [];

  const item: HistoryItem = {
    id: `keys-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: customTitle || `${schema.name} Candidate Key Analysis`,
    analysis_type: 'keys',
    relation_name: schema.name,
    schema_data: JSON.parse(JSON.stringify(schema)),
    analysis_result: JSON.parse(JSON.stringify(result)),
    summary: {
      candidate_keys: ckList,
      prime_attributes: primeAttrs,
      non_prime_attributes: nonPrimeAttrs,
    },
    created_at: new Date().toISOString(),
  };

  return recordHistoryItem(item);
}

/**
 * Record Attribute Closure Calculation.
 */
export async function recordClosureAnalysis(
  schema: RelationSchema,
  targetAttrs: string[],
  result: ClosureResult,
  customTitle?: string
): Promise<HistoryItem> {
  const targetLabel = targetAttrs.join(', ');
  const closureAttrs = result.closure_attributes || [];

  const item: HistoryItem = {
    id: `clos-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: customTitle || `{${targetLabel}}⁺ Closure in ${schema.name}`,
    analysis_type: 'closure',
    relation_name: schema.name,
    schema_data: JSON.parse(JSON.stringify(schema)),
    analysis_result: JSON.parse(JSON.stringify(result)),
    summary: {
      target_attributes: targetAttrs,
      closure_attributes: closureAttrs,
      steps_count: result.steps?.length || 0,
      is_superkey: result.is_superkey || false,
    },
    created_at: new Date().toISOString(),
  };

  return recordHistoryItem(item);
}

/**
 * Record a manual user snapshot / bookmark.
 */
export async function recordSnapshot(
  schema: RelationSchema,
  title: string,
  highestNormalForm?: string
): Promise<HistoryItem> {
  const item: HistoryItem = {
    id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: title.trim() || `${schema.name} Snapshot`,
    analysis_type: 'snapshot',
    relation_name: schema.name,
    highest_normal_form: highestNormalForm,
    schema_data: JSON.parse(JSON.stringify(schema)),
    summary: {
      highest_normal_form: highestNormalForm,
      candidate_keys: (schema.candidate_keys || []).map((k) => k.join(', ')),
    },
    created_at: new Date().toISOString(),
  };

  return recordHistoryItem(item);
}

/**
 * Delete a specific history entry.
 */
export async function deleteHistoryItem(id: string): Promise<void> {
  // Update local cache
  const current = getLocalHistory();
  saveLocalHistory(current.filter((i) => i.id !== id));

  // Sync delete to backend
  try {
    await request(`/history/${id}`, { method: 'DELETE', timeoutMs: 3000 });
  } catch (err) {
    console.warn('Backend delete history item failed', err);
  }
}

/**
 * Clear all history items.
 */
export async function clearAllHistory(): Promise<void> {
  // Clear local cache
  saveLocalHistory([]);

  // Clear backend
  try {
    await request('/history', { method: 'DELETE', timeoutMs: 3000 });
  } catch (err) {
    console.warn('Backend clear all history failed', err);
  }
}

/**
 * Export all history items as formatted JSON.
 */
export function exportHistoryJson(): string {
  const items = getLocalHistory();
  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      app: 'Normalization Lab',
      version: '1.0.0',
      total_items: items.length,
      history: items,
    },
    null,
    2
  );
}

/**
 * Import history items from JSON string.
 */
export async function importHistoryJson(jsonStr: string): Promise<number> {
  try {
    const parsed = JSON.parse(jsonStr);
    const incomingItems: HistoryItem[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.history)
      ? parsed.history
      : [];

    if (!incomingItems.length) {
      throw new Error('No valid history records found in file.');
    }

    const current = getLocalHistory();
    const existingIds = new Set(current.map((i) => i.id));
    const newItems = incomingItems.filter((i) => i && i.id && !existingIds.has(i.id));

    const merged = [...newItems, ...current].slice(0, MAX_LOCAL_ITEMS);
    saveLocalHistory(merged);

    // Sync to backend in background
    for (const item of newItems) {
      request('/history', {
        method: 'POST',
        body: JSON.stringify({
          id: item.id,
          title: item.title,
          analysis_type: item.analysis_type,
          relation_name: item.relation_name,
          highest_normal_form: item.highest_normal_form,
          schema_data: item.schema_data,
          analysis_result: item.analysis_result,
          summary: item.summary,
        }),
      }).catch(() => {});
    }

    return newItems.length;
  } catch (err) {
    console.error('Failed to import history JSON', err);
    throw err;
  }
}

/**
 * Restores a historical relation schema into the active workspace draft.
 */
export function restoreSchemaToWorkspace(schema: RelationSchema): void {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(schema));
  } catch (err) {
    console.error('Failed to restore schema draft to localStorage', err);
  }
}

export const historyService = {
  getLocalHistory,
  getHistory,
  recordHistoryItem,
  recordNormalizationAnalysis,
  recordKeyAnalysis,
  recordClosureAnalysis,
  recordSnapshot,
  deleteHistoryItem,
  clearAllHistory,
  exportHistoryJson,
  importHistoryJson,
  restoreSchemaToWorkspace,
};
