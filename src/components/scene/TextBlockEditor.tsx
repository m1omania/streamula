import React, { useState, useRef, useEffect } from 'react';
import type { TextBlock } from '../../types';
import { X, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type } from 'lucide-react';

interface TextBlockEditorProps {
  textBlock: TextBlock;
  sceneId: number;
  onUpdate: (updates: Partial<TextBlock>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export const TextBlockEditor = ({ textBlock, sceneId, onUpdate, onDelete, onClose }: TextBlockEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Закрываем редактор при клике вне его
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
        setIsEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={editorRef}
      className="absolute z-50 bg-[#1a1a1a] border border-border rounded-lg p-2 shadow-lg text-block-editor"
      style={{
        left: `${textBlock.x}px`,
        top: `${textBlock.y}px`,
        minWidth: '200px',
      }}
      onClick={(e) => e.stopPropagation()}
    >
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

      {/* Text Input */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={textBlock.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsEditing(false);
            }
          }}
          className="w-full px-2 py-1 bg-[#0f0f0f] border border-border rounded text-white text-sm focus:outline-none focus:border-accent-purple"
        />
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="px-2 py-1 bg-[#0f0f0f] border border-border rounded text-white text-sm cursor-text hover:border-accent-purple transition-colors"
          style={{
            fontSize: `${textBlock.fontSize}px`,
            fontWeight: textBlock.fontWeight,
            color: textBlock.color,
            textAlign: textBlock.textAlign,
            backgroundColor: textBlock.backgroundColor,
            padding: textBlock.padding ? `${textBlock.padding}px` : undefined,
            borderRadius: textBlock.borderRadius ? `${textBlock.borderRadius}px` : undefined,
          }}
        >
          {textBlock.text || 'Нажмите для редактирования'}
        </div>
      )}
    </div>
  );
};

