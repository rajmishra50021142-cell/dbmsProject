import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { cn } from '../../utils/cn';

export interface ThemeToggleProps {
  className?: string;
  variant?: 'button' | 'compact';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, variant = 'button' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'Day' : 'Night'} Mode (currently ${isDark ? 'Night' : 'Day'} Mode)`}
      title={`Switch to ${isDark ? 'Day' : 'Night'} Mode`}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors select-none focus:outline-none focus-visible-ring',
        isDark
          ? 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700/80'
          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
        className
      )}
    >
      {isDark ? (
        <>
          <Moon className="w-3.5 h-3.5 fill-amber-300/30 text-amber-300" aria-hidden="true" />
          {variant === 'button' && <span>🌙 Night</span>}
        </>
      ) : (
        <>
          <Sun className="w-3.5 h-3.5 fill-amber-400/30 text-amber-500" aria-hidden="true" />
          {variant === 'button' && <span>☀️ Day</span>}
        </>
      )}
    </button>
  );
};
