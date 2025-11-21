import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useStreamStore } from '../../stores/useStreamStore';
import { ScenesBar } from '../layout/ScenesBar';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export const SlideViewer = () => {
  const { currentSlide, zoomLevel, isStreamFullscreen } = useStreamStore();
  const [pdfUrl] = useState<string | null>(null);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    useStreamStore.getState().setTotalSlides(numPages);
  };

  return (
    <div className={`flex flex-col items-center justify-center ${isStreamFullscreen ? 'bg-black w-full h-full' : 'bg-background w-full h-full'} relative`}>
      {pdfUrl ? (
        <div className="w-full h-full flex items-center justify-center">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="text-text-muted">Загрузка PDF...</div>
            }
            error={
              <div className="text-text-muted">Ошибка загрузки PDF</div>
            }
          >
            <Page
              pageNumber={currentSlide}
              scale={zoomLevel / 100}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-2xl"
            />
          </Document>
        </div>
      ) : (
        <div className="w-full h-full flex items-start justify-center bg-background">
          <ScenesBar />
        </div>
      )}
    </div>
  );
};

