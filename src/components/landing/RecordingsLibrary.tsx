import { useState } from 'react';
import { Search, Filter, Play, Edit, Share2, Download, Eye } from 'lucide-react';
import { useStreamStore } from '../../stores/useStreamStore';
import type { StreamRecording } from '../../types';

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  }
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

interface RecordingsLibraryProps {
  searchQuery?: string;
}

export const RecordingsLibrary = ({ searchQuery: externalSearchQuery }: RecordingsLibraryProps = {}) => {
  const { recordings } = useStreamStore();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');
  
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : localSearchQuery;
  const useGlobalSearch = externalSearchQuery !== undefined;

  const filteredRecordings = recordings.filter((recording) => {
    const matchesSearch = !searchQuery || recording.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || recording.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const isEmpty = recordings.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Мои записи</h2>
        <div className="flex items-center gap-3">
          {/* Search - показываем только если не используется глобальный поиск */}
          {!useGlobalSearch && (
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
          {/* Filter */}
          <div className="relative">
            <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">Все</option>
              <option value="completed">Завершены</option>
              <option value="processing">Обработка</option>
              <option value="failed">Ошибки</option>
            </select>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Play size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Здесь будут ваши записи
          </h3>
          <p className="text-gray-600 mb-6">
            Проведите первую трансляцию!
          </p>
        </div>
      ) : filteredRecordings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Ничего не найдено
          </h3>
          <p className="text-gray-600">
            Попробуйте изменить параметры поиска или фильтры
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredRecordings.map((recording) => (
            <div
              key={recording.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-150 group"
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-200 relative overflow-hidden">
                {recording.thumbnail ? (
                  <img
                    src={recording.thumbnail}
                    alt={recording.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-300">
                    <Play size={32} className="text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-white text-xs">
                  {formatDuration(recording.duration)}
                </div>
                {recording.status === 'processing' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">Обработка...</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {recording.title}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{formatDate(recording.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {recording.views}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center justify-center gap-2"
                    title="Смотреть"
                  >
                    <Play size={16} />
                    Смотреть
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Редактировать"
                  >
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Поделиться"
                  >
                    <Share2 size={16} className="text-gray-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Скачать"
                  >
                    <Download size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

