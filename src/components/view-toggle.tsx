'use client';

import { Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = 'kanban' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded-md p-1">
      <Button
        variant={view === 'kanban' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('kanban')}
        className="h-7 px-2"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="h-7 px-2"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}