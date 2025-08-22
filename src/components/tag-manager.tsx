"use client";

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Hash, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Tag as TagIcon,
  Palette
} from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  color: string;
  _count?: {
    tasks: number;
  };
}

interface TagManagerProps {
  workspaceId: string;
  trigger?: React.ReactNode;
}

const predefinedColors = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
];

export function TagManager({ workspaceId, trigger }: TagManagerProps) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState({ name: '', color: '#3B82F6' });
  const [editingTag, setEditingTag] = useState({ name: '', color: '' });

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tags?workspaceId=${workspaceId}`);
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (open) {
      fetchTags();
    }
  }, [open, fetchTags]);

  const createTag = async () => {
    if (!newTag.name.trim()) return;

    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTag.name.trim(),
          color: newTag.color,
          workspace_id: workspaceId
        })
      });

      if (response.ok) {
        const createdTag = await response.json();
        setTags(prev => [...prev, createdTag]);
        setNewTag({ name: '', color: '#3B82F6' });
      }
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const updateTag = async (id: string) => {
    if (!editingTag.name.trim()) return;

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingTag.name.trim(),
          color: editingTag.color
        })
      });

      if (response.ok) {
        const updatedTag = await response.json();
        setTags(prev => prev.map(tag => 
          tag.id === id ? updatedTag : tag
        ));
        setEditingId(null);
        setEditingTag({ name: '', color: '' });
      }
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const deleteTag = async (id: string) => {
    if (!confirm('Bu etiketi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setTags(prev => prev.filter(tag => tag.id !== id));
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
  };

  const startEditing = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingTag({ name: tag.name, color: tag.color });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTag({ name: '', color: '' });
  };

  const ColorPicker = ({ color, onChange, disabled = false }: { 
    color: string; 
    onChange: (color: string) => void;
    disabled?: boolean;
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="w-8 h-8 p-0 border-2"
          style={{ backgroundColor: color }}
        >
          <Palette className="w-3 h-3 text-white" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48">
        <div className="grid grid-cols-4 gap-2">
          {predefinedColors.map((predefinedColor) => (
            <button
              key={predefinedColor}
              className="w-8 h-8 rounded-md border-2 hover:scale-110 transition-transform"
              style={{ backgroundColor: predefinedColor }}
              onClick={() => onChange(predefinedColor)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <TagIcon className="w-4 h-4 mr-2" />
            Etiketleri Yönet
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5" />
            Etiket Yönetimi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Tag */}
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900">Yeni Etiket</h3>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Etiket adı"
                value={newTag.name}
                onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && createTag()}
                className="flex-1"
              />
              <ColorPicker
                color={newTag.color}
                onChange={(color) => setNewTag(prev => ({ ...prev, color }))}
              />
              <Button size="sm" onClick={createTag} disabled={!newTag.name.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Existing Tags */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-900">
              Mevcut Etiketler ({tags.length})
            </h3>
            
            {loading ? (
              <div className="text-center py-4 text-sm text-gray-500">
                Yükleniyor...
              </div>
            ) : tags.length === 0 ? (
              <div className="text-center py-4 text-sm text-gray-500">
                Henüz etiket bulunmuyor
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center gap-2 p-2 border rounded-lg">
                    {editingId === tag.id ? (
                      <>
                        <Input
                          value={editingTag.name}
                          onChange={(e) => setEditingTag(prev => ({ ...prev, name: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && updateTag(tag.id)}
                          className="flex-1 h-7"
                          autoFocus
                        />
                        <ColorPicker
                          color={editingTag.color}
                          onChange={(color) => setEditingTag(prev => ({ ...prev, color }))}
                        />
                        <Button size="sm" variant="ghost" onClick={() => updateTag(tag.id)}>
                          <Save className="w-3 h-3 text-green-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={cancelEditing}>
                          <X className="w-3 h-3 text-gray-600" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Badge
                          className="flex-1 justify-start"
                          style={{ 
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                            border: `1px solid ${tag.color}30`
                          }}
                        >
                          {tag.name}
                          {tag._count && (
                            <span className="ml-2 text-xs opacity-70">
                              ({tag._count.tasks})
                            </span>
                          )}
                        </Badge>
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: tag.color }}
                        />
                        <Button size="sm" variant="ghost" onClick={() => startEditing(tag)}>
                          <Edit3 className="w-3 h-3 text-gray-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteTag(tag.id)}>
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}