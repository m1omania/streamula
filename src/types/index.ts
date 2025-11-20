export type ParticipantRole = 'moderator' | 'speaker' | 'participant';

export interface Participant {
  id: number;
  name: string;
  role: ParticipantRole;
  video: boolean;
  audio: boolean;
  avatar?: string;
  platform?: string;
  stream?: MediaStream;
}

export type SceneType = 'text' | 'image' | 'blank' | 'template' | 'presentation';

export interface Scene {
  id: number;
  name: string;
  type: SceneType;
  thumbnail?: string;
  pdfUrl?: string;
  slideCount?: number;
  backgroundColor?: string; // Цвет или градиент для фона
  backgroundPattern?: string; // Тип паттерна (lines, dots, circles, stripes)
}

export interface Message {
  id: number;
  author: string;
  text: string;
  time: string;
  avatar?: string;
}

export interface Poll {
  id: number;
  question: string;
  options: string[];
  votes: Record<string, number>;
  isActive: boolean;
  endTime?: Date;
}

export interface Reaction {
  id: string;
  type: '👍' | '❤️' | '😂' | '👏';
  count: number;
  timestamp: Date;
}

export interface StreamState {
  isStreaming: boolean;
  isRecording: boolean;
  startTime?: Date;
  currentTime: number; // seconds
}

export interface Annotation {
  id: string;
  type: 'line' | 'marker' | 'arrow';
  points: Array<{ x: number; y: number }>;
  color: string;
}

export type StreamTemplateType = 
  | 'webinar'
  | 'open-stream'
  | 'corporate'
  | 'educational'
  | 'meeting'
  | 'product-presentation'
  | 'ama'
  | 'private'
  | 'multi-platform'
  | 'hr-training'
  | 'blank';

export interface StreamTemplate {
  id: string;
  type: StreamTemplateType;
  name: string;
  description: string;
  icon: string;
  features: string[];
  color: string;
}

export interface StreamRecording {
  id: string;
  title: string;
  thumbnail?: string;
  duration: number; // seconds
  createdAt: Date;
  views: number;
  templateType: StreamTemplateType;
  status: 'completed' | 'processing' | 'failed';
}

export interface StreamStore {
  // Scenes
  scenes: Scene[];
  activeSceneId: number;
  setActiveScene: (sceneId: number) => void;
  addScene: (scene: Scene) => void;
  
  // Participants
  participants: Participant[];
  addParticipant: (participant: Participant) => void;
  updateParticipant: (id: number, updates: Partial<Participant>) => void;
  removeParticipant: (id: number) => void;
  
  // Chat
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'time'>) => void;
  
  // Stream
  streamState: StreamState;
  startStream: () => void;
  stopStream: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  updateStreamTime: (time: number) => void;
  
  // Slides
  currentSlide: number;
  totalSlides: number;
  setCurrentSlide: (slide: number) => void;
  setTotalSlides: (count: number) => void;
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  
  // Polls
  activePoll: Poll | null;
  setActivePoll: (poll: Poll | null) => void;
  votePoll: (pollId: number, option: string) => void;
  
  // Reactions
  reactions: Reaction[];
  addReaction: (type: Reaction['type']) => void;
  
  // Annotations
  annotations: Annotation[];
  addAnnotation: (annotation: Annotation) => void;
  clearAnnotations: () => void;
  
  // Navigation
  currentPage: 'landing' | 'studio';
  setCurrentPage: (page: 'landing' | 'studio') => void;
  
  // Recordings
  recordings: StreamRecording[];
  addRecording: (recording: StreamRecording) => void;
}

