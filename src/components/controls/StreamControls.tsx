import { Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { useStreamStore } from '../../stores/useStreamStore';

export const StreamControls = () => {
  const { participants, updateParticipant } = useStreamStore();

  // For MVP, we'll control the first participant (current user)
  const currentUser = participants[0];

  const toggleVideo = () => {
    if (currentUser) {
      updateParticipant(currentUser.id, { video: !currentUser.video });
    }
  };

  const toggleAudio = () => {
    if (currentUser) {
      updateParticipant(currentUser.id, { audio: !currentUser.audio });
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleVideo}
        className={`p-2 rounded-lg transition-colors duration-150 ${
          currentUser.video
            ? 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
        title={currentUser.video ? 'Выключить камеру' : 'Включить камеру'}
      >
        {currentUser.video ? <Video size={18} /> : <VideoOff size={18} />}
      </button>
      <button
        onClick={toggleAudio}
        className={`p-2 rounded-lg transition-colors duration-150 ${
          currentUser.audio
            ? 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
        title={currentUser.audio ? 'Выключить микрофон' : 'Включить микрофон'}
      >
        {currentUser.audio ? <Mic size={18} /> : <MicOff size={18} />}
      </button>
    </div>
  );
};


