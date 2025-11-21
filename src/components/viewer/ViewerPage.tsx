import { useState } from 'react';
import { useStreamStore } from '../../stores/useStreamStore';
import { useWebRTC } from '../../hooks/useWebRTC';
import { SceneViewer } from './SceneViewer';
import { ViewerChat } from './ViewerChat';
import { ViewerReactions } from './ViewerReactions';

interface ViewerPageProps {
  streamId: string;
}

export const ViewerPage = ({ streamId }: ViewerPageProps) => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const { addMessage, addReaction } = useStreamStore();

  const { isConnected, connectionState, sendChatMessage, sendReaction } = useWebRTC({
    streamId: streamId || '',
    clientType: 'viewer',
    onStream: (stream) => {
      setRemoteStream(stream);
    },
    onError: (error) => {
      console.error('WebRTC ошибка:', error);
    },
    onChatMessage: (messageData) => {
      addMessage({
        author: messageData.author,
        text: messageData.text,
      });
    },
    onReaction: (reactionType) => {
      addReaction(reactionType as '👍' | '❤️' | '😂' | '👏');
    },
  });


  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Основной контент - сцена в эфире */}
      <div className="flex-1 flex min-h-0">
        {/* Центр - Сцена */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0">
            <SceneViewer stream={remoteStream} />
          </div>
        </div>

        {/* Правая сторона - Чат и реакции */}
        <div className="w-[320px] bg-background-dark border-l border-border flex flex-col h-full">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ViewerChat sendChatMessage={sendChatMessage} />
          </div>
          <div className="border-t border-border p-4">
            <ViewerReactions sendReaction={sendReaction} />
          </div>
        </div>
      </div>

      {/* Статус подключения */}
      {connectionState !== 'connected' && (
        <div className="absolute top-4 left-4 bg-[#1a1a1a] border border-border rounded-lg px-4 py-2">
          <div className="text-sm text-text-muted">
            {connectionState === 'connecting' ? 'Подключение...' : 'Не подключено'}
          </div>
        </div>
      )}
    </div>
  );
};

