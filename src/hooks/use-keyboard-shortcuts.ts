"use client";

import { useEffect, useCallback, useState } from 'react';
import { toast } from 'sonner';

interface KeyboardShortcut {
  key: string;
  description: string;
  action: () => void;
  category: 'global' | 'navigation' | 'task' | 'view';
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  disabled?: boolean;
}

interface UseKeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Ignore shortcuts when user is typing in inputs, textareas, or content editable elements
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.closest('[contenteditable="true"]')
    ) {
      // Allow some global shortcuts even when typing
      const allowedKeys = ['Escape'];
      if (!allowedKeys.includes(event.key)) {
        return;
      }
    }

    // Special handling for help toggle
    if (event.key === '?' && !event.metaKey && !event.ctrlKey) {
      event.preventDefault();
      setShowHelp(prev => !prev);
      return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcuts.find(shortcut => {
      if (shortcut.disabled) return false;
      
      const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const metaMatches = !!shortcut.metaKey === (event.metaKey || event.ctrlKey);
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
      const altMatches = !!shortcut.altKey === event.altKey;
      
      return keyMatches && metaMatches && shiftMatches && altMatches;
    });

    if (matchingShortcut) {
      event.preventDefault();
      event.stopPropagation();
      
      try {
        matchingShortcut.action();
        
        // Show toast notification for the action (optional)
        if (matchingShortcut.description) {
          toast.success(matchingShortcut.description);
        }
      } catch (error) {
        console.error('Keyboard shortcut error:', error);
        toast.error('Shortcut action failed');
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, enabled]);

  const getShortcutsByCategory = useCallback(() => {
    const categories = shortcuts.reduce((acc, shortcut) => {
      if (shortcut.disabled) return acc;
      
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    }, {} as Record<string, KeyboardShortcut[]>);

    return categories;
  }, [shortcuts]);

  const formatShortcutKey = useCallback((shortcut: KeyboardShortcut) => {
    const parts: string[] = [];
    
    if (shortcut.metaKey) {
      parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
    }
    if (shortcut.altKey) {
      parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
    }
    if (shortcut.shiftKey) {
      parts.push('⇧');
    }
    
    // Format key display
    let keyDisplay = shortcut.key;
    switch (shortcut.key.toLowerCase()) {
      case ' ':
        keyDisplay = 'Space';
        break;
      case 'escape':
        keyDisplay = 'Esc';
        break;
      case 'arrowup':
        keyDisplay = '↑';
        break;
      case 'arrowdown':
        keyDisplay = '↓';
        break;
      case 'arrowleft':
        keyDisplay = '←';
        break;
      case 'arrowright':
        keyDisplay = '→';
        break;
      case 'enter':
        keyDisplay = '⏎';
        break;
      case 'tab':
        keyDisplay = '⇥';
        break;
      default:
        keyDisplay = shortcut.key.toUpperCase();
    }
    
    parts.push(keyDisplay);
    return parts.join(' + ');
  }, []);

  return {
    showHelp,
    setShowHelp,
    shortcuts,
    getShortcutsByCategory,
    formatShortcutKey,
  };
}

// Predefined shortcut configurations
export const createGlobalShortcuts = (handlers: {
  onCreateTask: () => void;
  onSearch: () => void;
  onCommandPalette: () => void;
  onShowHelp: () => void;
  onCloseModal: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}): KeyboardShortcut[] => [
  {
    key: 'n',
    metaKey: true,
    description: 'Create new task',
    action: handlers.onCreateTask,
    category: 'global',
  },
  {
    key: 'k',
    metaKey: true,
    description: 'Open command palette',
    action: handlers.onCommandPalette,
    category: 'global',
  },
  {
    key: 'f',
    metaKey: true,
    description: 'Focus search',
    action: handlers.onSearch,
    category: 'global',
  },
  {
    key: '/',
    metaKey: true,
    description: 'Show keyboard shortcuts',
    action: handlers.onShowHelp,
    category: 'global',
  },
  {
    key: 'Escape',
    description: 'Close modal/dialog',
    action: handlers.onCloseModal,
    category: 'global',
  },
  ...(handlers.onUndo ? [{
    key: 'z',
    metaKey: true,
    description: 'Undo',
    action: handlers.onUndo,
    category: 'global' as const,
  }] : []),
  ...(handlers.onRedo ? [{
    key: 'z',
    metaKey: true,
    shiftKey: true,
    description: 'Redo',
    action: handlers.onRedo,
    category: 'global' as const,
  }] : []),
];

export const createTaskNavigationShortcuts = (handlers: {
  onNavigateUp: () => void;
  onNavigateDown: () => void;
  onOpenTask: () => void;
  onToggleStatus: () => void;
  onEditTask: () => void;
  onDeleteTask: () => void;
  onAssignToMe: () => void;
}): KeyboardShortcut[] => [
  {
    key: 'j',
    description: 'Navigate down',
    action: handlers.onNavigateDown,
    category: 'navigation',
  },
  {
    key: 'k',
    description: 'Navigate up',
    action: handlers.onNavigateUp,
    category: 'navigation',
  },
  {
    key: 'Enter',
    description: 'Open selected task',
    action: handlers.onOpenTask,
    category: 'navigation',
  },
  {
    key: 't',
    description: 'Toggle task status',
    action: handlers.onToggleStatus,
    category: 'task',
  },
  {
    key: 'e',
    description: 'Edit task',
    action: handlers.onEditTask,
    category: 'task',
  },
  {
    key: 'd',
    description: 'Delete task',
    action: handlers.onDeleteTask,
    category: 'task',
  },
  {
    key: 'a',
    description: 'Assign to me',
    action: handlers.onAssignToMe,
    category: 'task',
  },
];

export const createViewShortcuts = (handlers: {
  onKanbanView: () => void;
  onListView: () => void;
  onNextColumn?: () => void;
  onPreviousColumn?: () => void;
}): KeyboardShortcut[] => [
  {
    key: '1',
    description: 'Switch to Kanban view',
    action: handlers.onKanbanView,
    category: 'view',
  },
  {
    key: '2',
    description: 'Switch to List view',
    action: handlers.onListView,
    category: 'view',
  },
  ...(handlers.onNextColumn ? [{
    key: 'Tab',
    description: 'Next column',
    action: handlers.onNextColumn,
    category: 'view' as const,
  }] : []),
  ...(handlers.onPreviousColumn ? [{
    key: 'Tab',
    shiftKey: true,
    description: 'Previous column',
    action: handlers.onPreviousColumn,
    category: 'view' as const,
  }] : []),
];