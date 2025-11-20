import { VideoGrid } from '../video/VideoGrid';
import { useStreamStore } from '../../stores/useStreamStore';

export const RightPanel = () => {
  const { showParticipants } = useStreamStore();

  // Не показывать панель, если спикеры скрыты
  if (!showParticipants) {
    return null;
  }

  return (
    <div className="w-[320px] bg-background-dark border-r border-border flex flex-col h-full">
      <VideoGrid />
    </div>
  );
};

