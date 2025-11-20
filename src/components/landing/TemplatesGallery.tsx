import { useState } from 'react';
import { 
  GraduationCap, 
  Users, 
  Building2, 
  Presentation, 
  MessageSquare, 
  Lock, 
  Share2, 
  Briefcase,
  Video,
  Globe,
  Plus
} from 'lucide-react';
import { useStreamStore } from '../../stores/useStreamStore';
import type { StreamTemplate } from '../../types';

interface TemplatesGalleryProps {
  searchQuery?: string;
}

const templates: StreamTemplate[] = [
  {
    id: 'blank',
    type: 'blank',
    name: 'Начать с чистого листа',
    description: '',
    icon: 'Plus',
    features: [],
    color: '#6b7280',
  },
  {
    id: 'meeting',
    type: 'meeting',
    name: 'Встреча/видеоконференция',
    description: 'Интерактивные события, групповые обсуждения, breakout rooms',
    icon: 'Users',
    features: ['Breakout', 'Обсуждения'],
    color: '#06b6d4',
  },
  {
    id: 'webinar',
    type: 'webinar',
    name: 'Вебинар с регистрацией и оплатой',
    description: 'Для продающих эфиров с формами, билетами, CRM-интеграцией',
    icon: 'GraduationCap',
    features: ['Регистрация', 'Оплата', 'CRM'],
    color: '#6366f1',
  },
  {
    id: 'corporate',
    type: 'corporate',
    name: 'Корпоративный эфир',
    description: 'SSO, отдельный брендинг, сложные права доступа',
    icon: 'Building2',
    features: ['SSO', 'Брендинг', 'Права'],
    color: '#8b5cf6',
  },
  {
    id: 'educational',
    type: 'educational',
    name: 'Образовательный стрим',
    description: 'Интеграция с LMS, сертификаты, тесты, опросы',
    icon: 'GraduationCap',
    features: ['LMS', 'Сертификаты', 'Тесты'],
    color: '#f59e0b',
  },
  {
    id: 'product-presentation',
    type: 'product-presentation',
    name: 'Презентация продукта',
    description: 'Брендирование, материалы, опросы',
    icon: 'Presentation',
    features: ['Брендинг', 'Материалы'],
    color: '#ec4899',
  },
  {
    id: 'ama',
    type: 'ama',
    name: 'DevRel AMA',
    description: 'Максимум интерактива: чат, вопросы, голосования, реакции',
    icon: 'MessageSquare',
    features: ['Чат', 'Вопросы', 'Голосования'],
    color: '#f43f5e',
  },
  {
    id: 'private',
    type: 'private',
    name: 'Приватная трансляция',
    description: 'По приглашению, защита доступа, статистика, watermark',
    icon: 'Lock',
    features: ['Приглашения', 'Защита', 'Статистика'],
    color: '#6b7280',
  },
  {
    id: 'multi-platform',
    type: 'multi-platform',
    name: 'Много-платформенная трансляция',
    description: 'Одновременно в VK, YouTube, Telegram, Rutube',
    icon: 'Share2',
    features: ['RTMP', 'Restream'],
    color: '#14b8a6',
  },
  {
    id: 'hr-training',
    type: 'hr-training',
    name: 'HR и корпоративное обучение',
    description: 'Группы, отчеты, тесты, интеграция с внутренними системами',
    icon: 'Briefcase',
    features: ['Группы', 'Отчеты', 'Тесты'],
    color: '#a855f7',
  },
];

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  GraduationCap,
  Users,
  Building2,
  Presentation,
  MessageSquare,
  Lock,
  Share2,
  Briefcase,
  Video,
  Globe,
  Plus,
};

export const TemplatesGallery = ({ searchQuery = '' }: TemplatesGalleryProps) => {
  const { setCurrentPage, setSelectedTemplateName } = useStreamStore();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTemplateClick = (template: StreamTemplate) => {
    setSelectedTemplateName(template.name);
    setCurrentPage('studio');
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const filteredTemplates = templates.filter((template) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.features.some((f) => f.toLowerCase().includes(query))
    );
  });

  // Показываем только первый ряд (4 шаблона) когда свернуто
  const displayedTemplates = isExpanded ? filteredTemplates : filteredTemplates.slice(0, 4);

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Создать трансляцию</h2>
        {filteredTemplates.length > 4 && (
          <button 
            onClick={handleToggleExpand}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
          >
            {isExpanded ? 'Свернуть шаблоны' : 'Показать шаблоны'}
          </button>
        )}
      </div>
      {filteredTemplates.length === 0 && searchQuery ? (
        <div className="text-center py-12 text-gray-500">
          <p>Ничего не найдено по запросу "{searchQuery}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedTemplates.map((template) => {
          const IconComponent = iconMap[template.icon] || Video;
          const isBlank = template.id === 'blank';
          return (
            <button
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTemplateClick(template);
                }
              }}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-150 text-left group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex flex-col items-start h-full"
              aria-label={`Создать трансляцию: ${template.name}`}
            >
              <div
                className={`rounded-lg flex items-center justify-center mb-4 flex-shrink-0 ${isBlank ? 'w-16 h-16' : 'w-12 h-12'}`}
                style={{ backgroundColor: `${template.color}15` }}
              >
                <IconComponent size={isBlank ? 40 : 24} style={{ color: template.color }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700 text-left">
                {template.name}
              </h3>
              {template.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 text-left">
                  {template.description}
                </p>
              )}
              {template.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {template.features.slice(0, 2).map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-1 rounded-md bg-gray-100 text-gray-700"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
        </div>
      )}
    </div>
  );
};

