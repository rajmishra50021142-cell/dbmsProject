import React from 'react';
import { useApiHealth } from '../../hooks/useApiHealth';
import { RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface HealthIndicatorProps {
  className?: string;
  showDetails?: boolean;
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({ className, showDetails = false }) => {
  const { status, data, error, retry } = useApiHealth();

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border select-none transition-colors',
          status === 'connected' &&
            'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          status === 'checking' &&
            'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          status === 'disconnected' &&
            'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        )}
        title={
          status === 'connected'
            ? `Connected to ${data?.service || 'API'} (v${data?.version})`
            : error || 'Checking API connectivity'
        }
      >
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            status === 'connected' && 'bg-emerald-500 animate-pulse',
            status === 'checking' && 'bg-amber-500 animate-ping',
            status === 'disconnected' && 'bg-rose-500'
          )}
          aria-hidden="true"
        />
        <span className="text-[11px] font-medium tracking-tight">
          {status === 'connected' && 'API Online'}
          {status === 'checking' && 'Connecting...'}
          {status === 'disconnected' && 'API Offline'}
        </span>
      </div>

      {status === 'disconnected' && (
        <button
          onClick={retry}
          type="button"
          aria-label="Retry connecting to API"
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus-visible-ring"
          title="Retry connecting to API"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}

      {showDetails && data && (
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden md:inline">
          v{data.version} ({data.environment})
        </span>
      )}
    </div>
  );
};
