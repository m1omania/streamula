import { useEffect, useRef, useState } from 'react';
import { useStreamStore } from '../stores/useStreamStore';

const SIGNALING_SERVER_URL = 'ws://localhost:8080';

interface UseWebRTCOptions {
  streamId: string;
  clientType: 'broadcaster' | 'viewer';
  onStream?: (stream: MediaStream) => void;
  onError?: (error: Error) => void;
  onChatMessage?: (message: { author: string; text: string; timestamp: string }) => void;
  onReaction?: (reaction: string) => void;
}

export const useWebRTC = ({ streamId, clientType, onStream, onError, onChatMessage, onReaction }: UseWebRTCOptions) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const { setWebRTCConnection, setWebRTCStream } = useStreamStore();

  // STUN серверы для WebRTC
  const rtcConfiguration: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Инициализация WebSocket соединения
  useEffect(() => {
    if (!streamId || streamId === '') return;

    const ws = new WebSocket(SIGNALING_SERVER_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket подключен');
      setIsConnected(true);
      setConnectionState('connecting');

      // Отправляем сообщение о присоединении к комнате
      const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      ws.send(JSON.stringify({
        type: 'join',
        streamId,
        clientType,
        clientId,
      }));
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Получено сообщение от сервера:', data.type);

        switch (data.type) {
          case 'joined':
            console.log('Присоединились к комнате:', data.streamId);
            setConnectionState('connected');
            
            if (clientType === 'broadcaster') {
              // Broadcaster начинает трансляцию сразу после подключения
              await startBroadcasting();
            } else if (clientType === 'viewer') {
              // Viewer запрашивает offer у broadcaster
              if (wsRef.current) {
                wsRef.current.send(JSON.stringify({
                  type: 'request-offer',
                  streamId,
                }));
              }
            }
            break;

          case 'offer':
            // Для viewer: получаем offer от broadcaster
            if (clientType === 'viewer') {
              console.log('Viewer: получен offer от broadcaster');
              await handleOffer(data.offer);
            }
            break;

          case 'answer':
            // Для broadcaster: получаем answer от viewer
            if (clientType === 'broadcaster') {
              await handleAnswer(data.answer);
            }
            break;

          case 'ice-candidate':
            // Получаем ICE candidate
            await handleIceCandidate(data.candidate);
            break;

          case 'broadcaster-joined':
            // Для viewer: broadcaster присоединился, запрашиваем offer
            console.log('Broadcaster присоединился, запрашиваем offer');
            if (wsRef.current && clientType === 'viewer') {
              wsRef.current.send(JSON.stringify({
                type: 'request-offer',
                streamId,
              }));
            }
            break;

          case 'request-offer':
            // Для broadcaster: viewer запросил offer, создаем и отправляем
            if (clientType === 'broadcaster' && peerConnectionRef.current) {
              console.log('Viewer запросил offer, создаем новый');
              // Создаем новый offer
              try {
                const offer = await peerConnectionRef.current.createOffer();
                await peerConnectionRef.current.setLocalDescription(offer);
                if (wsRef.current) {
                  wsRef.current.send(JSON.stringify({
                    type: 'offer',
                    offer: peerConnectionRef.current.localDescription,
                    streamId,
                  }));
                }
              } catch (error) {
                console.error('Ошибка создания offer по запросу:', error);
              }
            } else if (clientType === 'broadcaster' && !peerConnectionRef.current) {
              // Если соединения еще нет, запускаем трансляцию
              console.log('Viewer запросил offer, запускаем трансляцию');
              await startBroadcasting();
            }
            break;

          case 'chat':
            // Сообщение чата
            if (onChatMessage) {
              onChatMessage({
                author: data.author || 'Неизвестный',
                text: data.message || '',
                timestamp: data.timestamp || new Date().toISOString(),
              });
            }
            break;

          case 'reaction':
            // Реакция
            if (onReaction) {
              onReaction(data.reaction || '👍');
            }
            break;

          default:
            console.log('Неизвестный тип сообщения:', data.type);
        }
      } catch (error) {
        console.error('Ошибка обработки сообщения:', error);
        onError?.(error as Error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket ошибка:', error);
      setConnectionState('disconnected');
      onError?.(new Error('WebSocket connection error'));
    };

    ws.onclose = () => {
      console.log('WebSocket закрыт');
      setIsConnected(false);
      setConnectionState('disconnected');
      cleanup();
    };

    return () => {
      ws.close();
      cleanup();
    };
  }, [streamId, clientType]);

  // Захват и передача потока (для broadcaster)
  const startBroadcasting = async () => {
    try {
      // Если соединение уже существует, переиспользуем его
      let pc = peerConnectionRef.current;
      if (!pc) {
        console.log('Создаем новое RTCPeerConnection для broadcaster');
        // Создаем RTCPeerConnection
        pc = new RTCPeerConnection(rtcConfiguration);
        peerConnectionRef.current = pc;
        setWebRTCConnection(pc);
      } else {
        console.log('Переиспользуем существующее RTCPeerConnection');
      }

      // Захватываем сцену через canvas
      // Находим элемент сцены в эфире
      const sceneElement = document.querySelector('.scene-drop-zone') as HTMLElement;
      let stream: MediaStream;

      if (sceneElement) {
        // Создаем canvas для захвата сцены
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Не удалось создать контекст canvas');
        }

        // Устанавливаем размеры canvas равными размерам сцены
        const rect = sceneElement.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;

        // Функция для рендеринга сцены на canvas
        const captureFrame = () => {
          if (ctx && sceneElement) {
            // Используем html2canvas для захвата HTML элемента
            // Пока используем простой способ - создаем видео элемент из canvas
            // Для полноценного решения нужно использовать html2canvas или canvas.captureStream
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Временно используем getUserMedia для тестирования
            // TODO: Реализовать захват сцены через html2canvas или canvas.captureStream
          }
        };

        // Пока используем getUserMedia для тестирования
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      } else {
        // Fallback: используем getUserMedia
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      }

      localStreamRef.current = stream;
      setWebRTCStream(stream);

      // Добавляем треки в peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Обработка ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate,
            streamId,
          }));
        }
      };

      // Создаем offer только если еще не создан
      if (pc.signalingState === 'stable' || pc.signalingState === 'have-local-offer') {
        console.log('Создаем offer, текущее состояние:', pc.signalingState);
        // Создаем offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log('Offer создан и установлен как localDescription');

        // Отправляем offer через WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'offer',
            offer: pc.localDescription,
            streamId,
          }));
          console.log('Offer отправлен через WebSocket');
        } else {
          console.error('WebSocket не готов для отправки offer');
        }
      } else {
        console.log('Offer уже создан, состояние:', pc.signalingState);
      }

      console.log('Broadcasting начат, состояние PeerConnection:', pc.signalingState, 'треков:', stream.getTracks().length);
    } catch (error) {
      console.error('Ошибка начала трансляции:', error);
      onError?.(error as Error);
    }
  };

  // Обработка offer (для viewer)
  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    try {
      console.log('Viewer: получен offer, создаем PeerConnection');
      const pc = new RTCPeerConnection(rtcConfiguration);
      peerConnectionRef.current = pc;
      setWebRTCConnection(pc);

      // Обработка входящего потока
      pc.ontrack = (event) => {
        console.log('Viewer: получен трек от broadcaster:', event.track.kind, event.track.id);
        console.log('Viewer: количество потоков:', event.streams.length);
        if (event.streams[0] && onStream) {
          console.log('Viewer: вызываем onStream с потоком:', event.streams[0].id, 'треков:', event.streams[0].getTracks().length);
          onStream(event.streams[0]);
        } else {
          console.warn('Viewer: поток не найден или onStream не определен');
        }
      };

      // Обработка ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'ice-candidate',
            candidate: event.candidate,
            streamId,
            clientId: `viewer-${Date.now()}`,
          }));
        }
      };

      await pc.setRemoteDescription(offer);

      // Создаем answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Отправляем answer через WebSocket
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'answer',
          answer: pc.localDescription,
          streamId,
          clientId: `viewer-${Date.now()}`,
        }));
      }

      console.log('Viewer подключен к трансляции');
    } catch (error) {
      console.error('Ошибка обработки offer:', error);
      onError?.(error as Error);
    }
  };

  // Обработка answer (для broadcaster)
  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(answer);
        console.log('Answer обработан');
      }
    } catch (error) {
      console.error('Ошибка обработки answer:', error);
      onError?.(error as Error);
    }
  };

  // Обработка ICE candidate
  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Ошибка добавления ICE candidate:', error);
    }
  };

  // Очистка ресурсов
  const cleanup = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
      setWebRTCConnection(null);
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setWebRTCStream(null);
    }
  };

  // Отправка сообщения в чат
  const sendChatMessage = (message: string, author: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        message,
        author,
        timestamp: new Date().toISOString(),
        streamId,
      }));
    }
  };

  // Отправка реакции
  const sendReaction = (reaction: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'reaction',
        reaction,
        timestamp: new Date().toISOString(),
        streamId,
      }));
    }
  };

  return {
    isConnected,
    connectionState,
    sendChatMessage,
    sendReaction,
    cleanup,
  };
};

