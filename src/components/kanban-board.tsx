'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { 
  KanbanProvider, 
  KanbanBoard, 
  KanbanHeader, 
  KanbanCards, 
  KanbanCard,
  type DragEndEvent 
} from '@/components/ui/shadcn-io/kanban';
import { TaskCard } from './task-card';
import { AddTaskInput } from './add-task-input';
import { TaskDetailModal } from './task-detail-modal';
import { TaskSearchFilter } from './task-search-filter';
import { TagManager } from './tag-manager';
import { InviteUsers } from './invite-users';
import { ViewToggle, ViewMode } from './view-toggle';
import { TaskListView } from './task-list-view';
import { Button } from './ui/button';
import { Users, Hash } from 'lucide-react';

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
  updated_at?: string;
  workspace_id?: string;
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
  attachments?: Array<{
    id: string;
    file_name: string;
    file_url: string;
    uploaded_at: string;
  }>;
  _count?: {
    sub_tasks?: number;
    attachments?: number;
  };
  sub_tasks?: Array<{
    id: string;
    title: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    due_date?: string;
    created_at?: string;
    assignee?: {
      user_id: string;
    } | null;
  }>;
  [key: string]: unknown;
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

interface Column {
  id: string;
  name: string;
  [key: string]: unknown;
}

const columns: Column[] = [
  { id: 'TODO', name: 'To Do' },
  { id: 'IN_PROGRESS', name: 'In Progress' },
  { id: 'DONE', name: 'Done' },
];

export function KanbanBoardComponent() {
  const { getToken, userId, isLoaded } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TaskFilters>({});
  const [availableTags, setAvailableTags] = useState<Array<{ id: string; name: string; color: string; }>>([]);
  const [availableAssignees, setAvailableAssignees] = useState<Array<{ id: string; user_id: string; }>>([]);
  const [currentView, setCurrentView] = useState<ViewMode>('kanban');
  
  // Mock workspace data - replace with real data
  const workspaceId = 'default-workspace';
  const workspaceName = 'Personal Workspace';

  const fetchTasks = useCallback(async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const fetchedTasks = await response.json();
        const formattedTasks: Task[] = fetchedTasks.map((task: {
          id: string;
          title: string;
          description?: string;
          status: 'TODO' | 'IN_PROGRESS' | 'DONE';
          priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
          due_date?: string;
          start_date?: string;
          created_at?: string;
          updated_at?: string;
          assignee?: { user_id: string } | null;
          tags?: Array<{ tag: { id: string; name: string; color: string; } }>;
          attachments?: Array<{ id: string; file_name: string; file_url: string; uploaded_at: string; }>;
          _count?: { sub_tasks?: number; attachments?: number; };
        }) => ({
          id: task.id,
          name: task.title,
          column: task.status,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          due_date: task.due_date,
          start_date: task.start_date,
          created_at: task.created_at,
          updated_at: task.updated_at,
          assignee: task.assignee,
          tags: task.tags,
          attachments: task.attachments,
          _count: task._count,
        }));
        setTasks(formattedTasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    if (isLoaded && userId) {
      fetchTasks();
    }
  }, [isLoaded, userId, fetchTasks]);

  // Apply search and filters
  useEffect(() => {
    let filtered = [...tasks];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags?.some(({ tag }) => tag.name.toLowerCase().includes(query))
      );
    }

    // Apply filters
    if (filters.status?.length) {
      filtered = filtered.filter(task => filters.status!.includes(task.status));
    }
    if (filters.priority?.length) {
      filtered = filtered.filter(task => 
        task.priority !== 'NONE' && filters.priority!.includes(task.priority as 'LOW' | 'MEDIUM' | 'HIGH')
      );
    }
    if (filters.assignee?.length) {
      filtered = filtered.filter(task => 
        task.assignee && filters.assignee!.includes(task.assignee.user_id)
      );
    }
    if (filters.tags?.length) {
      filtered = filtered.filter(task => 
        task.tags?.some(({ tag }) => filters.tags!.includes(tag.id))
      );
    }
    if (filters.dateRange?.from || filters.dateRange?.to) {
      filtered = filtered.filter(task => {
        if (!task.due_date) return false;
        const taskDate = new Date(task.due_date);
        if (filters.dateRange?.from && taskDate < new Date(filters.dateRange.from)) return false;
        if (filters.dateRange?.to && taskDate > new Date(filters.dateRange.to)) return false;
        return true;
      });
    }

    setFilteredTasks(filtered);
  }, [tasks, searchQuery, filters]);

  // Extract available tags and assignees from tasks
  useEffect(() => {
    const tags = new Map<string, { id: string; name: string; color: string; }>();
    const assignees = new Map<string, { id: string; user_id: string; }>();

    tasks.forEach(task => {
      task.tags?.forEach(({ tag }) => {
        tags.set(tag.id, tag);
      });
      if (task.assignee) {
        assignees.set(task.assignee.user_id, {
          id: task.assignee.user_id,
          user_id: task.assignee.user_id
        });
      }
    });

    setAvailableTags(Array.from(tags.values()));
    setAvailableAssignees(Array.from(assignees.values()));
  }, [tasks]);


  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSave = async (updatedTask: any) => {
    try {
      const token = await getToken();
      const response = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedTask),
      });

      if (response.ok) {
        const updated = await response.json();
        const formattedTask: Task = {
          id: updated.id,
          name: updated.title,
          column: updated.status,
          title: updated.title,
          description: updated.description,
          status: updated.status,
          priority: updated.priority,
          due_date: updated.due_date,
          start_date: updated.start_date,
          created_at: updated.created_at,
          updated_at: updated.updated_at,
          assignee: updated.assignee,
          tags: updated.tags,
          attachments: updated.attachments,
          _count: updated._count,
        };
        
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === updatedTask.id ? formattedTask : task
          )
        );
        setSelectedTask(formattedTask);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: TaskFilters) => {
    setFilters(newFilters);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find(task => task.id === active.id);
    if (!activeTask) return;

    // Check if dropped on a column or another task
    let newStatus: string;
    const overColumn = columns.find(col => col.id === over.id);
    
    if (overColumn) {
      // Dropped on a column
      newStatus = overColumn.id;
    } else {
      // Dropped on another task, find which column that task belongs to
      const overTask = tasks.find(task => task.id === over.id);
      newStatus = overTask?.status || activeTask.status;
    }

    if (activeTask.status !== newStatus) {
      // Optimistically update UI first
      const updatedTasks = tasks.map(task => 
        task.id === activeTask.id 
          ? { ...task, status: newStatus as Task['status'], column: newStatus }
          : task
      );
      setTasks(updatedTasks);

      try {
        const token = await getToken();
        const response = await fetch(`/api/tasks/${activeTask.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        });

        if (!response.ok) {
          // Revert on error
          setTasks(tasks);
          console.error('Failed to update task status');
        }
      } catch (error) {
        // Revert on error  
        setTasks(tasks);
        console.error('Error updating task status:', error);
      }
    }
  };

  const handleTaskCreate = async (taskData: {
    title: string;
    description?: string;
    priority?: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
    due_date?: string;
    start_date?: string;
  }) => {
    try {
      const token = await getToken();
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...taskData,
          status: 'TODO',
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        const formattedTask: Task = {
          id: newTask.id,
          name: newTask.title,
          column: newTask.status,
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          priority: newTask.priority,
          due_date: newTask.due_date,
          start_date: newTask.start_date,
          created_at: newTask.created_at,
          updated_at: newTask.updated_at,
          assignee: newTask.assignee,
          tags: newTask.tags,
          attachments: newTask.attachments,
          _count: newTask._count,
        };
        setTasks([...tasks, formattedTask]);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Please sign in.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="h-full space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-3">
          <TagManager workspaceId={workspaceId} trigger={
            <Button variant="outline" size="sm">
              <Hash className="w-4 h-4" />
            </Button>
          } />
          <InviteUsers 
            workspaceId={workspaceId} 
            workspaceName={workspaceName}
            trigger={
              <Button variant="outline" size="sm">
                <Users className="w-4 h-4" />
              </Button>
            }
          />
        </div>
        
        <div className="flex items-center gap-3">
          <ViewToggle view={currentView} onViewChange={setCurrentView} />
          <TaskSearchFilter
            onSearch={handleSearch}
            onFilter={handleFilter}
            availableTags={availableTags}
            availableAssignees={availableAssignees}
            className="flex-1 lg:flex-none"
          />
        </div>
      </div>

      

      {/* Content Area */}
      {currentView === 'kanban' ? (
        <KanbanProvider
          columns={columns}
          data={filteredTasks}
          onDragEnd={handleDragEnd}
          className="min-h-[600px]"
        >
          {(column) => (
            <KanbanBoard key={column.id} id={column.id}>
              <KanbanHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">{column.name}</span>
                    <span className="bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium px-2 py-1 rounded-full border dark:border-gray-600">
                      {filteredTasks.filter(task => task.column === column.id).length}
                    </span>
                  </div>
                  
                  {searchQuery || Object.keys(filters).some(key => {
                    const value = filters[key as keyof TaskFilters];
                    return Array.isArray(value) ? value.length > 0 : !!value;
                  }) ? (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {tasks.filter(task => task.column === column.id).length} total
                    </div>
                  ) : null}
                </div>
              </KanbanHeader>
              <KanbanCards id={column.id} className="p-4 space-y-3">
                {(task) => (
                  <KanbanCard key={task.id} id={task.id} name={task.name} column={task.column}>
                    <TaskCard 
                      task={task as Task} 
                      onClick={() => handleTaskClick(task as Task)}
                      className="w-full"
                    />
                  </KanbanCard>
                )}
              </KanbanCards>
              {column.id === 'TODO' && (
                <div className="p-4">
                  <AddTaskInput 
                    onTaskCreate={handleTaskCreate} 
                    availableTags={availableTags}
                  />
                </div>
              )}
            </KanbanBoard>
          )}
        </KanbanProvider>
      ) : (
        <TaskListView 
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
          onTaskCreate={handleTaskCreate}
          availableTags={availableTags}
          onTaskUpdate={async (taskId: string, updates: Partial<Task>) => {
            try {
              const token = await getToken();
              const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
              });

              if (response.ok) {
                const updated = await response.json();
                const formattedTask: Task = {
                  id: updated.id,
                  name: updated.title,
                  column: updated.status,
                  title: updated.title,
                  description: updated.description,
                  status: updated.status,
                  priority: updated.priority,
                  due_date: updated.due_date,
                  start_date: updated.start_date,
                  created_at: updated.created_at,
                  updated_at: updated.updated_at,
                  assignee: updated.assignee,
                  tags: updated.tags,
                  attachments: updated.attachments,
                  _count: updated._count,
                };
                
                setTasks(prevTasks => 
                  prevTasks.map(task => 
                    task.id === taskId ? formattedTask : task
                  )
                );
              }
            } catch (error) {
              console.error('Error updating task:', error);
            }
          }}
        />
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        open={isTaskModalOpen}
        onOpenChange={setIsTaskModalOpen}
        onSave={handleTaskSave}
      />
    </div>
  );
}

export type { Task, TaskFilters };