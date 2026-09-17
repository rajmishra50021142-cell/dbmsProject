import React from 'react';
import { HelpCircle } from 'lucide-react';

interface EvidenceAnchorProps {
  label?: string;
  onClick: () => void;
  title?: string;
}

export const EvidenceAnchor: React.FC<EvidenceAnchorProps> = ({
  label = 'Why?',
  onClick,
  title = 'Click to inspect mathematical proof and evidence',
}) => {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={title}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors cursor-pointer"
    >
      <HelpCircle className="w-3 h-3" />
      <span>{label}</span>
    </button>
  );
};
