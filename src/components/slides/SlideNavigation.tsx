import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useStreamStore } from '../../stores/useStreamStore';

export const SlideNavigation = () => {
  const { currentSlide, totalSlides, setCurrentSlide, zoomLevel, setZoomLevel } = useStreamStore();

  const handlePrevious = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleNext = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleZoomIn = () => {
    if (zoomLevel < 200) {
      setZoomLevel(zoomLevel + 10);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(zoomLevel - 10);
    }
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-[#0f0f0f] border-t border-border">
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrevious}
          disabled={currentSlide === 1}
          className="p-2 rounded-lg hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <span className="text-sm text-text-muted">
          {currentSlide} из {totalSlides}
        </span>
        <button
          onClick={handleNext}
          disabled={currentSlide === totalSlides}
          className="p-2 rounded-lg hover:bg-[#1a1a1a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
        >
          <ChevronRight size={20} className="text-white" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors duration-150"
        >
          <ZoomOut size={18} className="text-white" />
        </button>
        <span className="text-sm text-white min-w-[60px] text-center">{zoomLevel}%</span>
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors duration-150"
        >
          <ZoomIn size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
};


