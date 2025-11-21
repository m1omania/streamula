import { useEffect, useRef } from 'react';
import { useStreamStore } from '../../stores/useStreamStore';

interface SceneViewerProps {
  stream: MediaStream | null;
}

export const SceneViewer = ({ stream }: SceneViewerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((error) => {
        console.error('Ошибка воспроизведения видео:', error);
      });
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, [stream]);

  if (!stream) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black">
        <div className="text-white text-lg">Ожидание трансляции...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={false}
        className="w-full h-full object-contain"
      />
    </div>
  );
};

