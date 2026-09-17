/**
 * Service for What-If / Experiment Mode API and local snapshot management.
 */

import { request } from './apiClient';
import {
  ExperimentAnalyzeRequest,
  ExperimentAnalyzeResponse,
  ExperimentSnapshot,
} from '../types';

const SNAPSHOT_STORAGE_KEY = 'normalization_lab_experiment_snapshots';

export async function analyzeExperiment(
  payload: ExperimentAnalyzeRequest
): Promise<ExperimentAnalyzeResponse> {
  return request<ExperimentAnalyzeResponse>('/experiments/analyze', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getExperimentSnapshots(): ExperimentSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAPSHOT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load experiment snapshots from localStorage', err);
    return [];
  }
}

export function saveExperimentSnapshot(snapshot: ExperimentSnapshot): void {
  try {
    const existing = getExperimentSnapshots();
    const updated = [snapshot, ...existing.filter((s) => s.id !== snapshot.id)].slice(0, 20);
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save experiment snapshot to localStorage', err);
  }
}

export function deleteExperimentSnapshot(id: string): void {
  try {
    const existing = getExperimentSnapshots();
    const updated = existing.filter((s) => s.id !== id);
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete experiment snapshot from localStorage', err);
  }
}
