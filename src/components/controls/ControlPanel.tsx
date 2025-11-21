import { useState, useEffect } from 'react';
import { useStreamStore } from '../../stores/useStreamStore';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Laptop, 
  Circle, 
  Link, 
  MessageCircle, 
  PhoneOff,
  ChevronDown
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ShareLinkModal } from '../modals/ShareLinkModal';
import { useMediaDevices } from '../../hooks/useMediaDevices';
import { useWebRTC } from '../../hooks/useWebRTC';

export const ControlPanel = () => {
  const { participants, updateParticipant, streamState, startRecording, stopRecording, stopStream, showChat, toggleChat, setCurrentPage, streamId, setStreamId, startStream } = useStreamStore();
  const currentUser = participants[0];
  const [shareLinkOpen, setShareLinkOpen] = useState(false);
  
  // Используем хук для работы с медиа-устройствами
  const { stream, audio, video, toggleAudio, toggleVideo, stopMedia } = useMediaDevices(
    currentUser?.audio ?? true,
    currentUser?.video ?? true
  );

  // WebRTC для трансляции (только когда трансляция активна)
  const { isConnected, connectionState } = useWebRTC({
    streamId: streamId || '',
    clientType: 'broadcaster',
    onError: (error) => {
      console.error('WebRTC ошибка:', error);
    },
  });

  // Синхронизируем стрим с участником
  useEffect(() => {
    if (currentUser && stream) {
      // Обновляем участника с реальным состоянием медиа
      updateParticipant(currentUser.id, { 
        audio, 
        video,
        stream: stream // Сохраняем стрим для отображения
      });
    }
  }, [stream, audio, video, currentUser?.id]);

  // Генерация уникального ID для трансляции
  const generateStreamId = () => {
    return Math.random().toString(36).substring(2, 9);
  };

  const handleStartStream = () => {
    if (!streamId) {
      const newStreamId = generateStreamId();
      setStreamId(newStreamId);
    }
    startStream();
  };

  const handleEndCall = () => {
    // Останавливаем медиа-стрим
    stopMedia();
    // Останавливаем запись, если она идет
    if (streamState.isRecording) {
      stopRecording();
    }
    // Останавливаем трансляцию
    stopStream();
    setStreamId(null);
    // Переходим на лендинг
    setCurrentPage('landing');
  };

  const handleToggleMic = async () => {
    await toggleAudio();
  };

  const handleToggleVideo = async () => {
    await toggleVideo();
  };

  return (
    <div className="bg-[#0a0a0a] border-t border-border flex items-center justify-between px-6 py-4 flex-shrink-0 relative">
      {/* Left side - Microphone and Camera */}
      <div className="flex items-center gap-3">
        {/* Микрофон (фиолетовый) с выпадающим меню */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleMic}
                className={`w-12 h-12 rounded-full transition-colors duration-150 flex items-center justify-center ${
                  audio
                    ? 'bg-accent-purple hover:bg-[#7c3aed] text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={audio ? 'Выключить микрофон' : 'Включить микрофон'}
              >
                {audio ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className="w-8 h-8 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors duration-150 flex items-center justify-center ml-1"
                    title="Настройки микрофона"
                  >
                    <ChevronDown size={14} className="text-white" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="bg-[#1a1a1a] border border-border rounded-lg p-2 min-w-[200px] z-50"
                    sideOffset={8}
                  >
                    <DropdownMenu.Item className="px-3 py-2 rounded hover:bg-[#2a2a2a] text-white text-sm cursor-pointer">
                      Микрофон 1
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="px-3 py-2 rounded hover:bg-[#2a2a2a] text-white text-sm cursor-pointer">
                      Микрофон 2
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-border my-1" />
                    <DropdownMenu.Item className="px-3 py-2 rounded hover:bg-[#2a2a2a] text-white text-sm cursor-pointer">
                      Настройки звука
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
          <span className="text-xs text-text-muted">Микрофон</span>
        </div>

        {/* Видеокамера (фиолетовый) с выпадающим меню */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative">
            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleVideo}
                className={`w-12 h-12 rounded-full transition-colors duration-150 flex items-center justify-center ${
                  video
                    ? 'bg-accent-purple hover:bg-[#7c3aed] text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={video ? 'Выключить камеру' : 'Включить камеру'}
              >
                {video ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button
                    className="w-8 h-8 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors duration-150 flex items-center justify-center ml-1"
                    title="Настройки камеры"
                  >
                    <ChevronDown size={14} className="text-white" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="bg-[#1a1a1a] border border-border rounded-lg p-2 min-w-[200px] z-50"
                    sideOffset={8}
                  >
                    <DropdownMenu.Item className="px-3 py-2 rounded hover:bg-[#2a2a2a] text-white text-sm cursor-pointer">
                      Камера 1
                    </DropdownMenu.Item>
                    <DropdownMenu.Item className="px-3 py-2 rounded hover:bg-[#2a2a2a] text-white text-sm cursor-pointer">
                      Камера 2
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator className="h-px bg-border my-1" />
                    <DropdownMenu.Item className="px-3 py-2 rounded hover:bg-[#2a2a2a] text-white text-sm cursor-pointer">
                      Настройки видео
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
          <span className="text-xs text-text-muted">Камера</span>
        </div>
      </div>

      {/* Center - Other controls */}
      <div className="flex items-center gap-4 absolute left-1/2 transform -translate-x-1/2">
        {/* Начать трансляцию */}
        {!streamState.isStreaming && (
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleStartStream}
              className="w-12 h-12 rounded-full bg-accent-purple hover:bg-[#7c3aed] transition-colors duration-150 flex items-center justify-center"
              title="Начать трансляцию"
            >
              <Circle size={20} className="text-white fill-white" />
            </button>
            <span className="text-xs text-text-muted">Начать</span>
          </div>
        )}
        
        {/* Демонстрация экрана */}
        <div className="flex flex-col items-center gap-1">
          <button
            className="w-12 h-12 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors duration-150 flex items-center justify-center"
            title="Демонстрация экрана"
          >
            <Laptop size={20} className="text-white" />
          </button>
          <span className="text-xs text-text-muted">Экран</span>
        </div>

        {/* Запись (с красной рамкой) */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={streamState.isRecording ? stopRecording : startRecording}
            className={`w-12 h-12 rounded-full transition-colors duration-150 flex items-center justify-center ${
              streamState.isRecording
                ? 'bg-[#1a1a1a] border-2 border-red-600 text-red-600'
                : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white'
            }`}
            title={streamState.isRecording ? 'Остановить запись' : 'Начать запись'}
          >
            <Circle size={20} fill={streamState.isRecording ? 'currentColor' : 'none'} />
          </button>
          <span className="text-xs text-text-muted">Запись</span>
        </div>

        {/* Ссылка */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={() => setShareLinkOpen(true)}
            className="w-12 h-12 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors duration-150 flex items-center justify-center"
            title="Поделиться ссылкой"
          >
            <Link size={20} className="text-white" />
          </button>
          <span className="text-xs text-text-muted">Ссылка</span>
        </div>

        {/* Чат */}
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={toggleChat}
            className={`w-12 h-12 rounded-full transition-colors duration-150 flex items-center justify-center ${
              showChat
                ? 'bg-accent-purple hover:bg-[#7c3aed] text-white'
                : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white'
            }`}
            title={showChat ? 'Скрыть чат' : 'Показать чат'}
          >
            <MessageCircle size={20} className="text-white" />
          </button>
          <span className="text-xs text-text-muted">Чат</span>
        </div>

      </div>

      {/* Right side - End call */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={handleEndCall}
          className="w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 transition-colors duration-150 flex items-center justify-center"
          title="Завершить трансляцию"
        >
          <PhoneOff size={20} className="text-white" />
        </button>
        <span className="text-xs text-text-muted">Завершить</span>
      </div>
      
      <ShareLinkModal open={shareLinkOpen} onOpenChange={setShareLinkOpen} />
    </div>
  );
};
