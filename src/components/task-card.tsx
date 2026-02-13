// import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  Paperclip,
  Hash,
  Flag,
  FileText,
  CheckCircle2,
  Circle,
  AlertCircle,
  Timer,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: {
    id: string;
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
    sub_tasks?: Array<{
      status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    }>;
  };
  onClick?: () => void;
  className?: string;
}

const priorityConfig = {
  NONE: {
    label: '',
    icon: null,
    color: '',
    bgColor: ''
  },
  LOW: {
    label: 'Low',
    icon: Flag,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50 border-emerald-200'
  },
  MEDIUM: {
    label: 'Medium',
    icon: Flag,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 border-amber-200'
  },
  HIGH: {
    label: 'High',
    icon: AlertCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200'
  },
};

const statusConfig = {
  TODO: {
    icon: Circle,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50'
  },
  IN_PROGRESS: {
    icon: Timer,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50'
  },
  DONE: {
    icon: CheckCircle2,
    color: 'text-green-500',
    bgColor: 'bg-green-50'
  }
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

export function TaskCard({ task, onClick, className }: TaskCardProps) {
  const statusInfo = statusConfig[task.status];
  const priorityInfo = priorityConfig[task.priority];
  const StatusIcon = statusInfo.icon;
  const PriorityIcon = priorityInfo.icon;

  const dueDateInfo = task.due_date ? getDaysUntilDue(task.due_date) : null;

  // Calculate subtask progress
  const getSubtaskProgress = () => {
    if (!task.sub_tasks || task.sub_tasks.length === 0) return null;
    const completed = task.sub_tasks.filter(st => st.status === 'DONE').length;
    const total = task.sub_tasks.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  };

  const subtaskProgress = getSubtaskProgress();

  const isHighPriority = task.priority === 'HIGH';
  const isOverdue = dueDateInfo?.isOverdue;
  const isDueToday = dueDateInfo?.isToday;
  const isDueTomorrow = dueDateInfo?.isTomorrow;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "group relative bg-card dark:bg-card/50 rounded-xl border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1",
        "w-full p-4 space-y-3",
        isOverdue && "border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-900/30",
        isDueToday && "border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-900/30",
        isHighPriority && !isOverdue && "border-red-100 bg-red-50/30 dark:bg-red-900/5 dark:border-red-900/20",
        !isOverdue && !isDueToday && !isHighPriority && "border-border/60 hover:border-border dark:border-border/40",
        className
      )}
      onClick={handleClick}
    >
      {/* Priority & Status Indicators */}
      <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
        {task.priority !== 'NONE' && PriorityIcon && (
          <div className={cn("p-1 rounded-full border", priorityInfo.bgColor)}>
            <PriorityIcon className={cn("w-3 h-3", priorityInfo.color)} />
          </div>
        )}
        <div className={cn("p-1 rounded-full border", statusInfo.bgColor)}>
          <StatusIcon className={cn("w-3 h-3", statusInfo.color)} />
        </div>
      </div>

      {/* Task Title */}
      <div className="pr-16">
        <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {task.title}
        </h3>
      </div>

      {/* Description */}
      {task.description && (
        <div className="flex items-start gap-1.5">
          <FileText className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        </div>
      )}

      {/* Subtask Progress */}
      {subtaskProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-600">
                {subtaskProgress.completed}/{subtaskProgress.total} subtasks
              </span>
            </div>
            <span className="text-xs font-medium text-gray-500">
              {subtaskProgress.percentage}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                subtaskProgress.percentage === 100 ? "bg-green-500" : "bg-blue-500"
              )}
              style={{ width: `${subtaskProgress.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Hash className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 2).map(({ tag }) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: tag.color ? `${tag.color}25` : '#f1f5f9',
                  color: tag.color || '#64748b',
                  border: `1px solid ${tag.color ? `${tag.color}40` : '#e2e8f0'}`
                }}
              >
                {tag.name}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Assignee & Due Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {task.assignee && (
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700 px-1.5 py-0.5 rounded">
              <Avatar className="w-5 h-5 border border-gray-300 dark:border-gray-500">
                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 text-gray-700 dark:text-gray-200 font-medium">
                  {task.assignee.user_id.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium truncate max-w-16">
                {task.assignee.user_id}
              </span>
            </div>
          )}
        </div>

        {task.due_date && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
            isOverdue && "bg-red-100 text-red-700 border-red-200",
            isDueToday && "bg-amber-100 text-amber-700 border-amber-200",
            isDueTomorrow && "bg-blue-100 text-blue-700 border-blue-200",
            !isOverdue && !isDueToday && !isDueTomorrow && "bg-gray-100 text-gray-600 border-gray-200"
          )}>
            <Calendar className="w-3 h-3" />
            <span>
              {isOverdue && `${Math.abs(dueDateInfo!.days)}d overdue`}
              {isDueToday && 'Today'}
              {isDueTomorrow && 'Tomorrow'}
              {!isOverdue && !isDueToday && !isDueTomorrow &&
                new Date(task.due_date).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short'
                })
              }
            </span>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100/80">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {task._count?.sub_tasks && task._count.sub_tasks > 0 && (
            <div className="flex items-center gap-1">
              <Target className="w-3.5 h-3.5" />
              <span>{task._count.sub_tasks}</span>
            </div>
          )}
          {task._count?.attachments && task._count.attachments > 0 && (
            <div className="flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              <span>{task._count.attachments}</span>
            </div>
          )}
        </div>

        {task.created_at && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>
              {new Date(task.created_at).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short'
              })}
            </span>
          </div>
        )}
      </div>

      {/* Urgency Indicator */}
      {(isOverdue || (isDueToday && isHighPriority)) && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
      )}
    </div>
  );
}

export type { TaskCardProps };