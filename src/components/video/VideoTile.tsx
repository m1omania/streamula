import { useEffect, useRef } from 'react';
import type { Participant } from '../../types';
import { Video, VideoOff, Mic, MicOff, Plus } from 'lucide-react';
import { getInitials, getRandomColor } from '../../utils/mockData';
import { useStreamStore } from '../../stores/useStreamStore';

interface VideoTileProps {
  participant: Participant;
}

export const VideoTile = ({ participant }: VideoTileProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { activeSceneId, participantsOnAir, setParticipantOnAir } = useStreamStore();
  const initials = participant.avatar || getInitials(participant.name);
  const bgColor = getRandomColor(participant.name);

  // Привязываем медиа-стрим к video элементу
  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream]);

  const hasVideo = participant.video && participant.stream;
  const participantScenes = participantsOnAir[participant.id] || [];
  const isOnAir = participantScenes.includes(activeSceneId);

  const handleOnAirClick = () => {
    if (isOnAir) {
      // Убираем из эфира
      setParticipantOnAir(participant.id, null);
    } else {
      // Добавляем в эфир на активную сцену
      if (activeSceneId) {
        setParticipantOnAir(participant.id, activeSceneId);
      }
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('participantId', participant.id.toString());
    e.dataTransfer.effectAllowed = 'move';
    // Добавляем визуальный эффект при перетаскивании
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Восстанавливаем прозрачность
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  return (
    <div className="flex flex-col">
      <div 
        className="relative w-full aspect-video bg-[#1a1a1a] rounded-lg overflow-hidden border border-border group cursor-grab active:cursor-grabbing"
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Video или Placeholder */}
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

        {/* Participant Info Overlay - только иконки и платформа */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {participant.platform && (
                <span className="text-xs px-2 py-0.5 bg-accent-blue/20 text-accent-blue rounded">
                  {participant.platform}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {participant.video ? (
                <Video size={16} className="text-white" />
              ) : (
                <VideoOff size={16} className="text-text-muted" />
              )}
              {participant.audio ? (
                <Mic size={16} className="text-white" />
              ) : (
                <MicOff size={16} className="text-text-muted" />
              )}
            </div>
          </div>
        </div>

        {/* Role Badge */}
        {participant.role === 'moderator' && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-accent-purple/80 text-white text-xs rounded">
            Модератор
          </div>
        )}
        {participant.role === 'speaker' && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-accent-blue/80 text-white text-xs rounded">
            Спикер
          </div>
        )}

        {/* На сцену кнопка */}
        <button
          onClick={handleOnAirClick}
          className={`absolute top-2 right-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 flex items-center gap-1.5 ${
            isOnAir
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-[#1a1a1a]/80 hover:bg-[#2a2a2a] text-white'
          }`}
          title={isOnAir ? 'Убрать со сцены' : 'На сцену'}
        >
          <Plus size={14} className={isOnAir ? 'rotate-45' : ''} />
          {isOnAir ? 'На сцене' : 'На сцену'}
        </button>
      </div>
      
      {/* Имя спикера под карточкой */}
      <div className="mt-2 px-1">
        <span className="text-sm font-medium text-white">{participant.name}</span>
      </div>
    </div>
  );
};

