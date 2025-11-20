import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Palette } from 'lucide-react';
import { useStreamStore } from '../../stores/useStreamStore';

interface BackgroundModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sceneId: number;
  position?: { x: number; y: number };
}

// Цвета и градиенты для фона (соответствует примеру: 2 специальные опции + 35 опций = 37)
const backgroundOptions = [
  // Специальные опции (2 штуки)
  { type: 'custom', label: 'Кастомный', icon: Plus, color: 'white', border: 'purple' },
  { type: 'picker', label: 'Палитра', icon: Palette, color: 'linear-gradient(180deg, #ffd700 0%, #ff8c00 25%, #ff1493 50%, #0000ff 100%)' },
  
  // Ряд 1: Солидные цвета (5)
  { type: 'color', color: '#ffffff' },
  { type: 'color', color: '#000000' },
  { type: 'color', color: '#8b0000' },
  { type: 'color', color: '#a0522d' },
  { type: 'color', color: '#daa520' },
  
  // Ряд 2: Солидные цвета (5)
  { type: 'color', color: '#006400' },
  { type: 'color', color: '#0000ff' },
  { type: 'color', color: '#ff69b4' },
  { type: 'color', color: '#f5deb3' },
  { type: 'color', color: '#2f4f4f' },
  
  // Ряд 3: Солидные цвета (5)
  { type: 'color', color: '#9acd32' },
  { type: 'color', color: '#87ceeb' },
  { type: 'color', color: '#d2b48c' },
  { type: 'color', color: '#deb887' },
  { type: 'color', color: '#d3d3d3' },
  
  // Ряд 4: Солидные цвета (2) + Градиенты (3)
  { type: 'color', color: '#ffe4b5' },
  { type: 'color', color: '#87cefa' },
  { type: 'color', color: '#ffd700' },
  { type: 'gradient', color: 'radial-gradient(circle, #ff69b4, #9370db)' },
  { type: 'color', color: '#e6e6fa' },
  
  // Ряд 5: Градиенты и паттерны (5)
  { type: 'gradient', color: 'radial-gradient(circle, #87ceeb, #00ffff)' },
  { type: 'gradient', color: 'radial-gradient(circle, #90ee90, #98fb98)' },
  { type: 'gradient', color: 'radial-gradient(circle, #ffe4b5, #ff69b4)' },
  { type: 'pattern', color: '#000000', pattern: 'lines' }, // Черный с белыми линиями
  { type: 'gradient', color: 'radial-gradient(circle, #87ceeb, #00ffff)' },
  
  // Ряд 6: Градиенты и паттерны (5)
  { type: 'gradient', color: 'radial-gradient(circle, #90ee90, #98fb98)' },
  { type: 'gradient', color: 'radial-gradient(circle, #ffe4b5, #ff69b4)' },
  { type: 'pattern', color: '#e6e6fa', pattern: 'dots' }, // Светло-фиолетовый с точками
  { type: 'gradient', color: 'radial-gradient(circle, #ffffe0, #f0fff0)' },
  { type: 'gradient', color: 'radial-gradient(circle, #90ee90, #ffffff)' },
  
  // Ряд 7: Градиенты и паттерны (5)
  { type: 'gradient', color: 'radial-gradient(circle, #e6e6fa, #ffffff)' },
  { type: 'gradient', color: 'radial-gradient(circle, #87cefa, #ffffff)' },
  { type: 'pattern', color: '#ff8c00', pattern: 'circles' }, // Оранжевый с кругами
  { type: 'gradient', color: 'radial-gradient(circle, #ffffff, #d3d3d3)' },
  { type: 'gradient', color: 'radial-gradient(circle, #ffe4b5, #ffa500)' },
  
  // Ряд 8: Градиенты и паттерны (5)
  { type: 'gradient', color: 'linear-gradient(135deg, #ff69b4, #9370db, #00ffff)' },
  { type: 'gradient', color: 'linear-gradient(135deg, #ffd700, #ff8c00, #9370db)' },
  { type: 'gradient', color: 'radial-gradient(circle, #87ceeb, #9370db)' },
  { type: 'pattern', color: '#90ee90', pattern: 'stripes' }, // Зеленый с полосками
  { type: 'gradient', color: 'radial-gradient(circle, #9370db, #ff1493)' },
];

export const BackgroundModal = ({ open, onOpenChange, sceneId, position }: BackgroundModalProps) => {
  const { updateScene } = useStreamStore();

  // Вычисляем позицию с учетом границ экрана
  const getPosition = () => {
    if (!position) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const modalWidth = 400; // max-w-[400px]
    const modalHeight = 300; // примерная высота
    const padding = 16;

    let left = position.x;
    let top = position.y;

    // Проверяем правую границу
    if (left + modalWidth > window.innerWidth - padding) {
      left = window.innerWidth - modalWidth - padding;
    }

    // Проверяем левую границу
    if (left < padding) {
      left = padding;
    }

    // Проверяем нижнюю границу
    if (top + modalHeight > window.innerHeight - padding) {
      top = position.y - modalHeight - 8; // Показываем над кнопкой
    }

    // Проверяем верхнюю границу
    if (top < padding) {
      top = padding;
    }

    return {
      left: `${left}px`,
      top: `${top}px`,
      transform: 'none',
    };
  };

  const handleSelect = (option: typeof backgroundOptions[0]) => {
    if (option.type === 'custom' || option.type === 'picker') {
      // TODO: Открыть кастомный выбор или палитру
      return;
    }

    // Применяем фон к сцене
    if (option.type === 'color') {
      updateScene(sceneId, { backgroundColor: option.color, backgroundPattern: undefined });
    } else if (option.type === 'gradient') {
      updateScene(sceneId, { backgroundColor: option.color, backgroundPattern: undefined });
    } else if (option.type === 'pattern') {
      updateScene(sceneId, { backgroundColor: option.color, backgroundPattern: option.pattern });
    }

    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content 
          className="fixed bg-white border border-gray-200 rounded-lg w-auto max-w-[400px] z-50 p-4"
          style={getPosition()}
        >
          <div className="flex items-center justify-between mb-3">
            <Dialog.Title className="text-base font-semibold text-gray-900">Фон слайда</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-150">
                <X size={16} className="text-gray-600" />
              </button>
            </Dialog.Close>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {backgroundOptions.map((option, index) => {
              const IconComponent = option.icon;
              const isSpecial = option.type === 'custom' || option.type === 'picker';
              
              // Генерируем паттерн для фона
              let backgroundStyle: React.CSSProperties = {};
              if (option.type === 'color') {
                backgroundStyle.backgroundColor = option.color;
              } else if (option.type === 'gradient') {
                backgroundStyle.background = option.color;
              } else if (option.type === 'pattern') {
                backgroundStyle.backgroundColor = option.color;
                if (option.pattern === 'lines') {
                  backgroundStyle.backgroundImage = `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 20px)`;
                } else if (option.pattern === 'dots') {
                  backgroundStyle.backgroundImage = `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`;
                  backgroundStyle.backgroundSize = '10px 10px';
                } else if (option.pattern === 'circles') {
                  backgroundStyle.backgroundImage = `radial-gradient(circle, rgba(255,255,255,0.2) 2px, transparent 2px)`;
                  backgroundStyle.backgroundSize = '15px 15px';
                } else if (option.pattern === 'stripes') {
                  backgroundStyle.backgroundImage = `repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 16px)`;
                }
              } else if (option.type === 'picker') {
                backgroundStyle.background = option.color;
              }
              
              return (
                <button
                  key={index}
                  onClick={() => handleSelect(option)}
                  className={`w-10 h-10 rounded-full border transition-colors duration-150 flex items-center justify-center overflow-hidden ${
                    isSpecial && option.border === 'purple'
                      ? 'border-purple-500 hover:border-purple-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={backgroundStyle}
                  title={option.label || option.color}
                >
                  {IconComponent && (
                    <IconComponent size={14} className={option.type === 'custom' ? 'text-black' : 'text-gray-700'} />
                  )}
                </button>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

