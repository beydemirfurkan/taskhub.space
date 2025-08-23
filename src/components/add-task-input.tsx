'use client';

import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Flag, Plus, Hash } from "lucide-react";

interface AddTaskInputProps {
  onTaskCreate: (task: {
    title: string;
    description?: string;
    priority?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
    due_date?: string;
    start_date?: string;
    tags?: string[];
  }) => void;
  availableTags?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}

export function AddTaskInput({ onTaskCreate, availableTags = [] }: AddTaskInputProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'NONE' | 'LOW' | 'MEDIUM' | 'HIGH'>('NONE');
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onTaskCreate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority: priority !== 'NONE' ? priority : undefined,
      due_date: dueDate || undefined,
      start_date: startDate || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });

    setTitle('');
    setDescription('');
    setPriority('NONE');
    setDueDate('');
    setStartDate('');
    setSelectedTags([]);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setPriority('NONE');
    setDueDate('');
    setStartDate('');
    setSelectedTags([]);
    setIsExpanded(false);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (!isExpanded) {
    return (
      <div 
        onClick={() => setIsExpanded(true)}
        className="p-3 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
      >
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Add new task...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="space-y-4">
        <Input
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-200 px-3 py-2 text-sm font-medium focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
          autoFocus
        />
        
        <Textarea
          placeholder="Add description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-200 px-3 py-2 text-sm resize-none focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:border-blue-500"
          rows={3}
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Calendar className="w-3 h-3 mr-1" />
                  <span className="text-xs">Date</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Dates</h4>
                  <div className="grid gap-2">
                    <div>
                      <label className="text-xs text-muted-foreground">Start Date</label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-xs mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Due Date</label>
                      <Input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="text-xs mt-1"
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 px-2">
                  <Flag className="w-3 h-3 mr-1" />
                  <span className="text-xs">Priority</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2">
                <div className="space-y-1">
                  <h4 className="font-medium text-sm px-2 py-1">Select Priority</h4>
                  {(['NONE', 'LOW', 'MEDIUM', 'HIGH'] as const).map((p) => (
                    <Button
                      key={p}
                      variant={priority === p ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPriority(p)}
                      className="w-full justify-start text-xs"
                    >
                      {p === 'NONE' ? 'None' : 
                       p === 'LOW' ? 'Low' : 
                       p === 'MEDIUM' ? 'Medium' : 'High'}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {availableTags.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <Hash className="w-3 h-3 mr-1" />
                    <span className="text-xs">Tags</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Select Tags</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {availableTags.map((tag) => (
                        <label
                          key={tag.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTags.includes(tag.id)}
                            onChange={() => toggleTag(tag.id)}
                            className="rounded"
                          />
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: tag.color ? `${tag.color}25` : '#f1f5f9',
                              color: tag.color || '#64748b',
                              border: `1px solid ${tag.color ? `${tag.color}40` : '#e2e8f0'}`
                            }}
                          >
                            {tag.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!title.trim()}>
              Add
            </Button>
          </div>
        </div>
        
        {(priority !== 'NONE' || dueDate || startDate || selectedTags.length > 0) && (
          <div className="flex items-center space-x-2 flex-wrap">
            {priority !== 'NONE' && (
              <Badge variant="outline" className="text-xs">
                Priority: {priority === 'LOW' ? 'Low' : priority === 'MEDIUM' ? 'Medium' : 'High'}
              </Badge>
            )}
            {startDate && (
              <Badge variant="outline" className="text-xs">
                Start: {new Date(startDate).toLocaleDateString('en-US')}
              </Badge>
            )}
            {dueDate && (
              <Badge variant="outline" className="text-xs">
                Due: {new Date(dueDate).toLocaleDateString('en-US')}
              </Badge>
            )}
            {selectedTags.map(tagId => {
              const tag = availableTags.find(t => t.id === tagId);
              return tag ? (
                <Badge
                  key={tag.id}
                  className="text-xs"
                  style={{ 
                    backgroundColor: tag.color ? `${tag.color}25` : '#f1f5f9',
                    color: tag.color || '#64748b',
                    border: `1px solid ${tag.color ? `${tag.color}40` : '#e2e8f0'}`
                  }}
                >
                  {tag.name}
                </Badge>
              ) : null;
            })}
          </div>
        )}
      </div>
    </form>
  );
}