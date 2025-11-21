import React, { useRef, useEffect, useState } from 'react';
import { useStreamStore } from '../../stores/useStreamStore';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { Scene, Participant } from '../../types';
import { getInitials, getRandomColor } from '../../utils/mockData';

export const ScenesPanel = () => {
  const { 
    scenes, 
    activeSceneId, 
    setActiveScene, 
    addScene, 
    removeScene,
    moveScene,
    participants,
    participantsOnAir,
    participantPositions,
    sceneTextBlocks
  } = useStreamStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSceneRef = useRef<HTMLDivElement>(null);
  const [draggedSceneId, setDraggedSceneId] = useState<number | null>(null);
  const [dragOverSceneId, setDragOverSceneId] = useState<number | null>(null);

  // Прокрутка к активной сцене
  useEffect(() => {
    if (activeSceneRef.current && containerRef.current) {
      const container = containerRef.current;
      const sceneElement = activeSceneRef.current;
      const containerRect = container.getBoundingClientRect();
      const sceneRect = sceneElement.getBoundingClientRect();
      
      const scrollTop = container.scrollTop;
      const sceneTop = sceneRect.top - containerRect.top + scrollTop;
      const sceneBottom = sceneTop + sceneRect.height;
      const containerBottom = scrollTop + containerRect.height;
      
      if (sceneTop < scrollTop) {
        // Сцена выше видимой области
        container.scrollTo({ top: sceneTop - 16, behavior: 'smooth' });
      } else if (sceneBottom > containerBottom) {
        // Сцена ниже видимой области
        container.scrollTo({ top: sceneBottom - containerRect.height + 16, behavior: 'smooth' });
      }
    }
  }, [activeSceneId, scenes.length]);

  const handleAddScene = () => {
    const newId = Math.max(...scenes.map(s => s.id), 0) + 1;
    const newScene: Scene = {
      id: newId,
      name: `Сцена ${newId}`,
      type: 'default',
      backgroundColor: '#2a2a2a',
    };
    addScene(newScene);
    setActiveScene(newId);
  };

  // Функция для рендеринга миниатюры сцены
  const renderSceneThumbnail = (scene: Scene) => {
    const sceneSpeakers = participants.filter((p: Participant) => {
      const participantScenes = participantsOnAir[p.id] || [];
      return participantScenes.includes(scene.id);
    });
    const scenePositions = participantPositions[scene.id] || {};
    const textBlocks = sceneTextBlocks[scene.id] || [];

    return (
      <div
        className="w-full aspect-video relative rounded border-2 overflow-hidden"
        style={{
          backgroundColor: scene.backgroundColor && !scene.backgroundColor.includes('gradient')
            ? scene.backgroundColor
            : '#2a2a2a',
          background: scene.backgroundColor && scene.backgroundColor.includes('gradient') 
            ? scene.backgroundColor 
            : undefined,
          borderColor: activeSceneId === scene.id ? '#8b5cf6' : '#3a3a3a',
        }}
      >
        {/* Спикеры на миниатюре */}
        {sceneSpeakers.map((participant: Participant, index: number) => {
          const position = scenePositions[participant.id] || { x: 16 + index * 50, y: 16 };
          const hasVideo = participant.video && participant.stream;
          const initials = participant.avatar || getInitials(participant.name);
          const bgColor = getRandomColor(participant.name);
          
          return (
            <div
              key={participant.id}
              className="absolute rounded border border-accent-purple"
              style={{
                left: `${(position.x / 854) * 100}%`, // Масштабируем позицию для миниатюры
                top: `${(position.y / 480) * 100}%`,
                width: '15%',
                aspectRatio: '16/9',
                backgroundColor: hasVideo ? 'transparent' : bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                color: 'white',
              }}
            >
              {!hasVideo && initials}
            </div>
          );
        })}

        {/* Текстовые блоки на миниатюре */}
        {textBlocks.map((textBlock) => (
          <div
            key={textBlock.id}
            className="absolute rounded"
            style={{
              left: `${(textBlock.x / 854) * 100}%`,
              top: `${(textBlock.y / 480) * 100}%`,
              width: `${(textBlock.width / 854) * 100}%`,
              height: `${(textBlock.height / 480) * 100}%`,
              backgroundColor: textBlock.backgroundColor || 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              fontSize: '6px',
              color: textBlock.color,
              padding: '2px',
              overflow: 'hidden',
            }}
          >
            {textBlock.text && (
              <div className="truncate" style={{ fontSize: '6px' }}>
                {textBlock.text}
              </div>
            )}
          </div>
        ))}

        {/* Номер сцены */}
        <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-[#1a1a1a] border border-border flex items-center justify-center">
          <span className="text-xs font-medium text-white">{scene.id}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-[200px] bg-background-dark border-r border-border flex flex-col h-full">
      {/* Заголовок */}
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-semibold text-white">Сцены</h3>
      </div>

      {/* Список сцен */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-2 space-y-2"
      >
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            ref={activeSceneId === scene.id ? activeSceneRef : null}
            draggable
            onDragStart={(e) => {
              setDraggedSceneId(scene.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              if (draggedSceneId !== scene.id) {
                setDragOverSceneId(scene.id);
              }
            }}
            onDragLeave={() => {
              setDragOverSceneId(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedSceneId && draggedSceneId !== scene.id) {
                const draggedIndex = scenes.findIndex(s => s.id === draggedSceneId);
                const targetIndex = scenes.findIndex(s => s.id === scene.id);
                if (draggedIndex < targetIndex) {
                  // Перемещаем вправо
                  for (let i = draggedIndex; i < targetIndex; i++) {
                    moveScene(scenes[i].id, 'right');
                  }
                } else {
                  // Перемещаем влево
                  for (let i = draggedIndex; i > targetIndex; i--) {
                    moveScene(scenes[i].id, 'left');
                  }
                }
              }
              setDraggedSceneId(null);
              setDragOverSceneId(null);
            }}
            onClick={() => setActiveScene(scene.id)}
            className={`cursor-pointer rounded-lg p-1.5 transition-all relative group ${
              activeSceneId === scene.id
                ? 'bg-[#2a2a2a] ring-2 ring-accent-purple'
                : 'hover:bg-[#1a1a1a]'
            } ${
              dragOverSceneId === scene.id ? 'border-t-2 border-accent-purple' : ''
            } ${
              draggedSceneId === scene.id ? 'opacity-50' : ''
            }`}
          >
            {/* Иконка для перетаскивания */}
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <GripVertical size={12} className="text-text-muted" />
            </div>
            
            {renderSceneThumbnail(scene)}
            {/* Название сцены */}
            <div className="mt-1.5 px-1">
              <span className="text-xs text-text-muted truncate block">
                {scene.name || `Сцена ${scene.id}`}
              </span>
            </div>
          </div>
        ))}

        {/* Кнопка добавления сцены */}
        <button
          onClick={handleAddScene}
          className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-accent-purple hover:bg-[#1a1a1a] transition-colors duration-150 flex items-center justify-center"
          title="Добавить сцену"
        >
          <Plus size={20} className="text-text-muted" />
        </button>
      </div>
    </div>
  );
};

