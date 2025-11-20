import { Layers, Type, Video, Music, Monitor } from 'lucide-react';
import { MediaModal } from '../modals/MediaModal';
import { useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  badge?: number;
  onClick?: () => void;
}

const ToolButton = ({ icon, label, badge, onClick }: ToolButtonProps) => {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={onClick}
            className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-[#1a1a1a] transition-colors duration-150 relative group"
          >
            {icon}
            {badge !== undefined && badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-blue text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {badge}
              </span>
            )}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-[#1a1a1a] text-white px-3 py-2 rounded-lg text-sm border border-border"
            side="right"
            sideOffset={8}
          >
            {label}
            <Tooltip.Arrow className="fill-[#1a1a1a]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export const ToolsPanel = () => {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  return (
    <>
      <div className="w-[60px] bg-background-dark border-r border-border flex flex-col items-center py-4 gap-2 h-full">
        <ToolButton 
          icon={<Layers size={20} className="text-text-muted" />} 
          label="Слои" 
          onClick={() => setIsMediaModalOpen(!isMediaModalOpen)}
        />
        <ToolButton icon={<Type size={20} className="text-text-muted" />} label="Текст" />
        <ToolButton icon={<Video size={20} className="text-text-muted" />} label="Видео" />
        <ToolButton icon={<Music size={20} className="text-text-muted" />} label="Музыка" />
        <ToolButton icon={<Monitor size={20} className="text-text-muted" />} label="Мониторинг" />
      </div>
      
      <MediaModal open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen} />
    </>
  );
};

