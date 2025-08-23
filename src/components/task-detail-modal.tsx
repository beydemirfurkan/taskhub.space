"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileDropzone } from '@/components/file-dropzone';
import { ImagePreview, ImageThumbnailGrid } from '@/components/image-preview';
import { 
  Calendar, 
  Clock, 
  User, 
  Flag, 
  Paperclip, 
  Edit3, 
  Save, 
  X,
  Hash,
  Download,
  Trash2,
  Plus,
  Target,
  CheckCircle2,
  Circle,
  Timer,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  Eye,
  Search
} from 'lucide-react';

interface TaskDetailModalProps {
  task: {
    id: string;
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
      description?: string;
      status: 'TODO' | 'IN_PROGRESS' | 'DONE';
      priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
      due_date?: string;
      created_at?: string;
      assignee?: {
        user_id: string;
      } | null;
    }>;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedTask: any) => void;
}

const priorityConfig = {
  NONE: { label: 'None', color: 'bg-gray-100 text-gray-700' },
  LOW: { label: 'Low', color: 'bg-emerald-100 text-emerald-700' },
  MEDIUM: { label: 'Medium', color: 'bg-amber-100 text-amber-700' },
  HIGH: { label: 'High', color: 'bg-red-100 text-red-700' },
};

const statusConfig = {
  TODO: { label: 'To Do', color: 'bg-slate-100 text-slate-700' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
  DONE: { label: 'Done', color: 'bg-green-100 text-green-700' },
};

export function TaskDetailModal({ task, open, onOpenChange, onSave }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [showAddSubtask, setShowAddSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  // const [isUploading, setIsUploading] = useState(false);

  if (!task) return null;

  const handleSave = () => {
    if (onSave && editedTask) {
      onSave(editedTask);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim() || !task) return;
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSubtaskTitle,
          parent_id: task.id,
          workspace_id: task.workspace_id,
          status: 'TODO',
          priority: 'NONE'
        })
      });
      
      if (response.ok) {
        const newSubtask = await response.json();
        
        // Update local task state with the new subtask
        setEditedTask(prev => {
          if (!prev) return prev;
          const updatedTask = {
            ...prev,
            sub_tasks: [...(prev.sub_tasks || []), newSubtask],
            _count: {
              ...prev._count,
              sub_tasks: (prev._count?.sub_tasks || 0) + 1
            }
          };
          return updatedTask;
        });
        
        // Reset form
        setNewSubtaskTitle('');
        setShowAddSubtask(false);
        
        // Call onSave to notify parent component of changes (if provided)
        if (onSave) {
          const updatedTask = {
            ...task,
            sub_tasks: [...(task.sub_tasks || []), newSubtask],
            _count: {
              ...task._count,
              sub_tasks: (task._count?.sub_tasks || 0) + 1
            }
          };
          onSave(updatedTask);
        }
      }
    } catch (error) {
      console.error('Failed to create subtask:', error);
    }
  };

  const handleSubtaskStatusChange = async (subtaskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    try {
      const response = await fetch(`/api/tasks/${subtaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        // Update local task state with the updated subtask status
        setEditedTask(prev => {
          if (!prev || !prev.sub_tasks) return prev;
          const updatedSubtasks = prev.sub_tasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, status: newStatus }
              : subtask
          );
          return {
            ...prev,
            sub_tasks: updatedSubtasks
          };
        });
        
        // Call onSave to notify parent component of changes (if provided)
        if (onSave && task.sub_tasks) {
          const updatedSubtasks = task.sub_tasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, status: newStatus }
              : subtask
          );
          const updatedTask = {
            ...task,
            sub_tasks: updatedSubtasks
          };
          onSave(updatedTask);
        }
      }
    } catch (error) {
      console.error('Failed to update subtask:', error);
    }
  };

  const getSubtaskProgress = () => {
    const currentTask = editedTask || task;
    if (!currentTask?.sub_tasks || currentTask.sub_tasks.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = currentTask.sub_tasks.filter(st => st.status === 'DONE').length;
    const total = currentTask.sub_tasks.length;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  };

  const subtaskProgress = getSubtaskProgress();

  // File management helpers
  const isImageFile = (fileName: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const getImageFiles = () => {
    if (!task?.attachments) return [];
    return task.attachments.filter(file => isImageFile(file.file_name));
  };

  const getDocumentFiles = () => {
    if (!task?.attachments) return [];
    return task.attachments.filter(file => !isImageFile(file.file_name));
  };

  const getFilteredFiles = (files: typeof task.attachments) => {
    if (!fileSearchQuery || !files) return files;
    return files.filter(file => 
      file.file_name.toLowerCase().includes(fileSearchQuery.toLowerCase())
    );
  };

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setShowImagePreview(true);
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Keep dialog open and notify parent if callback provided
        if (onSave) {
          const updatedAttachments = (task.attachments || []).filter(att => att.id !== attachmentId);
          const updatedTask = {
            ...task,
            attachments: updatedAttachments,
            _count: {
              ...task._count,
              attachments: Math.max(0, (task._count?.attachments || 1) - 1)
            }
          };
          onSave(updatedTask);
        }
      }
    } catch (error) {
      console.error('Failed to delete attachment:', error);
    }
  };

  const imageFiles = getImageFiles();
  const documentFiles = getDocumentFiles();
  const filteredImageFiles = getFilteredFiles(imageFiles);
  const filteredDocumentFiles = getFilteredFiles(documentFiles);

  // const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0];
  //   if (!file) return;

  //   setIsUploading(true);
  //   const formData = new FormData();
  //   formData.append('file', file);
  //   formData.append('taskId', task.id);

  //   try {
  //     const response = await fetch('/api/upload', {
  //       method: 'POST',
  //       body: formData,
  //     });

  //     if (response.ok) {
  //       const result = await response.json();
  //       // Refresh task data or add to attachments list
  //       console.log('File uploaded:', result);
  //     }
  //   } catch (error) {
  //     console.error('Upload failed:', error);
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-6xl !w-full max-h-[95vh] overflow-hidden p-0">
        <DialogTitle className="sr-only">Task Details</DialogTitle>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editedTask?.title || ''}
                onChange={(e) => setEditedTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                className="text-xl font-semibold border-0 bg-transparent p-0 focus:ring-0"
                placeholder="Task title..."
              />
            ) : (
              <h1 className="text-xl font-semibold text-gray-900">{task.title}</h1>
            )}
            
            {/* Status and Priority Badges */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <Badge className={statusConfig[task.status].color}>
                  {statusConfig[task.status].label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">Priority:</span>
                <Badge className={priorityConfig[task.priority].color}>
                  {priorityConfig[task.priority].label}
                </Badge>
              </div>

              {/* Subtask Progress */}
              {subtaskProgress.total > 0 && (
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-500">
                    {subtaskProgress.completed}/{subtaskProgress.total} subtasks
                  </span>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${subtaskProgress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel} size="sm">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm">
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)} size="sm">
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* Main Content - Single Column Layout */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)] space-y-8">
            
            {/* Description Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900">Description</h3>
              </div>
              {isEditing ? (
                <Textarea
                  value={editedTask?.description || ''}
                  onChange={(e) => setEditedTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                  placeholder="Add detailed information about this task..."
                  className="min-h-32 text-base"
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 min-h-32">
                  <p className="text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {task.description || (
                      <span className="text-gray-400 italic">No description added yet.</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Subtasks Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-500" />
                  <h3 className="text-lg font-semibold text-gray-900">Subtasks</h3>
                  <Badge variant="secondary" className="ml-2">
                    {subtaskProgress.completed}/{subtaskProgress.total}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddSubtask(true)}
                    className="h-8"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Subtask
                  </Button>
                  {(editedTask || task)?.sub_tasks && (editedTask || task)!.sub_tasks!.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowSubtasks(!showSubtasks)}
                      className="h-8 px-2"
                    >
                      {showSubtasks ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Add Subtask Form */}
              {showAddSubtask && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="space-y-3">
                    <Input
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Enter subtask title..."
                      className="bg-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSubtask();
                        }
                        if (e.key === 'Escape') {
                          setShowAddSubtask(false);
                          setNewSubtaskTitle('');
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setShowAddSubtask(false);
                          setNewSubtaskTitle('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleAddSubtask} disabled={!newSubtaskTitle.trim()}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Subtask List */}
              {showSubtasks && (editedTask || task)?.sub_tasks && (editedTask || task)!.sub_tasks!.length > 0 && (
                <div className="space-y-3">
                  {((editedTask || task)?.sub_tasks || []).map((subtask) => {
                    const StatusIcon = subtask.status === 'DONE' ? CheckCircle2 : 
                                     subtask.status === 'IN_PROGRESS' ? Timer : Circle;
                    const statusColor = subtask.status === 'DONE' ? 'text-green-600' : 
                                      subtask.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-gray-400';
                    
                    return (
                      <div key={subtask.id} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <button
                          onClick={() => {
                            const nextStatus = subtask.status === 'TODO' ? 'IN_PROGRESS' : 
                                             subtask.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
                            handleSubtaskStatusChange(subtask.id, nextStatus);
                          }}
                          className="shrink-0 mt-0.5"
                        >
                          <StatusIcon className={`w-5 h-5 ${statusColor} hover:scale-110 transition-transform`} />
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className={`text-base font-medium ${subtask.status === 'DONE' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {subtask.title}
                          </div>
                          {subtask.description && (
                            <div className="text-sm text-gray-600 mt-1">
                              {subtask.description}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-3 mt-2">
                            {subtask.priority !== 'NONE' && (
                              <Badge className={priorityConfig[subtask.priority].color}>
                                {priorityConfig[subtask.priority].label}
                              </Badge>
                            )}
                            {subtask.assignee && (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600">{subtask.assignee.user_id}</span>
                              </div>
                            )}
                            {subtask.due_date && (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-600">
                                  {new Date(subtask.due_date).toLocaleDateString('en-US')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Empty state */}
              {(!(editedTask || task)?.sub_tasks || (editedTask || task)!.sub_tasks!.length === 0) && !showAddSubtask && (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Target className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-base font-medium">No subtasks yet</p>
                  <p className="text-sm mt-1">You can break this task into smaller parts</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowAddSubtask(true)}
                    className="mt-3"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    First Subtask
                  </Button>
                </div>
              )}
            </div>

            {/* Task Info and Meta Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Task Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-500" />
                  Task Information
                </h3>

              {/* Assignee */}
              {task.assignee && (
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Assignee</div>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                          {task.assignee.user_id.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-900">
                        {task.assignee.user_id}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dates */}
              {(task.due_date || task.start_date) && (
                <div className="space-y-3">
                  {task.start_date && (
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Start Date</div>
                        <div className="text-sm text-gray-900">
                          {new Date(task.start_date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {task.due_date && (
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">Due Date</div>
                        <div className="text-sm text-gray-900">
                          {new Date(task.due_date).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags Section */}
            {task.tags && task.tags.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Hash className="w-5 h-5 text-gray-500" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {task.tags.map(({ tag }) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border"
                      style={{ 
                        backgroundColor: tag.color ? `${tag.color}20` : '#f3f4f6',
                        color: tag.color || '#374151',
                        borderColor: tag.color ? `${tag.color}40` : '#d1d5db'
                      }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Files & Attachments Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-gray-500" />
Files
                <Badge variant="secondary" className="ml-2">
                  {task.attachments?.length || 0}
                </Badge>
              </h3>

              {/* File Upload Zone */}
              <FileDropzone
                taskId={task.id}
                onFileUploaded={(uploadedFile) => {
                  console.log('File uploaded successfully:', uploadedFile);
                  // Keep dialog open and notify parent if callback provided
                  if (onSave) {
                    // Create updated task with new attachment (simplified)
                    const newAttachment = {
                      id: Date.now().toString(), // Temporary ID
                      file_name: uploadedFile.fileName,
                      file_url: uploadedFile.fileUrl,
                      uploaded_at: new Date().toISOString()
                    };
                    
                    const updatedTask = {
                      ...task,
                      attachments: [...(task.attachments || []), newAttachment],
                      _count: {
                        ...task._count,
                        attachments: (task._count?.attachments || 0) + 1
                      }
                    };
                    onSave(updatedTask);
                  }
                }}
                className="border-dashed border-gray-300"
              />

              {/* Files Search */}
              {task.attachments && task.attachments.length > 3 && (
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search files..."
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}

              {/* Image Gallery */}
              {filteredImageFiles && filteredImageFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-base font-medium text-gray-700">Images</span>
                    <Badge variant="outline">{filteredImageFiles.length}</Badge>
                  </div>
                  
                  <ImageThumbnailGrid
                    images={filteredImageFiles.map(file => ({
                      id: file.id,
                      file_name: file.file_name,
                      file_url: file.file_url,
                      uploaded_at: file.uploaded_at
                    }))}
                    onImageClick={handleImageClick}
                    className="max-h-64 overflow-y-auto"
                  />
                </div>
              )}

              {/* Document Files */}
              {filteredDocumentFiles && filteredDocumentFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-500" />
                    <span className="text-base font-medium text-gray-700">Documents</span>
                    <Badge variant="outline">{filteredDocumentFiles.length}</Badge>
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredDocumentFiles.map((file) => {
                      const fileExtension = file.file_name.split('.').pop()?.toLowerCase();
                      const isPDF = fileExtension === 'pdf';
                      
                      return (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0">
                              {isPDF ? (
                                <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                                  <span className="text-xs font-bold text-red-600">PDF</span>
                                </div>
                              ) : (
                                <FileText className="w-5 h-5 text-gray-500" />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm text-gray-900 font-medium truncate" title={file.file_name}>
                                {file.file_name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(file.uploaded_at).toLocaleDateString('en-US')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {isPDF && (
                              <Button size="sm" variant="ghost" asChild>
                                <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                  <Eye className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" asChild>
                              <a href={file.file_url} download target="_blank" rel="noopener noreferrer">
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleDeleteAttachment(file.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!task.attachments || task.attachments.length === 0) && (
                <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Paperclip className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-base font-medium">No files added yet</p>
                  <p className="text-sm mt-1">Use the upload area above to add files</p>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
Timestamps
              </h3>
              
              <div className="space-y-2 text-sm text-gray-600">
                {task.created_at && (
                  <div className="flex justify-between">
                    <span>Created:</span>
                    <span>{new Date(task.created_at).toLocaleDateString('en-US', { 
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                )}
                {task.updated_at && (
                  <div className="flex justify-between">
                    <span>Last updated:</span>
                    <span>{new Date(task.updated_at).toLocaleDateString('en-US', { 
                      day: 'numeric',
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Image Preview Modal */}
        {imageFiles.length > 0 && (
          <ImagePreview
            images={imageFiles.map(file => ({
              id: file.id,
              file_name: file.file_name,
              file_url: file.file_url,
              uploaded_at: file.uploaded_at
            }))}
            currentIndex={currentImageIndex}
            onIndexChange={setCurrentImageIndex}
            open={showImagePreview}
            onOpenChange={setShowImagePreview}
            onDelete={handleDeleteAttachment}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}