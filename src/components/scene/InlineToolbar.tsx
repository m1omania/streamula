import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type, Link } from 'lucide-react';

interface InlineToolbarProps {
  selection: {
    text: string;
    range: Range;
  } | null;
  onFormat: (format: string, value?: any) => void;
  onClose: () => void;
}

export const InlineToolbar = ({ selection, onFormat, onClose }: InlineToolbarProps) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!selection || !toolbarRef.current) return;

    const range = selection.range;
    const rect = range.getBoundingClientRect();
    const toolbarHeight = 40;
    const offset = 10;

    // Позиционируем панель над выделенным текстом
    setPosition({
      top: rect.top - toolbarHeight - offset,
      left: rect.left + (rect.width / 2),
    });

    // Закрываем панель при клике вне её
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selection, onClose]);

  if (!selection) return null;

  return (
    <div
      ref={toolbarRef}
      className="fixed z-50 bg-[#1a1a1a] border border-border rounded-lg p-1 shadow-lg flex items-center gap-1 inline-toolbar"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => onFormat('bold')}
        className="w-8 h-8 rounded hover:bg-[#2a2a2a] text-text-muted hover:text-white flex items-center justify-center transition-colors"
        title="Жирный"
      >
        <Bold size={16} />
      </button>
      <button
        onClick={() => onFormat('italic')}
        className="w-8 h-8 rounded hover:bg-[#2a2a2a] text-text-muted hover:text-white flex items-center justify-center transition-colors"
        title="Курсив"
      >
        <Italic size={16} />
      </button>
      <div className="w-px h-6 bg-border mx-1" />
      <button
        onClick={() => onFormat('link')}
        className="w-8 h-8 rounded hover:bg-[#2a2a2a] text-text-muted hover:text-white flex items-center justify-center transition-colors"
        title="Ссылка"
      >
        <Link size={16} />
      </button>
      <div className="w-px h-6 bg-border mx-1" />
      <button
        onClick={() => onFormat('align', 'left')}
        className="w-8 h-8 rounded hover:bg-[#2a2a2a] text-text-muted hover:text-white flex items-center justify-center transition-colors"
        title="По левому краю"
      >
        <AlignLeft size={16} />
      </button>
      <button
        onClick={() => onFormat('align', 'center')}
        className="w-8 h-8 rounded hover:bg-[#2a2a2a] text-text-muted hover:text-white flex items-center justify-center transition-colors"
        title="По центру"
      >
        <AlignCenter size={16} />
      </button>
      <button
        onClick={() => onFormat('align', 'right')}
        className="w-8 h-8 rounded hover:bg-[#2a2a2a] text-text-muted hover:text-white flex items-center justify-center transition-colors"
        title="По правому краю"
      >
        <AlignRight size={16} />
      </button>
      <div className="w-px h-6 bg-border mx-1" />
      <button
        onClick={() => onFormat('fontSize')}
        className="w-8 h-8 rounded hover:bg-[#2a2a2a] text-text-muted hover:text-white flex items-center justify-center transition-colors"
        title="Размер шрифта"
      >
        <Type size={16} />
      </button>
    </div>
  );
};

