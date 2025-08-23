"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Command,
  Search,
  ArrowRight,
  Clock,
  Target,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'navigation' | 'task' | 'search' | 'workspace' | 'recent';
  icon?: React.ComponentType<{ className?: string }>;
  keywords?: string[];
  action: () => void | Promise<void>;
  shortcut?: string;
  disabled?: boolean;
  badge?: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: CommandItem[];
  recentCommands?: string[]; // Command IDs
  placeholder?: string;
}

const categoryConfig = {
  navigation: {
    title: 'Navigation',
    icon: ArrowRight,
    color: 'text-blue-600'
  },
  task: {
    title: 'Task Actions',
    icon: Target,
    color: 'text-green-600'
  },
  search: {
    title: 'Search & Filter',
    icon: Search,
    color: 'text-purple-600'
  },
  workspace: {
    title: 'Workspace',
    icon: Users,
    color: 'text-amber-600'
  },
  recent: {
    title: 'Recent',
    icon: Clock,
    color: 'text-gray-600'
  }
};

export function CommandPalette({ 
  open, 
  onOpenChange, 
  commands, 
  recentCommands = [],
  placeholder = "Type a command or search..."
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset state when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      // Focus input after a brief delay to ensure dialog is rendered
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Filter and sort commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      // Show recent commands first, then all commands
      const recentCommandsData = commands.filter(cmd => recentCommands.includes(cmd.id));
      const otherCommands = commands.filter(cmd => !recentCommands.includes(cmd.id));
      
      return [
        ...recentCommandsData.map(cmd => ({ ...cmd, category: 'recent' as const })),
        ...otherCommands
      ].slice(0, 50); // Limit to 50 items for performance
    }

    const searchTerms = query.toLowerCase().split(' ').filter(Boolean);
    
    return commands
      .map(command => {
        let score = 0;
        const searchableText = [
          command.title,
          command.subtitle || '',
          ...(command.keywords || [])
        ].join(' ').toLowerCase();

        // Exact title match gets highest score
        if (command.title.toLowerCase() === query.toLowerCase()) {
          score += 100;
        }

        // Title starts with query
        if (command.title.toLowerCase().startsWith(query.toLowerCase())) {
          score += 50;
        }

        // Count matching search terms
        searchTerms.forEach(term => {
          if (searchableText.includes(term)) {
            score += 10;
            // Bonus for title matches
            if (command.title.toLowerCase().includes(term)) {
              score += 20;
            }
          }
        });

        return { ...command, score };
      })
      .filter(command => command.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Limit results
  }, [query, commands, recentCommands]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    
    filteredCommands.forEach(command => {
      const category = command.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(command);
    });

    return groups;
  }, [filteredCommands]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
          e.preventDefault();
          const selectedCommand = filteredCommands[selectedIndex];
          if (selectedCommand && !selectedCommand.disabled) {
            executeCommand(selectedCommand);
          }
          break;
        case 'Escape':
          onOpenChange(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredCommands, onOpenChange]);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    
    const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedElement) {
      selectedElement.scrollIntoView({ 
        block: 'nearest', 
        behavior: 'smooth' 
      });
    }
  }, [selectedIndex]);

  const executeCommand = async (command: CommandItem) => {
    if (command.disabled) return;
    
    setIsLoading(true);
    
    try {
      await command.action();
      onOpenChange(false);
      
      // Add to recent commands (you might want to persist this)
      // This would typically be handled by a parent component or context
    } catch (error) {
      console.error('Command execution failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderCommand = (command: CommandItem, index: number, globalIndex: number) => {
    const Icon = command.icon || Command;
    const isSelected = globalIndex === selectedIndex;
    
    return (
      <button
        key={command.id}
        data-index={globalIndex}
        onClick={() => executeCommand(command)}
        disabled={command.disabled || isLoading}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg border border-transparent transition-all duration-150",
          isSelected && "bg-blue-50 border-blue-200 shadow-sm",
          !isSelected && "hover:bg-gray-50",
          command.disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className={cn(
          "flex-shrink-0 p-1.5 rounded-md",
          isSelected ? "bg-blue-100" : "bg-gray-100"
        )}>
          <Icon className={cn(
            "w-4 h-4",
            isSelected ? "text-blue-600" : "text-gray-600"
          )} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn(
              "font-medium text-sm",
              isSelected ? "text-blue-900" : "text-gray-900"
            )}>
              {command.title}
            </span>
            {command.badge && (
              <Badge variant="secondary" className="text-xs">
                {command.badge}
              </Badge>
            )}
          </div>
          {command.subtitle && (
            <p className={cn(
              "text-xs mt-1 truncate",
              isSelected ? "text-blue-700" : "text-gray-500"
            )}>
              {command.subtitle}
            </p>
          )}
        </div>
        
        {command.shortcut && (
          <Badge variant="outline" className="font-mono text-xs">
            {command.shortcut}
          </Badge>
        )}
      </button>
    );
  };

  let globalIndex = 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-white/95 backdrop-blur-sm">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-200">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0); // Reset selection on search
            }}
            placeholder={placeholder}
            className="border-0 bg-transparent text-base placeholder:text-gray-400 focus:ring-0 focus:outline-none"
          />
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Badge variant="outline" className="font-mono">Esc</Badge>
            <span>to close</span>
          </div>
        </div>

        {/* Commands List */}
        <div 
          ref={listRef}
          className="max-h-96 overflow-y-auto py-2"
        >
          {Object.entries(groupedCommands).map(([category, categoryCommands]) => {
            const config = categoryConfig[category as keyof typeof categoryConfig];
            const CategoryIcon = config?.icon || Command;
            
            const categoryStartIndex = globalIndex;
            
            return (
              <div key={category} className="px-2">
                {/* Category Header */}
                <div className="flex items-center gap-2 px-2 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  <CategoryIcon className={cn("w-3 h-3", config?.color)} />
                  {config?.title || category}
                </div>
                
                {/* Category Commands */}
                <div className="space-y-1 mb-4">
                  {categoryCommands.map((command, index) => {
                    const renderedCommand = renderCommand(command, index, globalIndex);
                    globalIndex++;
                    return renderedCommand;
                  })}
                </div>
              </div>
            );
          })}

          {/* Empty State */}
          {filteredCommands.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm">
                {query ? `No commands found for "${query}"` : 'No commands available'}
              </p>
              <p className="text-xs mt-2 text-gray-400">
                Try a different search term or check your permissions
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="font-mono">↑↓</Badge>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="font-mono">⏎</Badge>
                <span>Select</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span>{filteredCommands.length} commands</span>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg border">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-600">Executing command...</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Hook for managing command palette state
export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  return {
    open,
    setOpen,
    toggle: () => setOpen(prev => !prev),
  };
}