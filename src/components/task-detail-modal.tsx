"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FileDropzone } from '@/components/file-dropzone';
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
  Trash2
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
    created_at: string;
    updated_at: string;
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
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (updatedTask: {
    id: string;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    due_date?: string;
    start_date?: string;
    created_at: string;
    updated_at: string;
    assignee?: { user_id: string; } | null;
    tags?: Array<{ tag: { id: string; name: string; color: string; } }>;
    attachments?: Array<{ id: string; file_name: string; file_url: string; uploaded_at: string; }>;
    _count?: { sub_tasks?: number; attachments?: number; };
  }) => void;
}

const priorityConfig = {
  NONE: { label: 'Yok', color: 'bg-gray-100 text-gray-700' },
  LOW: { label: 'Düşük', color: 'bg-emerald-100 text-emerald-700' },
  MEDIUM: { label: 'Orta', color: 'bg-amber-100 text-amber-700' },
  HIGH: { label: 'Yüksek', color: 'bg-red-100 text-red-700' },
};

const statusConfig = {
  TODO: { label: 'Yapılacak', color: 'bg-slate-100 text-slate-700' },
  IN_PROGRESS: { label: 'Devam Ediyor', color: 'bg-blue-100 text-blue-700' },
  DONE: { label: 'Tamamlandı', color: 'bg-green-100 text-green-700' },
};

export function TaskDetailModal({ task, open, onOpenChange, onSave }: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            {isEditing ? (
              <Input
                value={editedTask?.title || ''}
                onChange={(e) => setEditedTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                className="text-lg font-semibold"
              />
            ) : (
              <DialogTitle className="text-lg font-semibold">{task.title}</DialogTitle>
            )}
            
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="w-4 h-4 mr-1" />
                    Kaydet
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit3 className="w-4 h-4 mr-1" />
                  Düzenle
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Priority */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Durum:</span>
              <Badge className={statusConfig[task.status].color}>
                {statusConfig[task.status].label}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Flag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Öncelik:</span>
              <Badge className={priorityConfig[task.priority].color}>
                {priorityConfig[task.priority].label}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Açıklama</label>
            {isEditing ? (
              <Textarea
                value={editedTask?.description || ''}
                onChange={(e) => setEditedTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                placeholder="Görev açıklaması..."
                className="min-h-24"
              />
            ) : (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {task.description || 'Açıklama bulunmuyor.'}
              </p>
            )}
          </div>

          {/* Assignee and Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {task.assignee && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Atanan:</span>
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {task.assignee.user_id.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-600">{task.assignee.user_id}</span>
              </div>
            )}

            {task.due_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Bitiş:</span>
                <span className="text-sm text-gray-600">
                  {new Date(task.due_date).toLocaleDateString('tr-TR')}
                </span>
              </div>
            )}

            {task.start_date && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Başlangıç:</span>
                <span className="text-sm text-gray-600">
                  {new Date(task.start_date).toLocaleDateString('tr-TR')}
                </span>
              </div>
            )}
          </div>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Etiketler</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.tags.map(({ tag }) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
                    style={{ 
                      backgroundColor: tag.color ? `${tag.color}20` : '#f3f4f6',
                      color: tag.color || '#374151'
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Dosyalar ({task.attachments?.length || 0})
              </span>
            </div>

            {/* File Upload Zone */}
            <FileDropzone
              taskId={task.id}
              onFileUploaded={(file) => {
                // Update task attachments
                console.log('File uploaded:', file);
                // You can add logic here to refresh the task data
              }}
              className="border-dashed border-gray-300"
            />

            {/* Existing Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Mevcut Dosyalar</h4>
                {task.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Paperclip className="w-4 h-4 text-gray-500" />
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700 font-medium">{attachment.file_name}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(attachment.uploaded_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" asChild>
                        <a href={attachment.file_url} download target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          // Add delete logic here
                          console.log('Delete attachment:', attachment.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
            <div>Oluşturulma: {new Date(task.created_at).toLocaleString('tr-TR')}</div>
            <div>Son Güncelleme: {new Date(task.updated_at).toLocaleString('tr-TR')}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}