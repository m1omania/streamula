import { useState } from 'react';
import { useStreamStore } from '../../stores/useStreamStore';
import { VideoTile } from './VideoTile';
import { Plus, X } from 'lucide-react';
import { ShareLinkModal } from '../modals/ShareLinkModal';

export const VideoGrid = () => {
  const { participants, showChat, toggleParticipants } = useStreamStore();
  const [shareLinkOpen, setShareLinkOpen] = useState(false);

  return (
    <>
      <div className={`flex flex-col h-full ${showChat ? 'border-b border-border' : ''}`}>
        <div className="p-4 pb-3 flex-shrink-0 flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-muted">Спикеры</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShareLinkOpen(true)}
              className="w-8 h-8 rounded-lg hover:bg-[#1a1a1a] transition-colors duration-150 flex items-center justify-center"
              title="Добавить спикера"
            >
              <Plus size={18} className="text-text-muted" />
            </button>
            <button
              onClick={toggleParticipants}
              className="w-8 h-8 rounded-lg hover:bg-[#1a1a1a] transition-colors duration-150 flex items-center justify-center"
              title="Закрыть"
            >
              <X size={18} className="text-text-muted" />
            </button>
          </div>
        </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-1 gap-3">
          {participants.map((participant) => (
            <VideoTile key={participant.id} participant={participant} />
          ))}
        </div>
      </div>
      </div>
      
      <ShareLinkModal open={shareLinkOpen} onOpenChange={setShareLinkOpen} />
    </>
  );
};

