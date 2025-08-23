"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Keyboard, 
  Zap, 
  Navigation, 
  MousePointer, 
  Eye,
  Command
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  category: 'global' | 'navigation' | 'task' | 'view';
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  disabled?: boolean;
}

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: KeyboardShortcut[];
  formatShortcutKey: (shortcut: KeyboardShortcut) => string;
}

const categoryConfig = {
  global: {
    title: 'Global',
    icon: Zap,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Available anywhere in the app'
  },
  navigation: {
    title: 'Navigation',
    icon: Navigation,
    color: 'bg-green-50 text-green-700 border-green-200',
    description: 'Navigate through tasks and UI'
  },
  task: {
    title: 'Task Actions',
    icon: MousePointer,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Perform actions on selected tasks'
  },
  view: {
    title: 'View Controls',
    icon: Eye,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Switch between different views'
  }
};

export function KeyboardShortcutsHelp({ 
  open, 
  onOpenChange, 
  shortcuts, 
  formatShortcutKey 
}: KeyboardShortcutsHelpProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShortcuts = shortcuts.filter(shortcut => 
    shortcut.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shortcut.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Keyboard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle>Keyboard Shortcuts</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Boost your productivity with these shortcuts
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search shortcuts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Shortcuts Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => {
              const config = categoryConfig[category as keyof typeof categoryConfig];
              const Icon = config.icon;
              
              return (
                <div key={category} className="space-y-4">
                  {/* Category Header */}
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg border",
                      config.color
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{config.title}</h3>
                      <p className="text-xs text-gray-500">{config.description}</p>
                    </div>
                  </div>

                  {/* Shortcuts List */}
                  <div className="space-y-2">
                    {categoryShortcuts.map((shortcut, index) => (
                      <div 
                        key={`${shortcut.key}-${index}`}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm text-gray-700 font-medium">
                          {shortcut.description}
                        </span>
                        <Badge 
                          variant="outline" 
                          className="font-mono text-xs bg-white"
                        >
                          {formatShortcutKey(shortcut)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredShortcuts.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-sm">
                No shortcuts found for &ldquo;{searchQuery}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Footer Tips */}
        <div className="flex-shrink-0 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Command className="w-3 h-3" />
              <span>
                Press <Badge variant="outline" className="font-mono text-xs">?</Badge> to toggle this help
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Keyboard className="w-3 h-3" />
              <span>
                Shortcuts work when not typing in input fields
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick help trigger button component
interface QuickHelpButtonProps {
  onClick: () => void;
  className?: string;
}

export function QuickHelpButton({ onClick, className }: QuickHelpButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        "fixed bottom-4 right-4 z-50 rounded-full shadow-lg bg-white border border-gray-200 hover:shadow-xl transition-all duration-200",
        className
      )}
      title="Show keyboard shortcuts (Press ? for help)"
    >
      <Keyboard className="w-4 h-4" />
    </Button>
  );
}