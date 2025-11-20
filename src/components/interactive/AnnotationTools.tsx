import { PenTool, Eraser } from 'lucide-react';
import { useStreamStore } from '../../stores/useStreamStore';
import { useState } from 'react';

export const AnnotationTools = () => {
  const { clearAnnotations } = useStreamStore();
  const [tool, setTool] = useState<'line' | 'marker' | 'arrow'>('line');

  return (
    <div className="fixed top-4 right-[460px] bg-[#1a1a1a] border border-border rounded-lg p-2 flex items-center gap-2 z-40">
      <button
        onClick={() => setTool('line')}
        className={`p-2 rounded-lg transition-colors duration-150 ${
          tool === 'line' ? 'bg-accent-blue text-white' : 'text-text-muted hover:bg-[#2a2a2a]'
        }`}
        title="Линия"
      >
        <PenTool size={18} />
      </button>
      <button
        onClick={() => setTool('marker')}
        className={`p-2 rounded-lg transition-colors duration-150 ${
          tool === 'marker' ? 'bg-accent-blue text-white' : 'text-text-muted hover:bg-[#2a2a2a]'
        }`}
        title="Маркер"
      >
        <PenTool size={18} />
      </button>
      <button
        onClick={() => setTool('arrow')}
        className={`p-2 rounded-lg transition-colors duration-150 ${
          tool === 'arrow' ? 'bg-accent-blue text-white' : 'text-text-muted hover:bg-[#2a2a2a]'
        }`}
        title="Стрелка"
      >
        <PenTool size={18} />
      </button>
      <div className="w-px h-6 bg-border" />
      <button
        onClick={clearAnnotations}
        className="p-2 rounded-lg text-text-muted hover:bg-[#2a2a2a] transition-colors duration-150"
        title="Очистить аннотации"
      >
        <Eraser size={18} />
      </button>
    </div>
  );
};

