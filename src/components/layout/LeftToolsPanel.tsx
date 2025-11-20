import { useStreamStore } from '../../stores/useStreamStore';
import { Layers, Type, Video, Music, Monitor, Image, FileText, Users, Mic, MicOff } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { MediaModal } from '../modals/MediaModal';
import * as Tooltip from '@radix-ui/react-tooltip';
import { getRandomColor, getInitials } from '../../utils/mockData';
import type { Participant } from '../../types';

const ToolButton = ({ icon, label, onClick, isActive }: { icon: React.ReactNode; label: string; onClick?: () => void; isActive?: boolean }) => {
  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={onClick}
            className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors duration-150 ${
              isActive ? 'bg-[#2a2a2a]' : 'hover:bg-[#1a1a1a]'
            }`}
            title={label}
          >
            {icon}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-[#1a1a1a] text-white px-3 py-2 rounded-lg text-sm border border-border z-50"
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

const ParticipantCard = ({ participant }: { participant: Participant }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const initials = participant.avatar || getInitials(participant.name);
  const bgColor = getRandomColor(participant.name);
  const hasVideo = participant.video && participant.stream;

  useEffect(() => {
    if (videoRef.current && participant.stream && hasVideo) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream, hasVideo]);

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden relative bg-[#1a1a1a] mb-4">
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!participant.audio}
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      )}
      {/* Name and mic status overlay - bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">{participant.name}</span>
          {participant.audio ? (
            <Mic size={16} className="text-white" />
          ) : (
            <MicOff size={16} className="text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
};

export const LeftToolsPanel = () => {
  const { toggleSpeakers, showSpeakers, participants } = useStreamStore();
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-shrink-0">
        {/* Tools Panel */}
        <div className="w-16 bg-background-dark border-r border-border flex flex-col items-center py-4 gap-2">
          <ToolButton 
            icon={<Users size={20} className={showSpeakers ? "text-accent-purple" : "text-text-muted"} />} 
            label="Спикеры"
            onClick={toggleSpeakers}
            isActive={showSpeakers}
          />
          <ToolButton 
            icon={<Layers size={20} className="text-text-muted" />} 
            label="Слои" 
            onClick={() => setIsMediaModalOpen(!isMediaModalOpen)}
          />
          <ToolButton icon={<Type size={20} className="text-text-muted" />} label="Текст" />
          <ToolButton icon={<Image size={20} className="text-text-muted" />} label="Изображение" />
          <ToolButton icon={<FileText size={20} className="text-text-muted" />} label="Документ" />
          <ToolButton icon={<Video size={20} className="text-text-muted" />} label="Видео" />
          <ToolButton icon={<Music size={20} className="text-text-muted" />} label="Музыка" />
          <ToolButton icon={<Monitor size={20} className="text-text-muted" />} label="Мониторинг" />
        </div>

        {/* Participant Card - справа от панели инструментов */}
        {showSpeakers && participants.length > 0 && (
          <div className="w-[240px] bg-background-dark border-r border-border p-4">
            <ParticipantCard participant={participants[0]} />
          </div>
        )}
      </div>
      
      <MediaModal open={isMediaModalOpen} onOpenChange={setIsMediaModalOpen} />
    </>
  );
};

