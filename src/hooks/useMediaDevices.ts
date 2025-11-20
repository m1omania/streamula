import { useState, useEffect, useRef } from 'react';

interface MediaStreamState {
  stream: MediaStream | null;
  audio: boolean;
  video: boolean;
  error: string | null;
}

export const useMediaDevices = (initialAudio = true, initialVideo = true) => {
  const [state, setState] = useState<MediaStreamState>({
    stream: null,
    audio: initialAudio,
    video: initialVideo,
    error: null,
  });
  const streamRef = useRef<MediaStream | null>(null);

  const requestMedia = async (audio: boolean, video: boolean) => {
    try {
      // Останавливаем предыдущий стрим
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Запрашиваем новый стрим
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audio ? { echoCancellation: true, noiseSuppression: true } : false,
        video: video ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      });

      streamRef.current = stream;
      setState({
        stream,
        audio,
        video,
        error: null,
      });

      return stream;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось получить доступ к медиа-устройствам';
      setState(prev => ({
        ...prev,
        error: errorMessage,
      }));
      console.error('Error accessing media devices:', error);
      return null;
    }
  };

  const toggleAudio = async () => {
    const newAudio = !state.audio;
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = newAudio;
      });
      setState(prev => ({ ...prev, audio: newAudio }));
    } else {
      await requestMedia(newAudio, state.video);
    }
  };

  const toggleVideo = async () => {
    const newVideo = !state.video;
    if (streamRef.current && state.audio) {
      // Если уже есть стрим с аудио, просто включаем/выключаем видео
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = newVideo;
      });
      setState(prev => ({ ...prev, video: newVideo }));
    } else {
      // Нужно пересоздать стрим
      await requestMedia(state.audio, newVideo);
    }
  };

  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setState({
        stream: null,
        audio: false,
        video: false,
        error: null,
      });
    }
  };

  // Инициализация при монтировании
  useEffect(() => {
    if (initialAudio || initialVideo) {
      requestMedia(initialAudio, initialVideo);
    }

    // Очистка при размонтировании
    return () => {
      stopMedia();
    };
  }, []);

  return {
    stream: state.stream,
    audio: state.audio,
    video: state.video,
    error: state.error,
    toggleAudio,
    toggleVideo,
    requestMedia,
    stopMedia,
  };
};

