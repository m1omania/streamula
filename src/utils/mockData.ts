import type { Participant, Scene, Message, StreamRecording } from '../types';

export const mockParticipants: Participant[] = [
  {
    id: 1,
    name: 'Андрей Реуцкий',
    role: 'moderator',
    video: true,
    audio: true,
    avatar: 'АР',
    platform: 'streamula',
  },
  {
    id: 2,
    name: 'Мария Иванова',
    role: 'speaker',
    video: true,
    audio: true,
    avatar: 'МИ',
    platform: 'streamula',
  },
  {
    id: 3,
    name: 'Иван Петров',
    role: 'participant',
    video: false,
    audio: true,
    avatar: 'ИП',
    platform: 'streamula',
  },
  {
    id: 4,
    name: 'Елена Смирнова',
    role: 'speaker',
    video: true,
    audio: true,
    avatar: 'ЕС',
    platform: 'streamula',
  },
  {
    id: 5,
    name: 'Дмитрий Козлов',
    role: 'participant',
    video: true,
    audio: false,
    avatar: 'ДК',
    platform: 'streamula',
  },
  {
    id: 6,
    name: 'Анна Волкова',
    role: 'speaker',
    video: false,
    audio: true,
    avatar: 'АВ',
    platform: 'streamula',
  },
];

export const mockScenes: Scene[] = [
  {
    id: 1,
    name: 'Сцена 1',
    type: 'blank',
    thumbnail: '',
  },
];

export const mockMessages: Message[] = [
  {
    id: 1,
    author: 'Гость 2',
    text: 'привет',
    time: '22:24',
    avatar: 'Г2',
  },
];

export const getInitials = (name: string): string => {
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const getRandomColor = (seed: string): string => {
  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#ef4444', '#f59e0b', '#10b981', '#06b6d4',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Создаем SVG обложки для записей
const createMeetingThumbnail = (): string => {
  const svg = `<svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="meetingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#7C3AED;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="225" fill="url(#meetingGrad)"/>
    <!-- Сетка видеоконференции -->
    <g opacity="0.3">
      <rect x="50" y="30" width="80" height="60" fill="white" rx="4"/>
      <rect x="160" y="30" width="80" height="60" fill="white" rx="4"/>
      <rect x="270" y="30" width="80" height="60" fill="white" rx="4"/>
      <rect x="50" y="110" width="80" height="60" fill="white" rx="4"/>
      <rect x="160" y="110" width="80" height="60" fill="white" rx="4"/>
      <rect x="270" y="110" width="80" height="60" fill="white" rx="4"/>
    </g>
    <text x="200" y="190" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="bold">Встреча</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const createWebinarThumbnail = (): string => {
  const svg = `<svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="webinarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#10B981;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="225" fill="url(#webinarGrad)"/>
    <!-- Иконка книги/обучения -->
    <g opacity="0.4" transform="translate(150, 60)">
      <rect x="0" y="20" width="100" height="80" fill="white" rx="2"/>
      <line x1="20" y1="30" x2="80" y2="30" stroke="white" stroke-width="2"/>
      <line x1="20" y1="45" x2="80" y2="45" stroke="white" stroke-width="2"/>
      <line x1="20" y1="60" x2="80" y2="60" stroke="white" stroke-width="2"/>
      <line x1="20" y1="75" x2="60" y2="75" stroke="white" stroke-width="2"/>
    </g>
    <text x="200" y="190" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="bold">Вебинар</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const createProductThumbnail = (): string => {
  const svg = `<svg width="400" height="225" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="productGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#EC4899;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#F43F5E;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="400" height="225" fill="url(#productGrad)"/>
    <!-- Иконка ракеты/презентации -->
    <g opacity="0.4" transform="translate(160, 50)">
      <path d="M40 80 L40 20 L20 20 L20 0 L60 0 L60 20 L40 20 Z" fill="white"/>
      <polygon points="30,80 50,80 40,100" fill="white"/>
      <circle cx="40" cy="40" r="8" fill="white"/>
    </g>
    <text x="200" y="190" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" font-weight="bold">Продукт</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const mockRecordings: StreamRecording[] = [
  {
    id: 'rec-1',
    title: 'Встреча команды: Планирование Q2 2024',
    thumbnail: createMeetingThumbnail(),
    duration: 3240, // 54 минуты
    createdAt: new Date('2024-03-15'),
    views: 24,
    templateType: 'meeting',
    status: 'completed',
  },
  {
    id: 'rec-2',
    title: 'Онлайн-вебинар: Введение в React и TypeScript',
    thumbnail: createWebinarThumbnail(),
    duration: 5400, // 90 минут
    createdAt: new Date('2024-03-10'),
    views: 156,
    templateType: 'educational',
    status: 'completed',
  },
  {
    id: 'rec-3',
    title: 'Презентация нового продукта Streamula Pro',
    thumbnail: createProductThumbnail(),
    duration: 1800, // 30 минут
    createdAt: new Date('2024-03-05'),
    views: 89,
    templateType: 'product-presentation',
    status: 'completed',
  },
];

