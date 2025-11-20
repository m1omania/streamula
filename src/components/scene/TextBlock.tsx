import React, { useState, useRef, useEffect } from 'react';
import type { TextBlock } from '../../types';
import { X, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';
import { InlineToolbar } from './InlineToolbar';
import { ContextMenu } from './ContextMenu';

interface TextBlockComponentProps {
  textBlock: TextBlock;
  sceneId: number;
  onUpdate: (updates: Partial<TextBlock>) => void;
  onDelete: () => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onDuplicate?: () => void;
}

export const TextBlockComponent = ({ 
  textBlock, 
  sceneId, 
  onUpdate, 
  onDelete, 
  isEditing,
  onStartEdit,
  onStopEdit,
  onDuplicate
}: TextBlockComponentProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const [selection, setSelection] = useState<{ text: string; range: Range } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Автоматическое изменение высоты textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [textBlock.text]);

  // Отслеживание выделения текста
  const handleTextSelection = () => {
    if (!textareaRef.current || !isEditing) {
      setSelection(null);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start !== end && start >= 0 && end > start) {
      const text = textarea.value.substring(start, end);
      
      // Вычисляем позицию выделенного текста
      const textareaRect = textarea.getBoundingClientRect();
      
      // Создаем временный элемент для измерения позиции
      const tempDiv = document.createElement('div');
      const style = window.getComputedStyle(textarea);
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.whiteSpace = 'pre-wrap';
      tempDiv.style.font = style.font;
      tempDiv.style.fontSize = style.fontSize;
      tempDiv.style.fontFamily = style.fontFamily;
      tempDiv.style.padding = style.padding;
      tempDiv.style.border = style.border;
      tempDiv.style.width = `${textarea.offsetWidth}px`;
      tempDiv.style.wordWrap = 'break-word';
      tempDiv.style.lineHeight = style.lineHeight;
      
      // Разбиваем текст на части: до выделения, выделенный текст, после выделения
      const textBefore = textarea.value.substring(0, start);
      const textSelected = textarea.value.substring(start, end);
      const textAfter = textarea.value.substring(end);
      
      tempDiv.innerHTML = '';
      const beforeSpan = document.createElement('span');
      beforeSpan.textContent = textBefore;
      tempDiv.appendChild(beforeSpan);
      
      const selectionSpan = document.createElement('span');
      selectionSpan.textContent = textSelected;
      selectionSpan.style.backgroundColor = 'rgba(139, 92, 246, 0.3)';
      tempDiv.appendChild(selectionSpan);
      
      const afterSpan = document.createElement('span');
      afterSpan.textContent = textAfter;
      tempDiv.appendChild(afterSpan);
      
      document.body.appendChild(tempDiv);
      
      const selectionRect = selectionSpan.getBoundingClientRect();
      document.body.removeChild(tempDiv);

      setSelection({
        text,
        range: {
          getBoundingClientRect: () => ({
            top: selectionRect.top,
            left: selectionRect.left + (selectionRect.width / 2),
            right: selectionRect.right,
            bottom: selectionRect.bottom,
            width: selectionRect.width,
            height: selectionRect.height,
            x: selectionRect.x,
            y: selectionRect.y,
            toJSON: () => {},
          }),
        } as Range,
      });
    } else {
      setSelection(null);
    }
  };

  // Обработка форматирования из инлайн-панели
  const handleInlineFormat = (format: string, value?: any) => {
    if (format === 'bold') {
      onUpdate({ fontWeight: textBlock.fontWeight === 'bold' ? 'normal' : 'bold' });
    } else if (format === 'italic') {
      onUpdate({ fontWeight: textBlock.fontWeight === 'italic' ? 'normal' : 'italic' });
    } else if (format === 'align' && value) {
      onUpdate({ textAlign: value });
    } else if (format === 'fontSize') {
      // Можно открыть модалку для выбора размера
      const newSize = prompt('Размер шрифта:', textBlock.fontSize.toString());
      if (newSize) {
        const size = parseInt(newSize);
        if (size >= 12 && size <= 72) {
          onUpdate({ fontSize: size });
        }
      }
    } else if (format === 'link') {
      const url = prompt('Введите URL:', '');
      if (url) {
        // TODO: Добавить поддержку ссылок в тексте
        console.log('Add link:', url);
      }
    }
    setSelection(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('resize-handle')) {
      // Изменение размера
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      if (blockRef.current) {
        const rect = blockRef.current.getBoundingClientRect();
        setResizeStart({
          x: e.clientX,
          y: e.clientY,
          width: rect.width,
          height: rect.height,
        });
      }
    } else if (isEditing && !target.closest('textarea') && !target.closest('button') && !target.closest('input[type="color"]') && !target.closest('input[type="number"]')) {
      // Перемещение блока в режиме редактирования
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
      if (blockRef.current) {
        const rect = blockRef.current.getBoundingClientRect();
        const parent = blockRef.current.offsetParent as HTMLElement;
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          setDragStart({
            x: e.clientX,
            y: e.clientY,
            offsetX: rect.left - parentRect.left,
            offsetY: rect.top - parentRect.top,
          });
        }
      }
    }
  };

  useEffect(() => {
    if (!isResizing && !isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const newWidth = Math.max(100, resizeStart.width + deltaX);
        const newHeight = Math.max(50, resizeStart.height + deltaY);
        onUpdate({ width: newWidth, height: newHeight });
      } else if (isDragging) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        const newX = Math.max(0, dragStart.offsetX + deltaX);
        const newY = Math.max(0, dragStart.offsetY + deltaY);
        onUpdate({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, isDragging, resizeStart, dragStart, onUpdate]);

  return (
    <div
      ref={blockRef}
      className="absolute text-block-display z-30"
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        if (!isEditing && !isDragging && !(e.target as HTMLElement).classList.contains('resize-handle')) {
          e.stopPropagation();
          onStartEdit();
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
      }}
      style={{
        left: `${textBlock.x}px`,
        top: `${textBlock.y}px`,
        width: `${textBlock.width}px`,
        minHeight: `${textBlock.height}px`,
        cursor: isEditing ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
      }}
    >
      {isEditing ? (
        <div className="bg-[#1a1a1a] border border-accent-purple rounded-lg p-2 shadow-lg">
          {/* Toolbar */}
          <div className="flex items-center gap-1 mb-2 pb-2 border-b border-border">
            {/* Font Size */}
            <div className="flex items-center gap-1">
              <Type size={14} className="text-text-muted" />
              <input
                type="number"
                min="12"
                max="72"
                value={textBlock.fontSize}
                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value) || 16 })}
                className="w-12 px-1 py-0.5 bg-[#0f0f0f] border border-border rounded text-white text-xs"
              />
            </div>

            {/* Font Weight */}
            <button
              onClick={() => onUpdate({ fontWeight: textBlock.fontWeight === 'bold' ? 'normal' : 'bold' })}
              className={`p-1.5 rounded hover:bg-[#2a2a2a] transition-colors ${
                textBlock.fontWeight === 'bold' ? 'bg-[#2a2a2a] text-white' : 'text-text-muted'
              }`}
              title="Жирный"
            >
              <Bold size={14} />
            </button>

            {/* Italic */}
            <button
              onClick={() => onUpdate({ fontWeight: textBlock.fontWeight === 'italic' ? 'normal' : 'italic' })}
              className={`p-1.5 rounded hover:bg-[#2a2a2a] transition-colors ${
                textBlock.fontWeight === 'italic' ? 'bg-[#2a2a2a] text-white' : 'text-text-muted'
              }`}
              title="Курсив"
            >
              <Italic size={14} />
            </button>

            {/* Text Align */}
            <div className="flex items-center gap-0.5 ml-1">
              <button
                onClick={() => onUpdate({ textAlign: 'left' })}
                className={`p-1.5 rounded hover:bg-[#2a2a2a] transition-colors ${
                  textBlock.textAlign === 'left' ? 'bg-[#2a2a2a] text-white' : 'text-text-muted'
                }`}
                title="По левому краю"
              >
                <AlignLeft size={14} />
              </button>
              <button
                onClick={() => onUpdate({ textAlign: 'center' })}
                className={`p-1.5 rounded hover:bg-[#2a2a2a] transition-colors ${
                  textBlock.textAlign === 'center' ? 'bg-[#2a2a2a] text-white' : 'text-text-muted'
                }`}
                title="По центру"
              >
                <AlignCenter size={14} />
              </button>
              <button
                onClick={() => onUpdate({ textAlign: 'right' })}
                className={`p-1.5 rounded hover:bg-[#2a2a2a] transition-colors ${
                  textBlock.textAlign === 'right' ? 'bg-[#2a2a2a] text-white' : 'text-text-muted'
                }`}
                title="По правому краю"
              >
                <AlignRight size={14} />
              </button>
            </div>

            {/* Color */}
            <input
              type="color"
              value={textBlock.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-8 h-8 rounded border border-border cursor-pointer"
              title="Цвет текста"
            />

            {/* Background Color */}
            <input
              type="color"
              value={textBlock.backgroundColor || '#000000'}
              onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
              className="w-8 h-8 rounded border border-border cursor-pointer"
              title="Цвет фона"
            />

            {/* Delete */}
            <button
              onClick={onDelete}
              className="p-1.5 rounded hover:bg-red-600/20 text-text-muted hover:text-red-400 transition-colors ml-auto"
              title="Удалить"
            >
              <X size={14} />
            </button>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={textBlock.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            onSelect={handleTextSelection}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            onBlur={() => {
              setTimeout(() => {
                if (!document.activeElement?.closest('.inline-toolbar')) {
                  setSelection(null);
                  onStopEdit();
                }
              }, 200);
            }}
            className="w-full px-2 py-1 bg-[#0f0f0f] border border-border rounded text-white text-sm focus:outline-none focus:border-accent-purple resize-none overflow-hidden text-block-input"
            style={{
              fontSize: `${textBlock.fontSize}px`,
              fontWeight: textBlock.fontWeight,
              color: textBlock.color,
              textAlign: textBlock.textAlign,
              backgroundColor: textBlock.backgroundColor || 'transparent',
              padding: textBlock.padding ? `${textBlock.padding}px` : '4px 8px',
              borderRadius: textBlock.borderRadius ? `${textBlock.borderRadius}px` : '4px',
              minHeight: `${textBlock.height}px`,
              fontFamily: textBlock.fontFamily,
            }}
            placeholder="Введите текст..."
          />
          
          {/* Инлайн-панель форматирования */}
          {selection && (
            <InlineToolbar
              selection={selection}
              onFormat={handleInlineFormat}
              onClose={() => setSelection(null)}
            />
          )}
        </div>
      ) : (
        <div
          className="px-2 py-1 border border-transparent hover:border-accent-purple rounded transition-colors cursor-pointer text-block-display"
          style={{
            fontSize: `${textBlock.fontSize}px`,
            fontWeight: textBlock.fontWeight,
            color: textBlock.color,
            fontFamily: textBlock.fontFamily,
            textAlign: textBlock.textAlign,
            backgroundColor: textBlock.backgroundColor || 'transparent',
            padding: textBlock.padding ? `${textBlock.padding}px` : '4px 8px',
            borderRadius: textBlock.borderRadius ? `${textBlock.borderRadius}px` : '4px',
            minHeight: `${textBlock.height}px`,
            width: '100%',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
          }}
        >
          {textBlock.text || 'Нажмите для редактирования'}
        </div>
      )}
      
      {/* Resize handle */}
      {isEditing && (
        <div
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 bg-accent-purple cursor-se-resize"
          style={{
            clipPath: 'polygon(100% 0, 0 100%, 100% 100%)',
          }}
        />
      )}
      
      {/* Контекстное меню */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onCopy={() => {
            navigator.clipboard.writeText(textBlock.text);
          }}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      )}
    </div>
  );
};

