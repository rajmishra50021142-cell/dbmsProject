import React from 'react';
import { cn } from '../../utils/cn';

export interface DividerProps {
  label?: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export const Divider: React.FC<DividerProps> = ({
  label,
  className,
  orientation = 'horizontal',
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn('w-px h-full bg-slate-200 dark:bg-slate-800 self-stretch', className)}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    return (
      <div className={cn('relative flex items-center w-full my-4', className)}>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
        <span className="flex-shrink mx-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
      </div>
    );
  }

  return (
    <hr
      className={cn('w-full border-t border-slate-200 dark:border-slate-800 my-4', className)}
    />
  );
};
