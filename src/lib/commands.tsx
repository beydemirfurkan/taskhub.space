"use client";

import { CommandItem } from '@/components/command-palette';
import { 
  Plus,
  List,
  Grid3X3,
  Settings,
  Filter,
  Users,
  Tag,
  Calendar,
  Search,
  User,
  Trash2,
  Edit,
  Eye,
  Target,
  Clock,
  Hash,
  FileText,
  Download,
  Upload,
  Archive,
  Star,
  Bell,
  HelpCircle,
  Keyboard,
  Circle
} from 'lucide-react';
import { toast } from 'sonner';

export interface CommandHandlers {
  // Navigation
  goToKanban: () => void;
  goToList: () => void;
  goToSettings: () => void;
  
  // Task Actions
  createTask: () => void;
  editTask?: () => void;
  deleteTask?: () => void;
  duplicateTask?: () => void;
  assignToMe?: () => void;
  
  // Search & Filter
  focusSearch: () => void;
  showFilters: () => void;
  clearFilters: () => void;
  filterByTag: (tagName?: string) => void;
  filterByAssignee: (userId?: string) => void;
  filterByStatus: (status: string) => void;
  filterByPriority: (priority: string) => void;
  filterByDueDate: (range: string) => void;
  
  // Workspace
  inviteUsers: () => void;
  manageTeam: () => void;
  manageTags: () => void;
  
  // Bulk Operations
  selectAll?: () => void;
  bulkAssign?: () => void;
  bulkChangeStatus?: () => void;
  bulkDelete?: () => void;
  
  // Utilities
  showHelp: () => void;
  showShortcuts: () => void;
  exportTasks?: () => void;
  importTasks?: () => void;
}

export function createCommands(handlers: CommandHandlers): CommandItem[] {
  return [
    // Navigation Commands
    {
      id: 'nav-kanban',
      title: 'Switch to Kanban View',
      subtitle: 'View tasks in columns by status',
      category: 'navigation',
      icon: Grid3X3,
      action: handlers.goToKanban,
      shortcut: '1',
      keywords: ['kanban', 'board', 'columns', 'view']
    },
    {
      id: 'nav-list',
      title: 'Switch to List View',
      subtitle: 'View tasks in a table format',
      category: 'navigation',
      icon: List,
      action: handlers.goToList,
      shortcut: '2',
      keywords: ['list', 'table', 'rows', 'view']
    },
    {
      id: 'nav-settings',
      title: 'Open Settings',
      subtitle: 'Manage app preferences and configuration',
      category: 'navigation',
      icon: Settings,
      action: handlers.goToSettings,
      keywords: ['settings', 'preferences', 'config', 'options']
    },

    // Task Actions
    {
      id: 'task-create',
      title: 'Create New Task',
      subtitle: 'Add a new task to your workspace',
      category: 'task',
      icon: Plus,
      action: handlers.createTask,
      shortcut: '⌘N',
      keywords: ['create', 'new', 'add', 'task']
    },
    ...(handlers.editTask ? [{
      id: 'task-edit',
      title: 'Edit Selected Task',
      subtitle: 'Modify the currently selected task',
      category: 'task' as const,
      icon: Edit,
      action: handlers.editTask,
      shortcut: 'E',
      keywords: ['edit', 'modify', 'update', 'task']
    }] : []),
    ...(handlers.deleteTask ? [{
      id: 'task-delete',
      title: 'Delete Selected Task',
      subtitle: 'Remove the currently selected task',
      category: 'task' as const,
      icon: Trash2,
      action: handlers.deleteTask,
      shortcut: 'D',
      keywords: ['delete', 'remove', 'trash', 'task']
    }] : []),
    ...(handlers.duplicateTask ? [{
      id: 'task-duplicate',
      title: 'Duplicate Selected Task',
      subtitle: 'Create a copy of the current task',
      category: 'task' as const,
      icon: FileText,
      action: handlers.duplicateTask,
      keywords: ['duplicate', 'copy', 'clone', 'task']
    }] : []),
    ...(handlers.assignToMe ? [{
      id: 'task-assign-me',
      title: 'Assign to Me',
      subtitle: 'Assign the selected task to yourself',
      category: 'task' as const,
      icon: User,
      action: handlers.assignToMe,
      shortcut: 'A',
      keywords: ['assign', 'me', 'self', 'task']
    }] : []),

    // Search & Filter Commands
    {
      id: 'search-focus',
      title: 'Focus Search',
      subtitle: 'Jump to the search input field',
      category: 'search',
      icon: Search,
      action: handlers.focusSearch,
      shortcut: '⌘F',
      keywords: ['search', 'find', 'filter', 'focus']
    },
    {
      id: 'filter-show',
      title: 'Show Filters',
      subtitle: 'Open the advanced filter panel',
      category: 'search',
      icon: Filter,
      action: handlers.showFilters,
      keywords: ['filter', 'advanced', 'search', 'options']
    },
    {
      id: 'filter-clear',
      title: 'Clear All Filters',
      subtitle: 'Reset all active filters',
      category: 'search',
      icon: Filter,
      action: handlers.clearFilters,
      keywords: ['clear', 'reset', 'filter', 'all']
    },

    // Status Filters
    {
      id: 'filter-todo',
      title: 'Show To Do Tasks',
      subtitle: 'Filter tasks by To Do status',
      category: 'search',
      icon: Circle,
      action: () => handlers.filterByStatus('TODO'),
      keywords: ['todo', 'status', 'filter', 'pending']
    },
    {
      id: 'filter-progress',
      title: 'Show In Progress Tasks',
      subtitle: 'Filter tasks by In Progress status',
      category: 'search',
      icon: Clock,
      action: () => handlers.filterByStatus('IN_PROGRESS'),
      keywords: ['progress', 'working', 'status', 'filter']
    },
    {
      id: 'filter-done',
      title: 'Show Completed Tasks',
      subtitle: 'Filter tasks by Done status',
      category: 'search',
      icon: Target,
      action: () => handlers.filterByStatus('DONE'),
      keywords: ['done', 'completed', 'finished', 'status', 'filter']
    },

    // Priority Filters
    {
      id: 'filter-high-priority',
      title: 'Show High Priority Tasks',
      subtitle: 'Filter tasks by high priority',
      category: 'search',
      icon: Star,
      action: () => handlers.filterByPriority('HIGH'),
      keywords: ['high', 'priority', 'urgent', 'important', 'filter']
    },
    {
      id: 'filter-medium-priority',
      title: 'Show Medium Priority Tasks',
      subtitle: 'Filter tasks by medium priority',
      category: 'search',
      icon: Star,
      action: () => handlers.filterByPriority('MEDIUM'),
      keywords: ['medium', 'priority', 'normal', 'filter']
    },
    {
      id: 'filter-low-priority',
      title: 'Show Low Priority Tasks',
      subtitle: 'Filter tasks by low priority',
      category: 'search',
      icon: Star,
      action: () => handlers.filterByPriority('LOW'),
      keywords: ['low', 'priority', 'minor', 'filter']
    },

    // Date Filters
    {
      id: 'filter-due-today',
      title: 'Show Tasks Due Today',
      subtitle: 'Filter tasks due today',
      category: 'search',
      icon: Calendar,
      action: () => handlers.filterByDueDate('today'),
      keywords: ['today', 'due', 'date', 'filter', 'deadline']
    },
    {
      id: 'filter-due-week',
      title: 'Show Tasks Due This Week',
      subtitle: 'Filter tasks due this week',
      category: 'search',
      icon: Calendar,
      action: () => handlers.filterByDueDate('week'),
      keywords: ['week', 'due', 'date', 'filter', 'deadline']
    },
    {
      id: 'filter-overdue',
      title: 'Show Overdue Tasks',
      subtitle: 'Filter tasks that are past due',
      category: 'search',
      icon: Calendar,
      action: () => handlers.filterByDueDate('overdue'),
      keywords: ['overdue', 'late', 'past', 'due', 'filter']
    },

    // Workspace Commands
    {
      id: 'workspace-invite',
      title: 'Invite Team Members',
      subtitle: 'Send invitations to join your workspace',
      category: 'workspace',
      icon: Users,
      action: handlers.inviteUsers,
      keywords: ['invite', 'team', 'members', 'users', 'workspace']
    },
    {
      id: 'workspace-team',
      title: 'Manage Team',
      subtitle: 'View and manage team members',
      category: 'workspace',
      icon: Users,
      action: handlers.manageTeam,
      keywords: ['team', 'members', 'manage', 'workspace', 'users']
    },
    {
      id: 'workspace-tags',
      title: 'Manage Tags',
      subtitle: 'Create, edit, and organize tags',
      category: 'workspace',
      icon: Tag,
      action: handlers.manageTags,
      keywords: ['tags', 'labels', 'organize', 'manage', 'workspace']
    },

    // Bulk Operations (conditional)
    ...(handlers.selectAll ? [{
      id: 'bulk-select-all',
      title: 'Select All Tasks',
      subtitle: 'Select all visible tasks for bulk operations',
      category: 'task' as const,
      icon: Target,
      action: handlers.selectAll,
      keywords: ['select', 'all', 'bulk', 'tasks']
    }] : []),
    ...(handlers.bulkAssign ? [{
      id: 'bulk-assign',
      title: 'Bulk Assign Selected Tasks',
      subtitle: 'Assign multiple selected tasks to someone',
      category: 'task' as const,
      icon: Users,
      action: handlers.bulkAssign,
      keywords: ['bulk', 'assign', 'multiple', 'tasks']
    }] : []),
    ...(handlers.bulkChangeStatus ? [{
      id: 'bulk-status',
      title: 'Bulk Change Status',
      subtitle: 'Change status of multiple selected tasks',
      category: 'task' as const,
      icon: Target,
      action: handlers.bulkChangeStatus,
      keywords: ['bulk', 'status', 'change', 'multiple', 'tasks']
    }] : []),
    ...(handlers.bulkDelete ? [{
      id: 'bulk-delete',
      title: 'Bulk Delete Selected Tasks',
      subtitle: 'Delete multiple selected tasks',
      category: 'task' as const,
      icon: Trash2,
      action: handlers.bulkDelete,
      keywords: ['bulk', 'delete', 'remove', 'multiple', 'tasks']
    }] : []),

    // Import/Export (conditional)
    ...(handlers.exportTasks ? [{
      id: 'export-tasks',
      title: 'Export Tasks',
      subtitle: 'Export tasks to CSV or other formats',
      category: 'workspace' as const,
      icon: Download,
      action: handlers.exportTasks,
      keywords: ['export', 'download', 'csv', 'backup', 'tasks']
    }] : []),
    ...(handlers.importTasks ? [{
      id: 'import-tasks',
      title: 'Import Tasks',
      subtitle: 'Import tasks from CSV or other formats',
      category: 'workspace' as const,
      icon: Upload,
      action: handlers.importTasks,
      keywords: ['import', 'upload', 'csv', 'restore', 'tasks']
    }] : []),

    // Help & Utilities
    {
      id: 'help-shortcuts',
      title: 'Show Keyboard Shortcuts',
      subtitle: 'View all available keyboard shortcuts',
      category: 'navigation',
      icon: Keyboard,
      action: handlers.showShortcuts,
      shortcut: '⌘/',
      keywords: ['shortcuts', 'keyboard', 'hotkeys', 'help']
    },
    {
      id: 'help-about',
      title: 'Help & Support',
      subtitle: 'Get help and learn more about TaskHub',
      category: 'navigation',
      icon: HelpCircle,
      action: handlers.showHelp,
      keywords: ['help', 'support', 'about', 'documentation']
    }
  ];
}

// Define interfaces for the function parameters
interface TaskData {
  id: string;
  title: string;
  status: string;
}

interface TagData {
  id: string;
  name: string;
}

interface UserData {
  user_id: string;
}

// Utility function to create quick search commands based on current data
export function createDynamicCommands(
  tasks: TaskData[] = [],
  tags: TagData[] = [],
  users: UserData[] = [],
  handlers: CommandHandlers
): CommandItem[] {
  const dynamicCommands: CommandItem[] = [];

  // Add quick tag filters
  tags.slice(0, 10).forEach(tag => {
    dynamicCommands.push({
      id: `tag-${tag.id}`,
      title: `Filter by #${tag.name}`,
      subtitle: `Show tasks with ${tag.name} tag`,
      category: 'search',
      icon: Hash,
      action: () => handlers.filterByTag(tag.name),
      badge: tag.name,
      keywords: ['tag', 'filter', tag.name.toLowerCase()]
    });
  });

  // Add quick user filters
  users.slice(0, 10).forEach(user => {
    dynamicCommands.push({
      id: `user-${user.user_id}`,
      title: `Filter by @${user.user_id}`,
      subtitle: `Show tasks assigned to ${user.user_id}`,
      category: 'search',
      icon: User,
      action: () => handlers.filterByAssignee(user.user_id),
      badge: user.user_id,
      keywords: ['user', 'assignee', 'filter', user.user_id.toLowerCase()]
    });
  });

  // Add recent tasks for quick access (if task actions are available)
  if (handlers.editTask) {
    tasks.slice(0, 5).forEach(task => {
      dynamicCommands.push({
        id: `task-${task.id}`,
        title: task.title,
        subtitle: `Open task: ${task.title}`,
        category: 'recent',
        icon: Target,
        action: () => {
          // This would need to be implemented to open specific task
          toast.info(`Opening task: ${task.title}`);
        },
        badge: task.status,
        keywords: ['task', 'open', task.title.toLowerCase()]
      });
    });
  }

  return dynamicCommands;
}