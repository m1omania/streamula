import { WebSocketServer } from 'ws';
import http from 'http';

const PORT = 8080;

// Создаем HTTP сервер
const server = http.createServer();

// Создаем WebSocket сервер
const wss = new WebSocketServer({ server });

// Хранилище комнат (streamId -> Set of clients)
const rooms = new Map();

// Хранилище типов клиентов (broadcaster или viewer)
const clientTypes = new Map();

wss.on('connection', (ws, req) => {
  console.log('Новое подключение');

  let clientId = null;
  let streamId = null;
  let clientType = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Получено сообщение:', data.type);

      switch (data.type) {
        case 'join':
          // Клиент присоединяется к комнате
          streamId = data.streamId;
          clientType = data.clientType; // 'broadcaster' или 'viewer'
          clientId = data.clientId || `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          if (!rooms.has(streamId)) {
            rooms.set(streamId, new Set());
          }

          rooms.get(streamId).add(ws);
          clientTypes.set(ws, { clientId, streamId, clientType });

          // Отправляем подтверждение
          ws.send(JSON.stringify({
            type: 'joined',
            clientId,
            streamId,
            clientType,
          }));

          // Если это broadcaster, уведомляем всех viewers
          if (clientType === 'broadcaster') {
            broadcastToViewers(streamId, {
              type: 'broadcaster-joined',
              streamId,
            }, ws);
          }

          console.log(`Клиент ${clientId} (${clientType}) присоединился к комнате ${streamId}`);
          break;

        case 'offer':
          // WebRTC offer от broadcaster к viewers
          if (clientType === 'broadcaster') {
            broadcastToViewers(streamId, {
              type: 'offer',
              offer: data.offer,
              streamId,
            }, ws);
          }
          break;

        case 'request-offer':
          // Viewer запрашивает offer от broadcaster
          if (clientType === 'viewer') {
            sendToBroadcaster(streamId, {
              type: 'request-offer',
              streamId,
            }, ws);
          }
          break;

        case 'answer':
          // WebRTC answer от viewer к broadcaster
          if (clientType === 'viewer') {
            sendToBroadcaster(streamId, {
              type: 'answer',
              answer: data.answer,
              clientId: data.clientId,
            }, ws);
          }
          break;

        case 'ice-candidate':
          // ICE candidate от любого клиента
          if (clientType === 'broadcaster') {
            // От broadcaster к viewers
            broadcastToViewers(streamId, {
              type: 'ice-candidate',
              candidate: data.candidate,
            }, ws);
          } else if (clientType === 'viewer') {
            // От viewer к broadcaster
            sendToBroadcaster(streamId, {
              type: 'ice-candidate',
              candidate: data.candidate,
              clientId: data.clientId,
            }, ws);
          }
          break;

        case 'chat':
          // Сообщение чата
          broadcastToRoom(streamId, {
            type: 'chat',
            message: data.message,
            author: data.author,
            timestamp: data.timestamp,
          }, ws);
          break;

        case 'reaction':
          // Реакция
          broadcastToRoom(streamId, {
            type: 'reaction',
            reaction: data.reaction,
            timestamp: data.timestamp,
          }, ws);
          break;

        default:
          console.log('Неизвестный тип сообщения:', data.type);
      }
    } catch (error) {
      console.error('Ошибка обработки сообщения:', error);
    }
  });

  ws.on('close', () => {
    console.log('Клиент отключился');
    if (streamId && rooms.has(streamId)) {
      rooms.get(streamId).delete(ws);
      if (rooms.get(streamId).size === 0) {
        rooms.delete(streamId);
      } else {
        // Уведомляем остальных о выходе
        const clientInfo = clientTypes.get(ws);
        if (clientInfo) {
          broadcastToRoom(streamId, {
            type: 'client-left',
            clientId: clientInfo.clientId,
            clientType: clientInfo.clientType,
          }, ws);
        }
      }
    }
    clientTypes.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket ошибка:', error);
  });
});

// Отправка сообщения всем viewers в комнате (кроме отправителя)
function broadcastToViewers(streamId, message, excludeWs = null) {
  if (!rooms.has(streamId)) return;

  const room = rooms.get(streamId);
  room.forEach((client) => {
    if (client !== excludeWs && client.readyState === 1) {
      const clientInfo = clientTypes.get(client);
      if (clientInfo && clientInfo.clientType === 'viewer') {
        client.send(JSON.stringify(message));
      }
    }
  });
}

// Отправка сообщения broadcaster в комнате
function sendToBroadcaster(streamId, message, excludeWs = null) {
  if (!rooms.has(streamId)) return;

  const room = rooms.get(streamId);
  room.forEach((client) => {
    if (client !== excludeWs && client.readyState === 1) {
      const clientInfo = clientTypes.get(client);
      if (clientInfo && clientInfo.clientType === 'broadcaster') {
        client.send(JSON.stringify(message));
      }
    }
  });
}

// Отправка сообщения всем в комнате (кроме отправителя)
function broadcastToRoom(streamId, message, excludeWs = null) {
  if (!rooms.has(streamId)) return;

  const room = rooms.get(streamId);
  room.forEach((client) => {
    if (client !== excludeWs && client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
}

server.listen(PORT, () => {
  console.log(`WebSocket signaling сервер запущен на порту ${PORT}`);
  console.log(`Подключение: ws://localhost:${PORT}`);
});

