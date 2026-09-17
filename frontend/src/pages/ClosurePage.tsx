import React from 'react';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Badge } from '../components/ui/Badge';
import { ClosureLab } from '../features/closure/ClosureLab';

export const ClosurePage: React.FC = () => {
  return (
    <div className="flex flex-col flex-1 py-6 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto w-full">
      <SectionHeading
        title="Attribute Closure Laboratory"
        subtitle="Compute deterministic attribute closures (X⁺), trace derivation steps, test functional determinations, and evaluate superkeys."
        badge={
          <Badge variant="accent" size="sm">
            Algorithmic Lab
          </Badge>
        }
      />
      <ClosureLab />
    </div>
  );
};
