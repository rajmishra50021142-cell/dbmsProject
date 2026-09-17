import { useState, useEffect, useCallback } from 'react';
import { fetchHealth } from '../services/healthService';
import { HealthResponse } from '../types';

export type ConnectionStatus = 'checking' | 'connected' | 'disconnected';

export function useApiHealth() {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [data, setData] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setStatus('checking');
    setError(null);
    try {
      const res = await fetchHealth();
      setData(res);
      setStatus('connected');
    } catch (err: unknown) {
      setData(null);
      setStatus('disconnected');
      setError(err instanceof Error ? err.message : 'Backend unreachable');
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { status, data, error, retry: check };
}
