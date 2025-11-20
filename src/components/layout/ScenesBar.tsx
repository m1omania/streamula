import React, { useState, useRef, useEffect } from 'react';
import { useStreamStore } from '../../stores/useStreamStore';
import { Plus, Trash2, Maximize, ArrowRightLeft, Image, ArrowLeft, ArrowRight, Copy, Sparkles, Radio } from 'lucide-react';
import type { Scene, Participant } from '../../types';
import { getInitials, getRandomColor } from '../../utils/mockData';
import { BackgroundModal } from '../modals/BackgroundModal';

// Компонент для отображения спикера на сцене
const SceneParticipant = ({ 
  participant, 
  index, 
  sceneId: _sceneId, 
  isExpanded, 
  onExpand,
  position,
  onPositionChange
}: { 
  participant: Participant; 
  index: number;
  sceneId: number;
  isExpanded: boolean;
  onExpand: () => void;
  position?: { x: number; y: number };
  onPositionChange: (x: number, y: number) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);
  const hasVideo = participant.video && participant.stream;
  const initials = participant.avatar || getInitials(participant.name);
  const bgColor = getRandomColor(participant.name);
  const blockWidth = 200;
  const gap = 16;
  
  // Используем сохраненную позицию или вычисляем по умолчанию
  const defaultLeft = 16 + index * (blockWidth + gap);
  const defaultTop = 16;
  const left = position?.x ?? defaultLeft;
  const top = position?.y ?? defaultTop;

  useEffect(() => {
    if (videoRef.current && participant.stream && hasVideo) {
      videoRef.current.srcObject = participant.stream;
    }
  }, [participant.stream, hasVideo]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return; // Не перемещаем развернутые карточки
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    hasMovedRef.current = false; // Сбрасываем флаг перемещения
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current) {
        const parent = cardRef.current.parentElement;
        if (parent) {
          const parentRect = parent.getBoundingClientRect();
          const newX = e.clientX - parentRect.left - dragOffset.x;
          const newY = e.clientY - parentRect.top - dragOffset.y;
          
          // Проверяем, было ли реальное перемещение (больше 5px)
          const deltaX = Math.abs(newX - left);
          const deltaY = Math.abs(newY - top);
          if (deltaX > 5 || deltaY > 5) {
            hasMovedRef.current = true;
          }
          
          // Ограничиваем перемещение границами сцены
          const maxX = parentRect.width - blockWidth;
          const maxY = parentRect.height - (cardRef.current.offsetHeight || 112);
          const constrainedX = Math.max(0, Math.min(newX, maxX));
          const constrainedY = Math.max(0, Math.min(newY, maxY));
          
          onPositionChange(constrainedX, constrainedY);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Небольшая задержка перед сбросом флага, чтобы onClick не сработал
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 100);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onPositionChange, blockWidth]);

  if (isExpanded) {
    // Развернутый спикер на всю сцену
    return (
      <div 
        className="absolute inset-0 rounded-2xl overflow-hidden z-10 cursor-pointer"
        onClick={onExpand}
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={!participant.audio}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: bgColor }}
          >
            {initials}
          </div>
        )}
        {/* Имя спикера на развернутом блоке */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <span className="text-sm font-medium text-white">{participant.name}</span>
        </div>
      </div>
    );
  }

  // Маленький блок спикера
  return (
    <div 
      ref={cardRef}
      className="absolute w-[200px] aspect-video rounded-lg overflow-hidden border-2 border-accent-purple shadow-lg z-20"
      style={{ 
        left: `${left}px`,
        top: `${top}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        // Предотвращаем клик, если было перемещение
        if (hasMovedRef.current) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (!isDragging) {
          onExpand();
        }
      }}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!participant.audio}
          className="w-full h-full object-cover"
        />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center text-white text-xl font-bold"
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      )}
      {/* Имя спикера на блоке */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <span className="text-xs font-medium text-white">{participant.name}</span>
      </div>
    </div>
  );
};

export const ScenesBar = () => {
  const { scenes, activeSceneId, setActiveScene, updateScene, addScene, insertScene, removeScene, moveScene, isStreamFullscreen, setStreamFullscreen, participants, participantsOnAir, setParticipantOnAir, expandedParticipantOnScene, setExpandedParticipantOnScene, participantPositions, setParticipantPosition, streamState, startStream, stopStream, shouldCenterActiveScene } = useStreamStore();
  const [backgroundModalOpen, setBackgroundModalOpen] = useState<number | null>(null);
  const [backgroundModalPosition, setBackgroundModalPosition] = useState<{ x: number; y: number } | null>(null);
  
  // В полноэкранном режиме показываем только активную сцену
  const displayedScenes = isStreamFullscreen 
    ? scenes.filter(s => s.id === activeSceneId)
    : scenes;
  const [editingSceneId, setEditingSceneId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (editingSceneId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingSceneId]);

  // Прокрутка к активной сцене
  useEffect(() => {
    if (!isStreamFullscreen && activeSceneId && sceneRefs.current[activeSceneId] && scrollContainerRef.current) {
      // Небольшая задержка для того, чтобы DOM обновился
      setTimeout(() => {
        const sceneElement = sceneRefs.current[activeSceneId];
        if (sceneElement && scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          const sceneRect = sceneElement.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const scrollLeft = container.scrollLeft;
          const sceneCenter = sceneRect.left - containerRect.left + scrollLeft + sceneRect.width / 2;
          const containerCenter = containerRect.width / 2;
          const targetScroll = sceneCenter - containerCenter;
          
          container.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [activeSceneId, isStreamFullscreen, scenes.length, shouldCenterActiveScene]);

  const handleNameClick = (e: React.MouseEvent, sceneId: number) => {
    e.stopPropagation();
    const scene = scenes.find(s => s.id === sceneId);
    if (scene) {
      setEditValue(scene.name || `Сцена ${sceneId}`);
      setEditingSceneId(sceneId);
    }
  };

  const handleSave = (sceneId: number) => {
    if (editValue.trim()) {
      updateScene(sceneId, { name: editValue.trim() });
    }
    setEditingSceneId(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, sceneId: number) => {
    if (e.key === 'Enter') {
      handleSave(sceneId);
    } else if (e.key === 'Escape') {
      setEditingSceneId(null);
      setEditValue('');
    }
  };

  const handleAddScene = () => {
    const newId = Math.max(...scenes.map(s => s.id), 0) + 1;
    const newScene: Scene = {
      id: newId,
      name: `Сцена ${newId}`,
      type: 'blank',
      thumbnail: '',
    };
    addScene(newScene);
    setActiveScene(newId);
  };

  const toggleFullscreen = () => {
    setStreamFullscreen(!isStreamFullscreen);
  };

  // Компонент для кнопок действий над сценой
  const SceneActionButtons = ({ scene }: { scene: Scene }) => {
    return (
      <div className="flex items-center gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            setBackgroundModalPosition({
              x: rect.left,
              y: rect.bottom + 8, // 8px отступ под кнопкой
            });
            setBackgroundModalOpen(scene.id);
          }}
          className="w-6 h-6 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-400 hover:text-white flex items-center justify-center transition-colors duration-150 flex-shrink-0"
          title="Добавить фон"
        >
          <Image size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            moveScene(scene.id, 'left');
          }}
          disabled={scenes.findIndex(s => s.id === scene.id) === 0}
          className="w-6 h-6 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-400 hover:text-white flex items-center justify-center transition-colors duration-150 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Переместить влево"
        >
          <ArrowLeft size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            moveScene(scene.id, 'right');
          }}
          disabled={scenes.findIndex(s => s.id === scene.id) === scenes.length - 1}
          className="w-6 h-6 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-400 hover:text-white flex items-center justify-center transition-colors duration-150 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Переместить вправо"
        >
          <ArrowRight size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Дублировать сцену
            const newId = Math.max(...scenes.map(s => s.id), 0) + 1;
            const duplicatedScene: Scene = {
              id: newId,
              name: `${scene.name} (копия)`,
              type: scene.type,
              thumbnail: scene.thumbnail,
            };
            const currentIndex = scenes.findIndex(s => s.id === scene.id);
            insertScene(duplicatedScene, currentIndex + 1);
            setActiveScene(newId);
          }}
          className="w-6 h-6 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-400 hover:text-white flex items-center justify-center transition-colors duration-150 flex-shrink-0"
          title="Дублировать сцену"
        >
          <Copy size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // TODO: AI подбор картинки
            console.log('AI подбор картинки для сцены', scene.id);
          }}
          className="w-6 h-6 rounded-lg bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-400 hover:text-white flex items-center justify-center transition-colors duration-150 flex-shrink-0"
          title="Подобрать картинку (AI)"
        >
          <Sparkles size={12} />
        </button>
        {/* Delete button - только если сцен больше одной */}
        {scenes.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeScene(scene.id);
            }}
            className="w-6 h-6 rounded-lg bg-[#2a2a2a] hover:bg-red-600 text-gray-400 hover:text-white flex items-center justify-center transition-colors duration-150 flex-shrink-0"
            title="Удалить сцену"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {isStreamFullscreen ? (
        // Полноэкранный режим - сцена на весь экран
        <div className="w-full h-full">
          {displayedScenes.map((scene) => (
            <div
              key={scene.id}
              className="w-full h-full relative"
            >
              {/* Scene Preview - на весь экран */}
              <div 
                className="w-full h-full relative"
                onClick={() => setActiveScene(scene.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.cursor = 'grabbing';
                  }
                }}
                onDragLeave={(e) => {
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.cursor = '';
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.cursor = '';
                  }
                  const participantId = parseInt(e.dataTransfer.getData('participantId'));
                  if (participantId && !isNaN(participantId)) {
                    setParticipantOnAir(participantId, scene.id);
                  }
                }}
              >
                        <div
                          className="w-full h-full transition-all duration-150 relative"
                          style={{
                            backgroundColor: scene.backgroundColor && !scene.backgroundColor.includes('gradient')
                              ? scene.backgroundColor
                              : '#2a2a2a',
                            background: scene.backgroundColor && scene.backgroundColor.includes('gradient') 
                              ? scene.backgroundColor 
                              : undefined,
                            backgroundImage: scene.backgroundPattern === 'lines' 
                              ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)'
                              : scene.backgroundPattern === 'dots'
                              ? 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)'
                              : scene.backgroundPattern === 'circles'
                              ? 'radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)'
                              : scene.backgroundPattern === 'stripes'
                              ? 'repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 16px)'
                              : undefined,
                            backgroundSize: scene.backgroundPattern === 'dots' ? '10px 10px' : scene.backgroundPattern === 'circles' ? '15px 15px' : undefined,
                            border: '1px solid #3a3a3a',
                          }}
                        >
                  {/* Спикеры в эфире на этой сцене (полноэкранный режим) */}
                  {(() => {
                    const sceneSpeakers = participants.filter(p => {
                      const participantScenes = participantsOnAir[p.id] || [];
                      return participantScenes.includes(scene.id);
                    });
                    const expandedId = expandedParticipantOnScene[scene.id];
                    const scenePositions = participantPositions[scene.id] || {};
                    return sceneSpeakers.map((participant, index) => {
                      const isExpanded = expandedId === participant.id;
                      return (
                        <SceneParticipant 
                          key={participant.id} 
                          participant={participant} 
                          index={isExpanded ? 0 : index}
                          sceneId={scene.id}
                          isExpanded={isExpanded}
                          position={scenePositions[participant.id]}
                          onPositionChange={(x, y) => {
                            setParticipantPosition(scene.id, participant.id, { x, y });
                          }}
                          onExpand={() => {
                            setExpandedParticipantOnScene(scene.id, isExpanded ? null : participant.id);
                          }}
                        />
                      );
                    });
                  })()}
                </div>
                {/* Fullscreen button - правый нижний угол сцены */}
                {activeSceneId === scene.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors duration-150 flex items-center justify-center z-10"
                    title={isStreamFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
                  >
                    <Maximize size={20} className="text-white" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Обычный режим
        <div 
          ref={scrollContainerRef}
          className="w-full h-full pt-4 pb-6 overflow-x-auto overflow-y-visible scroll-smooth snap-x snap-mandatory"
        >
          <div className="flex items-center min-h-full pl-[calc(50vw-480px)] pr-[calc(50vw-480px)]">
            <div className="flex items-center gap-8 relative">
            {displayedScenes.map((scene, sceneIndex) => (
              <React.Fragment key={scene.id}>
                {/* Иконки между сценами */}
                {sceneIndex > 0 && (
                  <div className="relative w-8 flex items-center justify-center group">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30 pointer-events-none">
                      <div className="flex flex-col items-center gap-2 pointer-events-auto">
                      <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const newId = Math.max(...scenes.map(s => s.id), 0) + 1;
                        const newScene: Scene = {
                          id: newId,
                          name: `Сцена ${newId}`,
                          type: 'blank',
                          thumbnail: '',
                        };
                        // Вставляем сцену перед текущей сценой
                        const currentSceneIndex = scenes.findIndex(s => s.id === scene.id);
                        insertScene(newScene, currentSceneIndex);
                        setActiveScene(newId);
                      }}
                        className="w-10 h-10 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-border flex items-center justify-center transition-colors duration-150"
                        title="Добавить сцену между"
                      >
                        <Plus size={20} className="text-text-muted" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Открыть модальное окно для настройки перехода
                          console.log('Настройка перехода между сценами');
                        }}
                        className="w-10 h-10 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-border flex items-center justify-center transition-colors duration-150"
                        title="Настроить переход"
                      >
                        <ArrowRightLeft size={20} className="text-text-muted" />
                      </button>
                      </div>
                    </div>
                  </div>
                )}
                <div
                  ref={(el) => {
                    if (el) {
                      sceneRefs.current[scene.id] = el;
                    }
                  }}
                  className="flex flex-col cursor-pointer transition-all duration-150 w-[960px] flex-shrink-0 scroll-snap-align-center"
                >
              {/* Scene Name - скрыто в полноэкранном режиме */}
              {!isStreamFullscreen && (
                <div className="mb-3">
                  {editingSceneId === scene.id ? (
                    <div className="flex items-center justify-between gap-2 px-2">
                      <div className="flex items-center gap-2">
                        <input
                          ref={inputRef}
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleSave(scene.id)}
                          onKeyDown={(e) => handleKeyDown(e, scene.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm font-medium text-white text-left bg-transparent border-b border-accent-purple focus:outline-none w-[20ch]"
                        />
                      </div>
                      {/* Кнопка "В эфир" */}
                      {(() => {
                        const isActive = activeSceneId === scene.id;
                        const isStreaming = streamState.isStreaming && isActive;
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isStreaming) {
                                stopStream();
                              } else {
                                setActiveScene(scene.id);
                                startStream();
                              }
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-150 flex items-center gap-1.5 ${
                              isStreaming
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-[#2a2a2a] hover:bg-red-600 hover:text-white text-gray-400'
                            }`}
                            title={isStreaming ? 'Снять с эфира' : 'В эфир'}
                          >
                            <Radio size={12} />
                            <span>{isStreaming ? 'Снять с эфира' : 'В эфир'}</span>
                          </button>
                        );
                      })()}
                      <SceneActionButtons scene={scene} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 px-2">
                      <div
                        onClick={(e) => handleNameClick(e, scene.id)}
                        className="text-sm font-medium text-white text-left hover:text-accent-purple transition-colors duration-150 cursor-text flex items-center gap-2 flex-1"
                      >
                        <span>{scene.name || `Сцена ${scene.id}`}</span>
                      </div>
                      {/* Кнопка "В эфир" */}
                      {(() => {
                        const isActive = activeSceneId === scene.id;
                        const isStreaming = streamState.isStreaming && isActive;
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isStreaming) {
                                stopStream();
                              } else {
                                setActiveScene(scene.id);
                                startStream();
                              }
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-150 flex items-center gap-1.5 ${
                              isStreaming
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-[#2a2a2a] hover:bg-red-600 hover:text-white text-gray-400'
                            }`}
                            title={isStreaming ? 'Снять с эфира' : 'В эфир'}
                          >
                            <Radio size={12} />
                            <span>{isStreaming ? 'Снять с эфира' : 'В эфир'}</span>
                          </button>
                        );
                      })()}
                      <SceneActionButtons scene={scene} />
                    </div>
                  )}
                </div>
              )}
              
              {/* Scene Preview */}
              <div 
                className="w-full aspect-video relative overflow-visible transition-all duration-150"
                onClick={() => setActiveScene(scene.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  // Меняем курсор на "grabbing" при перетаскивании на сцену
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.cursor = 'grabbing';
                    const sceneDiv = e.currentTarget.querySelector('.scene-drop-zone');
                    if (sceneDiv instanceof HTMLElement) {
                      sceneDiv.style.borderColor = '#8b5cf6';
                      sceneDiv.style.borderWidth = '2px';
                    }
                  }
                }}
                onDragLeave={(e) => {
                  // Убираем визуальный эффект при уходе
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.cursor = '';
                    const sceneDiv = e.currentTarget.querySelector('.scene-drop-zone');
                    if (sceneDiv instanceof HTMLElement) {
                      sceneDiv.style.borderColor = '';
                      sceneDiv.style.borderWidth = '';
                    }
                  }
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  // Убираем визуальный эффект
                  if (e.currentTarget instanceof HTMLElement) {
                    e.currentTarget.style.cursor = '';
                    const sceneDiv = e.currentTarget.querySelector('.scene-drop-zone');
                    if (sceneDiv instanceof HTMLElement) {
                      sceneDiv.style.borderColor = '';
                      sceneDiv.style.borderWidth = '';
                    }
                  }
                  // Получаем ID спикера из данных перетаскивания
                  const participantId = parseInt(e.dataTransfer.getData('participantId'));
                  if (participantId && !isNaN(participantId)) {
                    setParticipantOnAir(participantId, scene.id);
                  }
                }}
              >
                <div
                  className={`scene-drop-zone w-full h-full rounded-2xl transition-all duration-150 ${
                    activeSceneId === scene.id && streamState.isStreaming
                      ? 'ring-2 ring-red-600'
                      : activeSceneId === scene.id
                      ? 'ring-2 ring-accent-purple'
                      : ''
                  }`}
                  style={{
                    backgroundColor: scene.backgroundColor && !scene.backgroundColor.includes('gradient')
                      ? scene.backgroundColor
                      : '#2a2a2a',
                    background: scene.backgroundColor && scene.backgroundColor.includes('gradient') 
                      ? scene.backgroundColor 
                      : undefined,
                    backgroundImage: scene.backgroundPattern === 'lines' 
                      ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)'
                      : scene.backgroundPattern === 'dots'
                      ? 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)'
                      : scene.backgroundPattern === 'circles'
                      ? 'radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)'
                      : scene.backgroundPattern === 'stripes'
                      ? 'repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 16px)'
                      : undefined,
                    backgroundSize: scene.backgroundPattern === 'dots' ? '10px 10px' : scene.backgroundPattern === 'circles' ? '15px 15px' : undefined,
                    border: activeSceneId === scene.id && streamState.isStreaming
                      ? '1px solid #dc2626'
                      : activeSceneId === scene.id
                      ? '2px solid #8b5cf6'
                      : '1px solid #3a3a3a',
                    boxShadow: activeSceneId === scene.id && streamState.isStreaming
                      ? '0 0 0 1px #dc2626, 0 0 0 2px #000'
                      : activeSceneId === scene.id
                      ? '0 0 0 2px #8b5cf6, 0 0 0 4px #000'
                      : 'none',
                  }}
                >
                  {(() => {
                    // Вычисляем список спикеров на сцене один раз
                    const sceneSpeakers = participants.filter(p => {
                      const participantScenes = participantsOnAir[p.id] || [];
                      return participantScenes.includes(scene.id);
                    });
                    
                    return (
                      <>
                        {/* Placeholder контент, если нет спикеров на сцене */}
                        {sceneSpeakers.length === 0 && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-0">
                            <p className="text-sm text-gray-400 text-center max-w-md">
                              Добавьте или Перетащите спикеров и контент, чтобы создать свою сцену
                            </p>
                          </div>
                        )}
                        
                        {/* Спикеры в эфире на этой сцене */}
                        {(() => {
                          const expandedId = expandedParticipantOnScene[scene.id];
                          const scenePositions = participantPositions[scene.id] || {};
                          return sceneSpeakers.map((participant, index) => {
                            const isExpanded = expandedId === participant.id;
                            return (
                              <SceneParticipant 
                                key={participant.id} 
                                participant={participant} 
                                index={isExpanded ? 0 : index}
                                sceneId={scene.id}
                                isExpanded={isExpanded}
                                position={scenePositions[participant.id]}
                                onPositionChange={(x, y) => {
                                  setParticipantPosition(scene.id, participant.id, { x, y });
                                }}
                                onExpand={() => {
                                  setExpandedParticipantOnScene(scene.id, isExpanded ? null : participant.id);
                                }}
                              />
                            );
                          });
                        })()}
                      </>
                    );
                  })()}
                </div>
                {/* Fullscreen button - правый нижний угол сцены */}
                {activeSceneId === scene.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors duration-150 flex items-center justify-center z-10"
                    title="Полноэкранный режим"
                  >
                    <Maximize size={20} className="text-white" />
                  </button>
                )}
              </div>
            </div>
              </React.Fragment>
            ))}
          
            {/* Add Scene Button - иконка плюс справа */}
            <button
              onClick={handleAddScene}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-[#1a1a1a] hover:bg-[#2a2a2a] transition-colors duration-150 flex-shrink-0 z-10 relative"
              title="Новая сцена"
            >
              <Plus size={32} className="text-text-muted" />
            </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Background Modal */}
      {backgroundModalOpen !== null && backgroundModalPosition && (
        <BackgroundModal 
          open={backgroundModalOpen !== null} 
          onOpenChange={(open) => {
            if (!open) {
              setBackgroundModalOpen(null);
              setBackgroundModalPosition(null);
            }
          }}
          sceneId={backgroundModalOpen}
          position={backgroundModalPosition}
        />
      )}
    </>
  );
};

