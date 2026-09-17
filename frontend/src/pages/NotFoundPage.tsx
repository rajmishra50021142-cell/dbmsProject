import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { FileQuestion, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col flex-1 items-center justify-center p-8 max-w-lg mx-auto">
      <EmptyState
        icon={<FileQuestion className="w-8 h-8 text-amber-500" />}
        title="Page Not Found"
        description="The requested page route does not exist in Normalization Lab."
        action={
          <Link to="/">
            <Button size="sm" leftIcon={<Home className="w-4 h-4" />}>
              Return to Home
            </Button>
          </Link>
        }
      />
    </div>
  );
};
