'use client';

import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  User,
  Flag,
  Hash,
  CheckCircle2,
  Circle,
  Timer,
  Plus,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Task {
  id: string;
  name: string;
  column: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
  due_date?: string;
  start_date?: string;
  created_at?: string;
  assignee?: {
    user_id: string;
  } | null;
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      color: string;
    };
  }>;
  _count?: {
    sub_tasks?: number;
    attachments?: number;
  };
  [key: string]: unknown;
}

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskCreate?: (task: {
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

const priorityConfig = {
  NONE: { label: 'None', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  LOW: { label: 'Low', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  HIGH: { label: 'High', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

const statusConfig = {
  TODO: { label: 'To Do', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/50 dark:text-slate-300', icon: Circle },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', icon: Timer },
  DONE: { label: 'Done', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle2 },
};

function getDaysUntilDue(dueDate: string): { days: number; isOverdue: boolean; isToday: boolean; isTomorrow: boolean } {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    days: diffDays,
    isOverdue: diffDays < 0,
    isToday: diffDays === 0,
    isTomorrow: diffDays === 1
  };
}

export function TaskListView({ tasks, onTaskClick, onTaskUpdate, onTaskCreate, availableTags = [] }: TaskListViewProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
        <div className="col-span-4 pl-2">Task</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2">Priority</div>
        <div className="col-span-2">Assignee</div>
        <div className="col-span-2">Due Date</div>
      </div>

      {/* Task Rows */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-border/40 rounded-xl bg-secondary/5">
            <div className="text-muted-foreground font-medium">No tasks found</div>
          </div>
        ) : (
          tasks.map((task) => {
            const statusInfo = statusConfig[task.status];
            const priorityInfo = priorityConfig[task.priority];
            const StatusIcon = statusInfo.icon;

            const dueDateInfo = task.due_date ? getDaysUntilDue(task.due_date) : null;
            const isOverdue = dueDateInfo?.isOverdue;
            const isDueToday = dueDateInfo?.isToday;
            const isDueTomorrow = dueDateInfo?.isTomorrow;

            return (
              <div
                key={task.id}
                onClick={() => onTaskClick(task)}
                className={cn(
                  "group grid grid-cols-12 gap-4 p-4 bg-card rounded-xl border border-border/40 hover:border-border hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200 items-center",
                  isOverdue && "border-red-200/50 bg-red-50/30 dark:bg-red-900/10",
                  isDueToday && "border-amber-200/50 bg-amber-50/30 dark:bg-amber-900/10"
                )}
              >
                {/* Task Title & Description */}
                <div className="col-span-4 space-y-1">
                  <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                      {task.description}
                    </p>
                  )}
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Hash className="w-3 h-3 text-gray-400" />
                      {task.tags.slice(0, 2).map(({ tag }) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
                          style={{
                            backgroundColor: tag.color ? `${tag.color}25` : '#f1f5f9',
                            color: tag.color || '#64748b',
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                      {task.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="col-span-2 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onTaskUpdate) {
                        const nextStatus = task.status === 'TODO' ? 'IN_PROGRESS' :
                          task.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
                        onTaskUpdate(task.id, { status: nextStatus });
                      }
                    }}
                    className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded transition-colors"
                  >
                    <StatusIcon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <Badge variant="outline" className={cn("font-medium border-transparent bg-opacity-50", statusInfo.color)}>
                      {statusInfo.label}
                    </Badge>
                  </button>
                </div>

                {/* Priority */}
                <div className="col-span-2 flex items-center gap-2">
                  {task.priority !== 'NONE' && (
                    <>
                      <Flag className="w-4 h-4 text-gray-500" />
                      <Badge className={priorityInfo.color} variant="secondary">
                        {priorityInfo.label}
                      </Badge>
                    </>
                  )}
                </div>

                {/* Assignee */}
                <div className="col-span-2 flex items-center gap-2">
                  {task.assignee && (
                    <>
                      <User className="w-4 h-4 text-gray-500" />
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {task.assignee.user_id.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                        {task.assignee.user_id}
                      </span>
                    </>
                  )}
                </div>

                {/* Due Date */}
                <div className="col-span-2 flex items-center gap-2">
                  {task.due_date && (
                    <>
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <div className={cn(
                        "text-sm",
                        isOverdue && "text-red-600 dark:text-red-400 font-medium",
                        isDueToday && "text-amber-600 dark:text-amber-400 font-medium",
                        isDueTomorrow && "text-blue-600 dark:text-blue-400 font-medium",
                        !isOverdue && !isDueToday && !isDueTomorrow && "text-gray-600 dark:text-gray-300"
                      )}>
                        {isOverdue && `${Math.abs(dueDateInfo!.days)} days overdue`}
                        {isDueToday && 'Today'}
                        {isDueTomorrow && 'Tomorrow'}
                        {!isOverdue && !isDueToday && !isDueTomorrow &&
                          new Date(task.due_date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short'
                          })
                        }
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Add New Task Row */}
        {onTaskCreate && (
          <div className="pt-2">
            <AddNewTaskRow onTaskCreate={onTaskCreate} availableTags={availableTags} />
          </div>
        )}
      </div>
    </div>
  );
}

// Add New Task Row Component
function AddNewTaskRow({
  onTaskCreate,
  availableTags
}: {
  onTaskCreate: (task: {
    title: string;
    description?: string;
    priority?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
    due_date?: string;
    start_date?: string;
    tags?: string[];
  }) => void;
  availableTags: Array<{
    id: string;
    name: string;
    color: string;
  }>;
}) {
  const [isActive, setIsActive] = useState(false);
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onTaskCreate({
      title: title.trim(),
      status: 'TODO',
    });

    setTitle('');
    setIsActive(false);
  };

  const handleCancel = () => {
    setTitle('');
    setIsActive(false);
  };

  if (!isActive) {
    return (
      <div
        onClick={() => setIsActive(true)}
        className="grid grid-cols-12 gap-4 p-3 border border-dashed border-border/40 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group items-center"
      >
        <div className="col-span-12 flex items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors pl-2">
          <div className="bg-secondary group-hover:bg-primary/10 p-1 rounded-md transition-colors">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Add new task...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4 p-4 bg-card rounded-xl border border-border/40 shadow-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="col-span-8">
        <Input
          placeholder="Enter task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-none bg-transparent focus-visible:ring-0 p-0 text-sm"
          autoFocus
        />
      </div>
      <div className="col-span-4 flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
          <X className="w-4 h-4" />
        </Button>
        <Button type="submit" size="sm" disabled={!title.trim()}>
          Add
        </Button>
      </div>
    </form>
  );
}