import React, { useEffect, useRef, useState } from 'react';
import { Copy, Trash2, Layers, ArrowUp, ArrowDown, Lock, Eye, EyeOff, Maximize2, Minimize2, Image, Sparkles } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onCopy?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onLock?: () => void;
  onHide?: () => void;
  onExpand?: () => void;
  onImage?: () => void; // Для сцены - открыть выбор фона
  onAI?: () => void; // Для сцены - AI подбор картинки
  isLocked?: boolean;
  isHidden?: boolean;
  isExpanded?: boolean;
  isDeleteDisabled?: boolean; // Отключить кнопку удаления
}

export const ContextMenu = ({
  x,
  y,
  onClose,
  onCopy,
  onDelete,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onLock,
  onHide,
  onExpand,
  onImage,
  onAI,
  isLocked = false,
  isHidden = false,
  isExpanded = false,
  isDeleteDisabled = false,
}: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    // Корректируем позицию, чтобы меню не выходило за границы экрана
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = x;
      let newY = y;

      if (x + rect.width > viewportWidth) {
        newX = viewportWidth - rect.width - 8;
      }
      if (y + rect.height > viewportHeight) {
        newY = viewportHeight - rect.height - 8;
      }
      if (newX < 8) newX = 8;
      if (newY < 8) newY = 8;

      setPosition({ x: newX, y: newY });
    }

    // Закрываем меню при клике вне его
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Закрываем меню при нажатии Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [x, y, onClose]);

  const menuItems = [
    // Для сцены - специальные пункты
    ...(onImage ? [{
      label: 'Изображение',
      icon: Image,
      onClick: onImage,
    }] : []),
    ...(onDuplicate ? [{
      label: 'Дублировать',
      icon: Copy,
      shortcut: '⌘D',
      onClick: onDuplicate,
    }] : []),
    ...(onAI ? [{
      label: 'AI',
      icon: Sparkles,
      onClick: onAI,
    }] : []),
    ...(onImage || onDuplicate || onAI ? [{ type: 'separator' as const }] : []),
    // Для объектов на сцене
    ...(onExpand ? [{
      label: isExpanded ? 'Свернуть' : 'Развернуть',
      icon: isExpanded ? Minimize2 : Maximize2,
      shortcut: '⏎',
      onClick: onExpand,
    }] : []),
    ...(onExpand ? [{ type: 'separator' as const }] : []),
    ...(onCopy ? [{
      label: 'Копировать',
      icon: Copy,
      shortcut: '⌘C',
      onClick: onCopy,
    }] : []),
    ...(onCopy || onDuplicate ? [{ type: 'separator' as const }] : []),
    ...(onBringToFront ? [{
      label: 'На передний план',
      icon: ArrowUp,
      shortcut: ']',
      onClick: onBringToFront,
    }] : []),
    ...(onSendToBack ? [{
      label: 'На задний план',
      icon: ArrowDown,
      shortcut: '[',
      onClick: onSendToBack,
    }] : []),
    ...(onBringToFront || onSendToBack ? [{ type: 'separator' as const }] : []),
    ...(onLock ? [{
      label: isLocked ? 'Разблокировать' : 'Заблокировать',
      icon: Lock,
      shortcut: '⇧⌘L',
      onClick: onLock,
    }] : []),
    ...(onHide ? [{
      label: isHidden ? 'Показать' : 'Скрыть',
      icon: isHidden ? Eye : EyeOff,
      shortcut: '⇧⌘H',
      onClick: onHide,
    }] : []),
    ...(onLock || onHide ? [{ type: 'separator' as const }] : []),
    ...(onDelete ? [{
      label: 'Удалить',
      icon: Trash2,
      shortcut: '⌫',
      onClick: onDelete,
      danger: true,
      disabled: isDeleteDisabled,
    }] : []),
  ].filter(Boolean);

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-[#1a1a1a] border border-border rounded-lg shadow-xl py-1 min-w-[200px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {menuItems.map((item, index) => {
        if (item.type === 'separator') {
          return <div key={`separator-${index}`} className="h-px bg-border my-1" />;
        }

        const Icon = item.icon;
        const isDisabled = item.disabled || false;
        return (
          <button
            key={index}
            onClick={() => {
              if (!isDisabled) {
                item.onClick();
                onClose();
              }
            }}
            disabled={isDisabled}
            className={`w-full px-3 py-2 text-left text-sm flex items-center justify-between transition-colors ${
              isDisabled 
                ? 'text-gray-500 cursor-not-allowed opacity-50' 
                : item.danger 
                  ? 'text-red-400 hover:text-red-300 hover:bg-[#2a2a2a]' 
                  : 'text-white hover:bg-[#2a2a2a]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon size={16} />
              <span>{item.label}</span>
            </div>
            {item.shortcut && (
              <span className="text-xs text-text-muted ml-4">{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

