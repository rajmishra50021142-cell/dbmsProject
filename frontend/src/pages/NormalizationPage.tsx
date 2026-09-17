import React from 'react';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Badge } from '../components/ui/Badge';
import { NormalizationLab } from '../features/normalization/NormalizationLab';

export const NormalizationPage: React.FC = () => {
  return (
    <div className="flex flex-col flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
      <SectionHeading
        title="Normalization Laboratory & Interactive Journey"
        subtitle="Evaluate 1NF cell atomicity, 2NF partial dependencies, 3NF transitive dependencies, 4NF multivalued dependencies, and explore interactive dependency graphs and attribute closure playback."
        badge={
          <Badge variant="accent" size="sm">
            Interactive Visualizer
          </Badge>
        }
      />
      <NormalizationLab />
    </div>
  );
};
