import { SlideViewer } from '../slides/SlideViewer';
import { useStreamStore } from '../../stores/useStreamStore';

export const MainCanvas = () => {
  const { isStreamFullscreen } = useStreamStore();

  if (isStreamFullscreen) {
    return (
      <div className="w-full h-full">
        <SlideViewer />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Slide Viewer */}
      <div className="flex-1 min-h-0">
        <SlideViewer />
      </div>
    </div>
  );
};

