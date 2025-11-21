import { create } from 'zustand';
import type { StreamState, Scene, Participant, Message, Poll, Reaction, Annotation, StreamRecording, TextBlock } from '../types';
import { mockParticipants, mockScenes, mockMessages, mockRecordings } from '../utils/mockData';

interface StoreState {
  // Scenes
  scenes: Scene[];
  activeSceneId: number;
  shouldCenterActiveScene: boolean;
  
  // Participants
  participants: Participant[];
  
  // Chat
  messages: Message[];
  
  // Stream
  streamState: StreamState;
  
  // Slides
  currentSlide: number;
  totalSlides: number;
  zoomLevel: number;
  
  // Polls
  activePoll: Poll | null;
  
  // Reactions
  reactions: Reaction[];
  
  // Annotations
  annotations: Annotation[];
  
  // Fullscreen
  isStreamFullscreen: boolean;
  
  // UI visibility
  showParticipants: boolean;
  showChat: boolean;
  showSpeakers: boolean;
  showScenesPanel: boolean; // Видимость панели сцен
  textMode: boolean; // Режим добавления текста
  
  // Navigation
  currentPage: 'landing' | 'studio';
  selectedTemplateName: string;
  
  // Recordings
  recordings: StreamRecording[];
  
  // Participants on air (participantId -> sceneId[])
  participantsOnAir: Record<number, number[]>;
  
  // Expanded participant on scene (sceneId -> participantId | null)
  expandedParticipantOnScene: Record<number, number | null>;
  
  // Participant positions on scene (sceneId -> { participantId: { x, y } })
  participantPositions: Record<number, Record<number, { x: number; y: number }>>;
  
  // Text blocks on scenes (sceneId -> TextBlock[])
  sceneTextBlocks: Record<number, TextBlock[]>;
  editingTextBlockId: string | null;
}

interface StoreActions {
  // Scene actions
  setActiveScene: (sceneId: number) => void;
  centerActiveScene: () => void;
  addScene: (scene: Scene) => void;
  insertScene: (scene: Scene, index: number) => void;
  updateScene: (sceneId: number, updates: Partial<Scene>) => void;
  removeScene: (sceneId: number) => void;
  moveScene: (sceneId: number, direction: 'left' | 'right') => void;
  
  // Participant actions
  addParticipant: (participant: Participant) => void;
  updateParticipant: (id: number, updates: Partial<Participant>) => void;
  removeParticipant: (id: number) => void;
  setParticipantOnAir: (participantId: number, sceneId: number | null) => void;
  setExpandedParticipantOnScene: (sceneId: number, participantId: number | null) => void;
  setParticipantPosition: (sceneId: number, participantId: number, position: { x: number; y: number }) => void;
  
  // Text block actions
  addTextBlock: (sceneId: number, textBlock: Omit<TextBlock, 'id'>) => void;
  updateTextBlock: (sceneId: number, textBlockId: string, updates: Partial<TextBlock>) => void;
  removeTextBlock: (sceneId: number, textBlockId: string) => void;
  setEditingTextBlock: (textBlockId: string | null) => void;
  
  // Chat actions
  addMessage: (message: Omit<Message, 'id' | 'time'>) => void;
  
  // Stream actions
  startStream: () => void;
  stopStream: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  updateStreamTime: (time: number) => void;
  
  // Slide actions
  setCurrentSlide: (slide: number) => void;
  setTotalSlides: (count: number) => void;
  setZoomLevel: (zoom: number) => void;
  
  // Poll actions
  setActivePoll: (poll: Poll | null) => void;
  votePoll: (pollId: number, option: string) => void;
  
  // Reaction actions
  addReaction: (type: Reaction['type']) => void;
  
  // Annotation actions
  addAnnotation: (annotation: Annotation) => void;
  clearAnnotations: () => void;
  
  // Fullscreen actions
  setStreamFullscreen: (isFullscreen: boolean) => void;
  
  // UI visibility actions
  toggleParticipants: () => void;
  toggleChat: () => void;
  toggleSpeakers: () => void;
  toggleScenesPanel: () => void;
  setTextMode: (enabled: boolean) => void;
  
  // Navigation actions
  setCurrentPage: (page: 'landing' | 'studio') => void;
  setSelectedTemplateName: (name: string) => void;
  
  // Recording actions
  addRecording: (recording: StreamRecording) => void;
}

export const useStreamStore = create<StoreState & StoreActions>((set) => ({
          // Initial state
          scenes: mockScenes,
          activeSceneId: 1,
          shouldCenterActiveScene: false,
          participants: mockParticipants,
  messages: mockMessages,
  streamState: {
    isStreaming: false,
    isRecording: false,
    currentTime: 0,
  },
  currentSlide: 1,
  totalSlides: 7,
  zoomLevel: 100,
  activePoll: null,
  reactions: [],
  annotations: [],
  isStreamFullscreen: false,
          showParticipants: true,
          showChat: false,
          showSpeakers: false,
          showScenesPanel: true,
          textMode: false,
          currentPage: 'landing',
  selectedTemplateName: 'Моя трансляция',
  recordings: mockRecordings,
          participantsOnAir: {},
          expandedParticipantOnScene: {},
          participantPositions: {},
          sceneTextBlocks: {},
          editingTextBlockId: null,
  
  // Scene actions
          setActiveScene: (sceneId: number) => {
            set({ activeSceneId: sceneId });
          },
          centerActiveScene: () => {
            set({ shouldCenterActiveScene: true });
            // Сбрасываем флаг сразу, чтобы он сработал при следующем рендере
            setTimeout(() => set({ shouldCenterActiveScene: false }), 0);
          },
  
  addScene: (scene: Scene) => {
    set((state) => ({
      scenes: [...state.scenes, scene],
    }));
  },
  insertScene: (scene: Scene, index: number) => {
    set((state) => {
      const newScenes = [...state.scenes];
      newScenes.splice(index, 0, scene);
      return {
        scenes: newScenes,
      };
    });
  },
  
  updateScene: (sceneId: number, updates: Partial<Scene>) => {
    set((state) => ({
      scenes: state.scenes.map((s) =>
        s.id === sceneId ? { ...s, ...updates } : s
      ),
    }));
  },
  
  removeScene: (sceneId: number) => {
    set((state) => {
      const newScenes = state.scenes.filter((s) => s.id !== sceneId);
      // Если удаляемая сцена была активной, переключаемся на предыдущую
      let newActiveSceneId = state.activeSceneId;
      if (state.activeSceneId === sceneId) {
        const deletedIndex = state.scenes.findIndex((s) => s.id === sceneId);
        if (deletedIndex > 0) {
          // Выбираем предыдущую сцену
          newActiveSceneId = state.scenes[deletedIndex - 1].id;
        } else if (newScenes.length > 0) {
          // Если удалена первая сцена, выбираем первую из оставшихся
          newActiveSceneId = newScenes[0].id;
        } else {
          newActiveSceneId = 1;
        }
      }
      
      // Удаляем удаленную сцену из массивов всех участников
      const newParticipantsOnAir: Record<number, number[]> = {};
      for (const participantId in state.participantsOnAir) {
        const scenes = state.participantsOnAir[participantId].filter(id => id !== sceneId);
        if (scenes.length > 0) {
          newParticipantsOnAir[participantId] = scenes;
        }
      }
      
      // Также убираем из развернутых, если сцена была развернута
      const newExpanded = { ...state.expandedParticipantOnScene };
      delete newExpanded[sceneId];
      
      return {
        scenes: newScenes,
        activeSceneId: newActiveSceneId,
        participantsOnAir: newParticipantsOnAir,
        expandedParticipantOnScene: newExpanded,
      };
    });
  },
  moveScene: (sceneId: number, direction: 'left' | 'right') => {
    set((state) => {
      const currentIndex = state.scenes.findIndex(s => s.id === sceneId);
      if (currentIndex === -1) return state;
      
      const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= state.scenes.length) return state;
      
      const newScenes = [...state.scenes];
      [newScenes[currentIndex], newScenes[newIndex]] = [newScenes[newIndex], newScenes[currentIndex]];
      
      return { scenes: newScenes };
    });
  },
  
  // Participant actions
  addParticipant: (participant: Participant) => {
    set((state) => ({
      participants: [...state.participants, participant],
    }));
  },
  
  updateParticipant: (id: number, updates: Partial<Participant>) => {
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  },
  
  removeParticipant: (id: number) => {
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== id),
    }));
  },
  setParticipantOnAir: (participantId: number, sceneId: number | null) => {
    set((state) => {
      if (sceneId === null) {
        // Удаляем участника со всех сцен
        const { [participantId]: _, ...rest } = state.participantsOnAir;
        // Также убираем из развернутых, если он был развернут
        const newExpanded = { ...state.expandedParticipantOnScene };
        for (const sId in newExpanded) {
          if (newExpanded[sId] === participantId) {
            newExpanded[sId] = null;
          }
        }
        return {
          participantsOnAir: rest,
          expandedParticipantOnScene: newExpanded,
        };
      } else {
        // Добавляем участника на сцену (или убираем, если уже там)
        const currentScenes = state.participantsOnAir[participantId] || [];
        const isOnScene = currentScenes.includes(sceneId);
        
        if (isOnScene) {
          // Убираем со сцены
          const newScenes = currentScenes.filter(id => id !== sceneId);
          if (newScenes.length === 0) {
            const { [participantId]: _, ...rest } = state.participantsOnAir;
            return { participantsOnAir: rest };
          } else {
            return {
              participantsOnAir: {
                ...state.participantsOnAir,
                [participantId]: newScenes,
              },
            };
          }
        } else {
          // Добавляем на сцену
          return {
            participantsOnAir: {
              ...state.participantsOnAir,
              [participantId]: [...currentScenes, sceneId],
            },
          };
        }
      }
    });
  },
  setExpandedParticipantOnScene: (sceneId: number, participantId: number | null) => {
    set((state) => ({
      expandedParticipantOnScene: {
        ...state.expandedParticipantOnScene,
        [sceneId]: participantId,
      },
    }));
  },
  setParticipantPosition: (sceneId: number, participantId: number, position: { x: number; y: number }) => {
    set((state) => ({
      participantPositions: {
        ...state.participantPositions,
        [sceneId]: {
          ...(state.participantPositions[sceneId] || {}),
          [participantId]: position,
        },
      },
    }));
  },
  
  // Text block actions
  addTextBlock: (sceneId: number, textBlock: Omit<TextBlock, 'id'>) => {
    set((state) => {
      const newTextBlock: TextBlock = {
        ...textBlock,
        id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      return {
        sceneTextBlocks: {
          ...state.sceneTextBlocks,
          [sceneId]: [...(state.sceneTextBlocks[sceneId] || []), newTextBlock],
        },
        editingTextBlockId: newTextBlock.id,
      };
    });
  },
  updateTextBlock: (sceneId: number, textBlockId: string, updates: Partial<TextBlock>) => {
    set((state) => {
      const blocks = state.sceneTextBlocks[sceneId] || [];
      return {
        sceneTextBlocks: {
          ...state.sceneTextBlocks,
          [sceneId]: blocks.map(block => 
            block.id === textBlockId ? { ...block, ...updates } : block
          ),
        },
      };
    });
  },
  removeTextBlock: (sceneId: number, textBlockId: string) => {
    set((state) => {
      const blocks = state.sceneTextBlocks[sceneId] || [];
      return {
        sceneTextBlocks: {
          ...state.sceneTextBlocks,
          [sceneId]: blocks.filter(block => block.id !== textBlockId),
        },
        editingTextBlockId: state.editingTextBlockId === textBlockId ? null : state.editingTextBlockId,
      };
    });
  },
  setEditingTextBlock: (textBlockId: string | null) => {
    set({ editingTextBlockId: textBlockId });
  },
  
  // Chat actions
  addMessage: (message: Omit<Message, 'id' | 'time'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now(),
      time: new Date().toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },
  
  // Stream actions
  startStream: () => {
    set((state) => ({
      streamState: {
        ...state.streamState,
        isStreaming: true,
        startTime: new Date(),
        currentTime: 0,
      },
    }));
  },
  
  stopStream: () => {
    set((state) => ({
      streamState: {
        ...state.streamState,
        isStreaming: false,
      },
    }));
  },
  
  startRecording: () => {
    set((state) => ({
      streamState: {
        ...state.streamState,
        isRecording: true,
      },
    }));
  },
  
  stopRecording: () => {
    set((state) => ({
      streamState: {
        ...state.streamState,
        isRecording: false,
      },
    }));
  },
  
  updateStreamTime: (time: number) => {
    set((state) => ({
      streamState: {
        ...state.streamState,
        currentTime: time,
      },
    }));
  },
  
  // Slide actions
  setCurrentSlide: (slide: number) => {
    set({ currentSlide: slide });
  },
  
  setTotalSlides: (count: number) => {
    set({ totalSlides: count });
  },
  
  setZoomLevel: (zoom: number) => {
    set({ zoomLevel: zoom });
  },
  
  // Poll actions
  setActivePoll: (poll: Poll | null) => {
    set({ activePoll: poll });
  },
  
  votePoll: (pollId: number, option: string) => {
    set((state) => {
      if (!state.activePoll || state.activePoll.id !== pollId) return state;
      
      const updatedPoll = {
        ...state.activePoll,
        votes: {
          ...state.activePoll.votes,
          [option]: (state.activePoll.votes[option] || 0) + 1,
        },
      };
      
      return { activePoll: updatedPoll };
    });
  },
  
  // Reaction actions
  addReaction: (type: Reaction['type']) => {
    const newReaction: Reaction = {
      id: `reaction-${Date.now()}-${Math.random()}`,
      type,
      count: 1,
      timestamp: new Date(),
    };
    
    set((state) => ({
      reactions: [...state.reactions, newReaction],
    }));
    
    // Remove reaction after animation (3 seconds)
    setTimeout(() => {
      set((state) => ({
        reactions: state.reactions.filter((r) => r.id !== newReaction.id),
      }));
    }, 3000);
  },
  
  // Annotation actions
  addAnnotation: (annotation: Annotation) => {
    set((state) => ({
      annotations: [...state.annotations, annotation],
    }));
  },
  
  clearAnnotations: () => {
    set({ annotations: [] });
  },
  
  // Fullscreen actions
  setStreamFullscreen: (isFullscreen: boolean) => {
    set({ isStreamFullscreen: isFullscreen });
  },
  
  // UI visibility actions
  toggleParticipants: () => {
    set((state) => ({ showParticipants: !state.showParticipants }));
  },
  
  toggleChat: () => {
    set((state) => ({ showChat: !state.showChat }));
  },
          toggleSpeakers: () => {
            set((state) => ({ showSpeakers: !state.showSpeakers }));
          },
          toggleScenesPanel: () => {
            set((state) => ({ showScenesPanel: !state.showScenesPanel }));
          },
          setTextMode: (enabled: boolean) => {
            set({ textMode: enabled });
          },
  
  // Navigation actions
  setCurrentPage: (page: 'landing' | 'studio') => {
    set({ currentPage: page });
  },
  setSelectedTemplateName: (name: string) => {
    set({ selectedTemplateName: name });
  },
  
  // Recording actions
  addRecording: (recording: StreamRecording) => {
    set((state) => ({
      recordings: [recording, ...state.recordings],
    }));
  },
}));

