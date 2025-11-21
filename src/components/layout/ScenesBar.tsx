import React, { useState, useRef, useEffect } from 'react';
import { useStreamStore } from '../../stores/useStreamStore';
import { Plus, Trash2, Maximize, ArrowRightLeft, Image, Copy, Sparkles, Radio, LayoutDashboard, LayoutGrid, LayoutPanelLeft, LayoutPanelTop, LayoutTemplate } from 'lucide-react';
import type { Scene, Participant } from '../../types';
import { getInitials, getRandomColor } from '../../utils/mockData';
import { BackgroundModal } from '../modals/BackgroundModal';
import { TextBlockComponent } from '../scene/TextBlock';
import { ContextMenu } from '../scene/ContextMenu';

// Компонент для отображения спикера на сцене
const SceneParticipant = ({ 
  participant, 
  index, 
  sceneId: _sceneId, 
  isExpanded, 
  onExpand,
  position,
  onPositionChange,
  onSelect
}: { 
  participant: Participant; 
  index: number;
  sceneId: number;
  isExpanded: boolean;
  onExpand: () => void;
  position?: { x: number; y: number };
  onPositionChange: (x: number, y: number) => void;
  onSelect?: () => void;
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
    // Не обрабатываем правый клик
    if (e.button === 2) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    hasMovedRef.current = false; // Сбрасываем флаг перемещения
    if (cardRef.current) {
      // Находим правильный родитель - .scene-drop-zone
      const sceneDropZone = cardRef.current.closest('.scene-drop-zone') as HTMLElement;
      if (sceneDropZone) {
        const parentRect = sceneDropZone.getBoundingClientRect();
        // Вычисляем смещение точки клика относительно родителя
        setDragOffset({
          x: e.clientX - parentRect.left - left,
          y: e.clientY - parentRect.top - top,
        });
      }
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (cardRef.current) {
        // Находим правильный родитель - .scene-drop-zone
        const sceneDropZone = cardRef.current.closest('.scene-drop-zone') as HTMLElement;
        if (sceneDropZone) {
          const parentRect = sceneDropZone.getBoundingClientRect();
          // Вычисляем новую позицию относительно родителя
          const newX = e.clientX - parentRect.left - dragOffset.x;
          const newY = e.clientY - parentRect.top - dragOffset.y;
          
          // Проверяем, было ли реальное перемещение (больше 5px)
          const currentLeft = position?.x ?? (16 + index * (blockWidth + 16));
          const currentTop = position?.y ?? 16;
          const deltaX = Math.abs(newX - currentLeft);
          const deltaY = Math.abs(newY - currentTop);
          if (deltaX > 5 || deltaY > 5) {
            hasMovedRef.current = true;
          }
          
          // Ограничиваем перемещение границами сцены
          const cardHeight = cardRef.current.offsetHeight || 112;
          const maxX = parentRect.width - blockWidth;
          const maxY = parentRect.height - cardHeight;
          const constrainedX = Math.max(0, Math.min(newX, maxX));
          const constrainedY = Math.max(0, Math.min(newY, maxY));
          
          onPositionChange(constrainedX, constrainedY);
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Небольшая задержка перед сбросом флага
      setTimeout(() => {
        hasMovedRef.current = false;
      }, 100);
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onPositionChange, blockWidth, position, index, left, top]);

  if (isExpanded) {
    // Развернутый спикер на всю сцену
    return (
      <div 
        className="absolute inset-0 rounded-2xl overflow-hidden z-10"
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
      className="absolute w-[200px] aspect-video rounded-lg overflow-hidden border-2 border-accent-purple shadow-lg z-20 select-none"
      style={{ 
        left: `${left}px`,
        top: `${top}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        pointerEvents: 'auto',
      }}
      onMouseDown={handleMouseDown}
      onDragStart={(e) => e.preventDefault()} // Предотвращаем нативный drag
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!participant.audio}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      ) : (
        <div 
          className="w-full h-full flex items-center justify-center text-white text-xl font-bold pointer-events-none"
          style={{ backgroundColor: bgColor }}
        >
          {initials}
        </div>
      )}
      {/* Имя спикера на блоке */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 pointer-events-none">
        <span className="text-xs font-medium text-white">{participant.name}</span>
      </div>
    </div>
  );
};

export const ScenesBar = () => {
  const { scenes, activeSceneId, setActiveScene, updateScene, addScene, removeScene, isStreamFullscreen, setStreamFullscreen, participants, participantsOnAir, setParticipantOnAir, expandedParticipantOnScene, setExpandedParticipantOnScene, participantPositions, setParticipantPosition, streamState, startStream, stopStream, sceneTextBlocks, addTextBlock, updateTextBlock, removeTextBlock, editingTextBlockId, setEditingTextBlock, textMode, setTextMode } = useStreamStore();
  const [backgroundModalOpen, setBackgroundModalOpen] = useState<number | null>(null);
  const [backgroundModalPosition, setBackgroundModalPosition] = useState<{ x: number; y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'participant' | 'text' | 'scene'; id?: number | string; sceneId?: number; isExpanded?: boolean } | null>(null);
  const [selectedParticipant, setSelectedParticipant] = useState<{ id: number; sceneId: number } | null>(null);
  
  // Показываем только активную сцену (как в Google Slides)
  const activeScene = scenes.find(s => s.id === activeSceneId);
  const [editingSceneId, setEditingSceneId] = useState<number | null>(null);
  
  // Обработка горячих клавиш для разворачивания/сворачивания спикера
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter для разворачивания/сворачивания выбранного спикера
      if (e.key === 'Enter' && selectedParticipant && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        const isExpanded = expandedParticipantOnScene[selectedParticipant.sceneId] === selectedParticipant.id;
        setExpandedParticipantOnScene(selectedParticipant.sceneId, isExpanded ? null : selectedParticipant.id);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedParticipant, expandedParticipantOnScene, setExpandedParticipantOnScene]);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingSceneId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingSceneId]);

  // Убрали логику прокрутки - теперь показываем только активную сцену

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
          disabled
          className="w-8 h-8 rounded-lg bg-[#2a2a2a] text-gray-500 cursor-not-allowed flex items-center justify-center transition-colors duration-150 flex-shrink-0 opacity-50"
          title="Добавить фон"
        >
          <LayoutDashboard size={12} />
        </button>
        <button
          disabled
          className="w-8 h-8 rounded-lg bg-[#2a2a2a] text-gray-500 cursor-not-allowed flex items-center justify-center transition-colors duration-150 flex-shrink-0 opacity-50"
          title="Дублировать сцену"
        >
          <LayoutGrid size={12} />
        </button>
        <button
          disabled
          className="w-8 h-8 rounded-lg bg-[#2a2a2a] text-gray-500 cursor-not-allowed flex items-center justify-center transition-colors duration-150 flex-shrink-0 opacity-50"
          title="Подобрать картинку (AI)"
        >
          <LayoutPanelLeft size={12} />
        </button>
        {/* Delete button - только если сцен больше одной */}
        {scenes.length > 1 && (
          <button
            disabled
            className="w-8 h-8 rounded-lg bg-[#2a2a2a] text-gray-500 cursor-not-allowed flex items-center justify-center transition-colors duration-150 flex-shrink-0 opacity-50"
            title="Удалить сцену"
          >
            <LayoutPanelTop size={12} />
          </button>
        )}
      </div>
    );
  };

  // Если нет сцен или активной сцены, показываем пустое состояние
  if (scenes.length === 0 || !activeScene) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-text-muted">Нет сцен</div>
      </div>
    );
  }

  return (
    <>
      {isStreamFullscreen ? (
        // Полноэкранный режим - сцена на весь экран
        <div className="w-full h-full">
          {displayedScenes.map((scene) => (
            <div
              className="w-full h-full relative"
            >
              {/* Scene Preview - на весь экран */}
                      <div
                        className="w-full h-full relative"
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (!target.closest('.text-block-editor') && !target.closest('.text-block-display')) {
                            // Добавляем текстовый блок при клике на активную сцену
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            addTextBlock(activeScene.id, {
                              text: 'Новый текст',
                              x,
                              y,
                              fontSize: 24,
                              fontWeight: 'normal',
                              color: '#ffffff',
                              fontFamily: 'Inter',
                              textAlign: 'left',
                            });
                          }
                        }}
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
                    setParticipantOnAir(participantId, activeScene.id);
                  }
                }}
              >
                        <div
                          className="w-full h-full transition-all duration-150 relative"
                          style={{
                            backgroundColor: activeScene.backgroundColor && !activeScene.backgroundColor.includes('gradient')
                              ? activeScene.backgroundColor
                              : '#2a2a2a',
                            background: activeScene.backgroundColor && activeScene.backgroundColor.includes('gradient') 
                              ? activeScene.backgroundColor 
                              : undefined,
                            backgroundImage: activeScene.backgroundPattern === 'lines' 
                              ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)'
                              : activeScene.backgroundPattern === 'dots'
                              ? 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)'
                              : activeScene.backgroundPattern === 'circles'
                              ? 'radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)'
                              : activeScene.backgroundPattern === 'stripes'
                              ? 'repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 16px)'
                              : undefined,
                            backgroundSize: activeScene.backgroundPattern === 'dots' ? '10px 10px' : activeScene.backgroundPattern === 'circles' ? '15px 15px' : undefined,
                            border: '1px solid #3a3a3a',
                          }}
                        >
                  {/* Placeholder контент, если нет спикеров и текстовых блоков на сцене (полноэкранный режим) */}
                  {(() => {
                    const sceneSpeakers = participants.filter(p => {
                      const participantScenes = participantsOnAir[p.id] || [];
                      return participantScenes.includes(activeScene.id);
                    });
                    const hasTextBlocks = sceneTextBlocks[activeScene.id] && sceneTextBlocks[activeScene.id].length > 0;
                    
                    if (sceneSpeakers.length === 0 && !hasTextBlocks) {
                      return (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-0">
                          <p className="text-sm text-gray-400 text-center max-w-md">
                            Добавьте или Перетащите спикеров и контент, чтобы создать свою сцену
                          </p>
                        </div>
                      );
                    }
                    
                    return null;
                  })()}
                  
                  {/* Спикеры в эфире на этой сцене (полноэкранный режим) */}
                  {(() => {
                    const sceneSpeakers = participants.filter(p => {
                      const participantScenes = participantsOnAir[p.id] || [];
                      return participantScenes.includes(activeScene.id);
                    });
                    const expandedId = expandedParticipantOnScene[activeScene.id];
                    const scenePositions = participantPositions[activeScene.id] || {};
                    return sceneSpeakers.map((participant, index) => {
                      const isExpanded = expandedId === participant.id;
                      return (
                        <div
                          key={participant.id}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setSelectedParticipant({ id: participant.id, sceneId: activeScene.id });
                            setContextMenu({
                              x: e.clientX,
                              y: e.clientY,
                              type: 'participant',
                              id: participant.id,
                              sceneId: activeScene.id,
                              isExpanded,
                            });
                          }}
                        >
                          <SceneParticipant 
                            participant={participant} 
                            index={isExpanded ? 0 : index}
                            sceneId={activeScene.id}
                            isExpanded={isExpanded}
                            position={scenePositions[participant.id]}
                            onPositionChange={(x, y) => {
                              setParticipantPosition(activeScene.id, participant.id, { x, y });
                            }}
                            onExpand={() => {
                              setExpandedParticipantOnScene(activeScene.id, isExpanded ? null : participant.id);
                            }}
                            onSelect={() => {
                              setSelectedParticipant({ id: participant.id, sceneId: activeScene.id });
                            }}
                          />
                        </div>
                      );
                    });
                  })()}
                  
                  {/* Текстовые блоки на сцене (полноэкранный режим) */}
                  {(sceneTextBlocks[activeScene.id] || []).map((textBlock) => {
                    const isEditing = editingTextBlockId === textBlock.id;
                    return (
                      <TextBlockComponent
                        key={textBlock.id}
                        textBlock={textBlock}
                        sceneId={activeScene.id}
                        onUpdate={(updates) => updateTextBlock(activeScene.id, textBlock.id, updates)}
                        onDelete={() => removeTextBlock(activeScene.id, textBlock.id)}
                        isEditing={isEditing}
                        onStartEdit={() => setEditingTextBlock(textBlock.id)}
                        onStopEdit={() => setEditingTextBlock(null)}
                        onDuplicate={() => {
                          const newTextBlock = {
                            text: textBlock.text,
                            x: textBlock.x + 20,
                            y: textBlock.y + 20,
                            width: textBlock.width,
                            height: textBlock.height,
                            fontSize: textBlock.fontSize,
                            fontWeight: textBlock.fontWeight,
                            color: textBlock.color,
                            fontFamily: textBlock.fontFamily,
                            textAlign: textBlock.textAlign,
                            backgroundColor: textBlock.backgroundColor,
                            padding: textBlock.padding,
                            borderRadius: textBlock.borderRadius,
                          };
                          addTextBlock(activeScene.id, newTextBlock);
                        }}
                      />
                    );
                  })}
                        </div>
                {/* Fullscreen button - правый нижний угол сцены */}
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Обычный режим - показываем только активную сцену в центре (как в Google Slides)
        <div className="w-full h-full flex items-center justify-center pt-4 pb-6">
          <div className="flex flex-col items-center max-w-[960px] w-full">
            {/* Показываем только активную сцену */}
            {activeScene && (
              <div className="flex flex-col w-full">
                {/* Scene Name */}
                <div className="mb-3">
                  {editingSceneId === activeScene.id ? (
                    <div className="flex items-center justify-between gap-2 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#2a2a2a] border border-accent-purple flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-white">{activeScene.id}</span>
                        </div>
                        {/* Кнопка "В эфир" */}
                        {(() => {
                          const isStreaming = streamState.isStreaming;
                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isStreaming) {
                                  stopStream();
                                } else {
                                  startStream();
                                }
                              }}
                            className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors duration-150 flex items-center gap-1.5 ${
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
                      </div>
                      <SceneActionButtons scene={activeScene} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#2a2a2a] border border-border flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium text-white">{activeScene.id}</span>
                        </div>
                        {/* Кнопка "В эфир" */}
                        {(() => {
                          const isStreaming = streamState.isStreaming;
                          return (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isStreaming) {
                                  stopStream();
                                } else {
                                  startStream();
                                }
                              }}
                            className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors duration-150 flex items-center gap-1.5 ${
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
                      </div>
                      <SceneActionButtons scene={activeScene} />
                    </div>
                  )}
                </div>
              
                {/* Scene Preview */}
                <div 
                  className={`w-full aspect-video relative overflow-visible transition-all duration-150 ${textMode ? 'cursor-crosshair' : ''}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setContextMenu({
                      x: e.clientX,
                      y: e.clientY,
                      type: 'scene',
                      sceneId: activeScene.id,
                    });
                  }}
                  onClick={(e) => {
                    // Если клик не на текстовом блоке
                    const target = e.target as HTMLElement;
                    if (!target.closest('.text-block-editor') && !target.closest('.text-block-display') && !target.closest('.text-block-input')) {
                      if (textMode) {
                        // В режиме текста создаем блок
                        e.preventDefault();
                        e.stopPropagation();
                        const sceneDropZone = e.currentTarget.querySelector('.scene-drop-zone') as HTMLElement;
                        if (sceneDropZone) {
                          const sceneRect = sceneDropZone.getBoundingClientRect();
                          const x = e.clientX - sceneRect.left;
                          const y = e.clientY - sceneRect.top;
                          addTextBlock(activeScene.id, {
                            text: '',
                            x,
                            y,
                            width: 200,
                            height: 100,
                            fontSize: 24,
                            fontWeight: 'normal',
                            color: '#ffffff',
                            fontFamily: 'Inter',
                            textAlign: 'left',
                          });
                          setTextMode(false); // Выключаем режим после создания
                        }
                      }
                    }
                  }}
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
                      setParticipantOnAir(participantId, activeScene.id);
                    }
                  }}
                >
                  <div
                    className={`scene-drop-zone w-full h-full rounded-2xl transition-all duration-150 ${
                      streamState.isStreaming
                        ? 'ring-2 ring-red-600'
                        : 'ring-2 ring-accent-purple'
                    }`}
                    onClick={(e) => {
                      // Обработчик клика на саму сцену для создания текстового блока
                      if (textMode) {
                        e.stopPropagation();
                        const sceneRect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - sceneRect.left;
                        const y = e.clientY - sceneRect.top;
                        addTextBlock(activeScene.id, {
                          text: '',
                          x,
                          y,
                          width: 200,
                          height: 100,
                          fontSize: 24,
                          fontWeight: 'normal',
                          color: '#ffffff',
                          fontFamily: 'Inter',
                          textAlign: 'left',
                        });
                        setTextMode(false);
                      }
                    }}
                    style={{
                      backgroundColor: activeScene.backgroundColor && !activeScene.backgroundColor.includes('gradient')
                        ? activeScene.backgroundColor
                        : '#2a2a2a',
                      background: activeScene.backgroundColor && activeScene.backgroundColor.includes('gradient') 
                        ? activeScene.backgroundColor 
                        : undefined,
                      backgroundImage: activeScene.backgroundPattern === 'lines' 
                        ? 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)'
                        : activeScene.backgroundPattern === 'dots'
                        ? 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)'
                        : activeScene.backgroundPattern === 'circles'
                        ? 'radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)'
                        : activeScene.backgroundPattern === 'stripes'
                        ? 'repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 16px)'
                        : undefined,
                      backgroundSize: activeScene.backgroundPattern === 'dots' ? '10px 10px' : activeScene.backgroundPattern === 'circles' ? '15px 15px' : undefined,
                      border: streamState.isStreaming
                        ? '1px solid #dc2626'
                        : '2px solid #8b5cf6',
                      boxShadow: streamState.isStreaming
                        ? '0 0 0 1px #dc2626, 0 0 0 2px #000'
                        : '0 0 0 2px #8b5cf6, 0 0 0 4px #000',
                    }}
                  >
                    {(() => {
                      // Вычисляем список спикеров на сцене один раз
                      const sceneSpeakers = participants.filter(p => {
                        const participantScenes = participantsOnAir[p.id] || [];
                        return participantScenes.includes(activeScene.id);
                      });
                      
                      return (
                        <>
                          {/* Placeholder контент, если нет спикеров и текстовых блоков на сцене */}
                          {sceneSpeakers.length === 0 && (!sceneTextBlocks[activeScene.id] || sceneTextBlocks[activeScene.id].length === 0) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 z-0">
                              <p className="text-sm text-gray-400 text-center max-w-md">
                                Добавьте или Перетащите спикеров и контент, чтобы создать свою сцену
                              </p>
                            </div>
                          )}
                  
                          {/* Спикеры в эфире на этой сцене */}
                          {(() => {
                            const expandedId = expandedParticipantOnScene[activeScene.id];
                            const scenePositions = participantPositions[activeScene.id] || {};
                            return sceneSpeakers.map((participant, index) => {
                              const isExpanded = expandedId === participant.id;
                              return (
                                <div
                                  key={participant.id}
                                  onContextMenu={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setSelectedParticipant({ id: participant.id, sceneId: activeScene.id });
                                    setContextMenu({
                                      x: e.clientX,
                                      y: e.clientY,
                                      type: 'participant',
                                      id: participant.id,
                                      sceneId: activeScene.id,
                                      isExpanded,
                                    });
                                  }}
                                >
                                  <SceneParticipant 
                                    participant={participant} 
                                    index={isExpanded ? 0 : index}
                                    sceneId={activeScene.id}
                                    isExpanded={isExpanded}
                                    position={scenePositions[participant.id]}
                                    onPositionChange={(x, y) => {
                                      setParticipantPosition(activeScene.id, participant.id, { x, y });
                                    }}
                                    onExpand={() => {
                                      setExpandedParticipantOnScene(activeScene.id, isExpanded ? null : participant.id);
                                    }}
                                    onSelect={() => {
                                      setSelectedParticipant({ id: participant.id, sceneId: activeScene.id });
                                    }}
                                  />
                                </div>
                              );
                            });
                          })()}
                  
                          {/* Текстовые блоки на сцене */}
                          {(sceneTextBlocks[activeScene.id] || []).map((textBlock) => {
                            const isEditing = editingTextBlockId === textBlock.id;
                            return (
                              <TextBlockComponent
                                key={textBlock.id}
                                textBlock={textBlock}
                                sceneId={activeScene.id}
                                onUpdate={(updates) => updateTextBlock(activeScene.id, textBlock.id, updates)}
                                onDelete={() => removeTextBlock(activeScene.id, textBlock.id)}
                                isEditing={isEditing}
                                onStartEdit={() => setEditingTextBlock(textBlock.id)}
                                onStopEdit={() => setEditingTextBlock(null)}
                              />
                            );
                          })}
                        </>
                      );
                    })()}
                  </div>
                  {/* Fullscreen button - правый нижний угол сцены */}
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
                </div>
              </div>
            )}
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
      
      {/* Контекстное меню для сцены */}
      {contextMenu && contextMenu.type === 'scene' && contextMenu.sceneId && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onImage={() => {
            if (contextMenu.sceneId) {
              // Открываем модалку выбора фона
              setBackgroundModalPosition({
                x: contextMenu.x,
                y: contextMenu.y,
              });
              setBackgroundModalOpen(contextMenu.sceneId);
            }
            setContextMenu(null);
          }}
          onDuplicate={() => {
            if (contextMenu.sceneId) {
              const scene = scenes.find(s => s.id === contextMenu.sceneId);
              if (scene) {
                const newId = Math.max(...scenes.map(s => s.id), 0) + 1;
                const duplicatedScene: Scene = {
                  id: newId,
                  name: `${scene.name} (копия)`,
                  type: scene.type,
                  thumbnail: scene.thumbnail,
                  backgroundColor: scene.backgroundColor,
                  backgroundPattern: scene.backgroundPattern,
                };
                addScene(duplicatedScene);
                setActiveScene(newId);
              }
            }
            setContextMenu(null);
          }}
          onAI={() => {
            if (contextMenu.sceneId) {
              // TODO: AI подбор картинки
              console.log('AI подбор картинки для сцены', contextMenu.sceneId);
            }
            setContextMenu(null);
          }}
          onDelete={() => {
            if (contextMenu.sceneId && scenes.length > 1) {
              removeScene(contextMenu.sceneId);
            }
            setContextMenu(null);
          }}
          isDeleteDisabled={scenes.length === 1}
        />
      )}
      
      {/* Контекстное меню для спикеров */}
      {contextMenu && contextMenu.type === 'participant' && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onExpand={() => {
            if (typeof contextMenu.id === 'number') {
              const isExpanded = contextMenu.isExpanded || false;
              setExpandedParticipantOnScene(contextMenu.sceneId, isExpanded ? null : contextMenu.id);
            }
            setContextMenu(null);
          }}
          isExpanded={contextMenu.isExpanded || false}
          onDelete={() => {
            if (typeof contextMenu.id === 'number') {
              setParticipantOnAir(contextMenu.id, contextMenu.sceneId, false);
            }
            setContextMenu(null);
          }}
          onDuplicate={() => {
            // TODO: Дублировать спикера
            console.log('Duplicate participant', contextMenu.id);
            setContextMenu(null);
          }}
        />
      )}
    </>
  );
};

