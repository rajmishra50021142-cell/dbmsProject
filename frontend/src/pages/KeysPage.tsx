import React from 'react';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Badge } from '../components/ui/Badge';
import { KeyAnalysisLab } from '../features/keys/KeyAnalysisLab';

export const KeysPage: React.FC = () => {
  return (
    <div className="flex flex-col flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
      <SectionHeading
        title="Candidate Key & Superkey Laboratory"
        subtitle="Deterministically derive minimal candidate keys, verify superkey properties, test minimality, and classify prime versus non-prime attributes."
        badge={
          <Badge variant="accent" size="sm">
            Key Discovery
          </Badge>
        }
      />
      <KeyAnalysisLab />
    </div>
  );
};
