import { useStreamStore } from '../../stores/useStreamStore';
import { Settings, HelpCircle, Layout, Type, Video, Music, Monitor, Image, FileText, Users, Camera, Film, Layers } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface HeaderProps {
  onSettingsClick?: () => void;
}

const ToolButton = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) => {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          onClick={onClick}
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#1a1a1a] transition-colors duration-150"
          title={label}
        >
          {icon}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="bg-[#1a1a1a] text-white px-3 py-2 rounded-lg text-sm border border-border z-50"
          side="bottom"
          sideOffset={8}
        >
          {label}
          <Tooltip.Arrow className="fill-[#1a1a1a]" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

export const Header = ({ onSettingsClick }: HeaderProps) => {
  const { streamState, setCurrentPage, toggleParticipants, showParticipants, activeSceneId, centerActiveScene, textMode, setTextMode, showScenesPanel, toggleScenesPanel } = useStreamStore();

  return (
    <>
      <div className="h-16 bg-background-dark border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          {/* Иконка панели сцен */}
          <button
            onClick={toggleScenesPanel}
            className={`w-10 h-10 rounded-lg transition-colors duration-150 flex items-center justify-center ${
              showScenesPanel 
                ? 'bg-[#1a1a1a] text-accent-purple' 
                : 'hover:bg-[#1a1a1a] text-text-muted'
            }`}
            title={showScenesPanel ? 'Скрыть панель сцен' : 'Показать панель сцен'}
          >
            <Layers size={20} />
          </button>
          
          {streamState.isStreaming && (
            <button
              onClick={() => {
                if (activeSceneId) {
                  centerActiveScene();
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600/20 border border-red-600 rounded-lg hover:bg-red-600/30 transition-colors duration-150 cursor-pointer"
              title="Показать сцену в эфире"
            >
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              <span className="text-sm text-red-400 font-medium">В эфире</span>
            </button>
          )}
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="w-10 h-10 rounded-lg hover:bg-[#1a1a1a] transition-colors duration-150 flex items-center justify-center"
              title="Настройки"
            >
              <Settings size={20} className="text-text-muted" />
            </button>
          )}
          <button
            className="w-10 h-10 rounded-lg hover:bg-[#1a1a1a] transition-colors duration-150 flex items-center justify-center"
            title="Помощь"
          >
            <HelpCircle size={20} className="text-text-muted" />
          </button>
        </div>
        
        {/* Center - Tools */}
        <Tooltip.Provider>
          <div className="flex items-center gap-2">
            <ToolButton 
              icon={<Users size={20} className={showParticipants ? "text-accent-purple" : "text-text-muted"} />} 
              label="Спикеры"
              onClick={toggleParticipants}
            />
            <ToolButton 
              icon={<Type size={20} className={textMode ? "text-accent-purple" : "text-text-muted"} />} 
              label="Текст"
              onClick={() => setTextMode(!textMode)}
            />
            <ToolButton icon={<Image size={20} className="text-text-muted" />} label="Изображение" />
            <ToolButton icon={<FileText size={20} className="text-text-muted" />} label="Документ" />
            <ToolButton icon={<Video size={20} className="text-text-muted" />} label="Камера" />
            <ToolButton icon={<Film size={20} className="text-text-muted" />} label="Видео" />
            <ToolButton icon={<Music size={20} className="text-text-muted" />} label="Музыка" />
            <ToolButton icon={<Monitor size={20} className="text-text-muted" />} label="Мониторинг" />
          </div>
        </Tooltip.Provider>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentPage('landing')}
            className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors duration-150"
            title="На главную"
          >
            <Layout size={20} className="text-text-muted" />
          </button>
        </div>
      </div>
    </>
  );
};

