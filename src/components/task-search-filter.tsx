"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  X, 
  Calendar, 
  User, 
  Flag, 
  Hash,
  SlidersHorizontal,
  CheckSquare
} from 'lucide-react';

interface TaskSearchFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: TaskFilters) => void;
  availableTags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  availableAssignees?: Array<{
    id: string;
    user_id: string;
  }>;
  className?: string;
}

interface TaskFilters {
  status?: ('TODO' | 'IN_PROGRESS' | 'DONE')[];
  priority?: ('LOW' | 'MEDIUM' | 'HIGH')[];
  assignee?: string[];
  tags?: string[];
  dateRange?: {
    from?: string;
    to?: string;
  };
}

const statusOptions = [
  { value: 'TODO', label: 'To Do', color: 'bg-slate-100 text-slate-700' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  { value: 'DONE', label: 'Done', color: 'bg-green-100 text-green-700' }
];

const priorityOptions = [
  { value: 'LOW', label: 'Low', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  { value: 'HIGH', label: 'High', color: 'bg-red-100 text-red-700' }
];

export function TaskSearchFilter({ 
  onSearch, 
  onFilter, 
  availableTags = [], 
  availableAssignees = [],
  className = '' 
}: TaskSearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, onSearch]);

  // Apply filters when they change
  useEffect(() => {
    onFilter(filters);
  }, [filters, onFilter]);

  const updateFilter = (key: keyof TaskFilters, value: TaskFilters[keyof TaskFilters]) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleArrayFilter = (key: 'status' | 'priority' | 'assignee' | 'tags', value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [key]: newArray.length > 0 ? newArray : undefined
      };
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status?.length) count++;
    if (filters.priority?.length) count++;
    if (filters.assignee?.length) count++;
    if (filters.tags?.length) count++;
    if (filters.dateRange?.from || filters.dateRange?.to) count++;
    return count;
  };

  const getFilterSummary = () => {
    const parts = [];
    if (filters.status?.length) parts.push(`${filters.status.length} status`);
    if (filters.priority?.length) parts.push(`${filters.priority.length} priority`);
    if (filters.assignee?.length) parts.push(`${filters.assignee.length} assignee`);
    if (filters.tags?.length) parts.push(`${filters.tags.length} tags`);
    if (filters.dateRange?.from || filters.dateRange?.to) parts.push('date range');
    return parts.join(', ');
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => setSearchQuery('')}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Filter Button */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <SlidersHorizontal className="w-4 h-4" />
            {getActiveFilterCount() > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center bg-blue-500">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Filters</h3>
              {getActiveFilterCount() > 0 && (
                <Button size="sm" variant="ghost" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Status</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {statusOptions.map(option => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={filters.status?.includes(option.value as 'TODO' | 'IN_PROGRESS' | 'DONE') ? "default" : "outline"}
                    onClick={() => toggleArrayFilter('status', option.value)}
                    className={`text-xs ${
                      filters.status?.includes(option.value as 'TODO' | 'IN_PROGRESS' | 'DONE') 
                        ? '' 
                        : option.color
                    }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Priority</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {priorityOptions.map(option => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={filters.priority?.includes(option.value as 'LOW' | 'MEDIUM' | 'HIGH') ? "default" : "outline"}
                    onClick={() => toggleArrayFilter('priority', option.value)}
                    className={`text-xs ${
                      filters.priority?.includes(option.value as 'LOW' | 'MEDIUM' | 'HIGH') 
                        ? '' 
                        : option.color
                    }`}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Assignee Filter */}
            {availableAssignees.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Assignee</span>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {availableAssignees.map(assignee => (
                    <div key={assignee.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`assignee-${assignee.id}`}
                        checked={filters.assignee?.includes(assignee.id) || false}
                        onChange={() => toggleArrayFilter('assignee', assignee.id)}
                        className="rounded"
                      />
                      <label 
                        htmlFor={`assignee-${assignee.id}`}
                        className="text-xs text-gray-700 cursor-pointer"
                      >
                        {assignee.user_id}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Tags</span>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                  {availableTags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => toggleArrayFilter('tags', tag.id)}
                      className={`inline-flex items-center px-2 py-1 rounded text-xs transition-opacity ${
                        filters.tags?.includes(tag.id) 
                          ? 'ring-2 ring-blue-500 opacity-100' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ 
                        backgroundColor: tag.color ? `${tag.color}30` : '#f3f4f6',
                        color: tag.color || '#374151'
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">Date Range</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  placeholder="Start"
                  value={filters.dateRange?.from || ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    from: e.target.value
                  })}
                  className="text-xs"
                />
                <Input
                  type="date"
                  placeholder="End"
                  value={filters.dateRange?.to || ''}
                  onChange={(e) => updateFilter('dateRange', {
                    ...filters.dateRange,
                    to: e.target.value
                  })}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Filter Summary */}
            {getActiveFilterCount() > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  Active filters: {getFilterSummary()}
                </p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}