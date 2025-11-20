import { useState, useRef, useEffect } from 'react';
import { X, Plus, MoreVertical, Mic, MicOff } from 'lucide-react';
import { useStreamStore } from '../../stores/useStreamStore';
import { getInitials, getRandomColor } from '../../utils/mockData';

interface SpeakersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ParticipantAvatar = ({ participant }: { participant: any }) => {
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
    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
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
    </div>
  );
};

export const SpeakersModal = ({ open, onOpenChange }: SpeakersModalProps) => {
  const { participants } = useStreamStore();
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.drag-handle')) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStartRef.current.x,
          y: e.clientY - dragStartRef.current.y,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        ref={modalRef}
        className="absolute bg-white rounded-lg shadow-2xl w-[400px] pointer-events-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header - draggable */}
        <div className="drag-handle flex items-center justify-between px-4 py-3 border-b border-gray-200 cursor-move">
          <h2 className="text-lg font-semibold text-gray-900">Спикеры</h2>
          <div className="flex items-center gap-2">
            <button
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-150"
              title="Добавить"
            >
              <Plus size={18} className="text-gray-600" />
            </button>
            <button
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-150"
              title="Еще"
            >
              <MoreVertical size={18} className="text-gray-600" />
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-150"
              title="Закрыть"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {participants.map((participant) => {
            const isCurrentUser = participant.id === 1; // Предполагаем, что первый участник - текущий пользователь

            return (
              <div
                key={participant.id}
                className="bg-gray-100 rounded-lg p-4 mb-3 last:mb-0"
              >
                {/* Participant Card */}
                <div className="flex items-center gap-3">
                  {/* Video or Avatar */}
                  <ParticipantAvatar participant={participant} />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {isCurrentUser && (
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {participant.name}
                        {isCurrentUser && <span className="text-gray-500 ml-1">(me)</span>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {participant.audio ? (
                        <Mic size={16} className="text-gray-600" />
                      ) : (
                        <MicOff size={16} className="text-gray-400" />
                      )}
                      <span className="text-xs text-gray-500">
                        {participant.audio ? 'Микрофон включен' : 'Микрофон выключен'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

