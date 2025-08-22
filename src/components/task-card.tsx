// import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  Paperclip, 
  Hash, 
  User,
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
    label: 'Düşük', 
    icon: Flag, 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50 border-emerald-200' 
  },
  MEDIUM: { 
    label: 'Orta', 
    icon: Flag, 
    color: 'text-amber-600', 
    bgColor: 'bg-amber-50 border-amber-200' 
  },
  HIGH: { 
    label: 'Yüksek', 
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
        "group relative bg-white rounded-lg border transition-all duration-200 cursor-pointer hover:border-gray-400",
        "w-full p-4 space-y-3",
        isOverdue && "border-red-300 bg-red-50/20",
        isDueToday && "border-amber-300 bg-amber-50/20", 
        isHighPriority && !isOverdue && "border-red-200 bg-red-50/10",
        !isOverdue && !isDueToday && !isHighPriority && "border-gray-200",
        className
      )}
      onClick={handleClick}
    >
      {/* Priority & Status Indicators */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {task.priority !== 'NONE' && PriorityIcon && (
          <div className={cn("p-1.5 rounded-full border", priorityInfo.bgColor)}>
            <PriorityIcon className={cn("w-3.5 h-3.5", priorityInfo.color)} />
          </div>
        )}
        <div className={cn("p-1.5 rounded-full border", statusInfo.bgColor)}>
          <StatusIcon className={cn("w-3.5 h-3.5", statusInfo.color)} />
        </div>
      </div>

      {/* Task Title */}
      <div className="pr-20">
        <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2 group-hover:text-gray-700 transition-colors">
          {task.title}
        </h3>
      </div>

      {/* Description */}
      {task.description && (
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Hash className="w-4 h-4 text-gray-400 shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {task.tags.slice(0, 2).map(({ tag }) => (
              <span
                key={tag.id}
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all hover:scale-105"
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
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                +{task.tags.length - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Assignee & Due Date */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.assignee && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <Avatar className="w-7 h-7 border border-gray-300">
                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-100 to-purple-100 text-gray-700 font-medium">
                  {task.assignee.user_id.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
        
        {task.due_date && (
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border",
            isOverdue && "bg-red-100 text-red-700 border-red-200",
            isDueToday && "bg-amber-100 text-amber-700 border-amber-200",
            isDueTomorrow && "bg-blue-100 text-blue-700 border-blue-200",
            !isOverdue && !isDueToday && !isDueTomorrow && "bg-gray-100 text-gray-600 border-gray-200"
          )}>
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {isOverdue && `${Math.abs(dueDateInfo!.days)} gün geçti`}
              {isDueToday && 'Bugün'}
              {isDueTomorrow && 'Yarın'}
              {!isOverdue && !isDueToday && !isDueTomorrow && 
                new Date(task.due_date).toLocaleDateString('tr-TR', { 
                  day: 'numeric', 
                  month: 'short'
                })
              }
            </span>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100/80">
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {task._count?.sub_tasks && task._count.sub_tasks > 0 && (
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4" />
              <span>{task._count.sub_tasks} alt görev</span>
            </div>
          )}
          {task._count?.attachments && task._count.attachments > 0 && (
            <div className="flex items-center gap-1.5">
              <Paperclip className="w-4 h-4" />
              <span>{task._count.attachments} dosya</span>
            </div>
          )}
        </div>
        
        {task.created_at && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            <span>
              {new Date(task.created_at).toLocaleDateString('tr-TR', {
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