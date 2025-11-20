import { Plus } from 'lucide-react';
import { useStreamStore } from '../../stores/useStreamStore';

export const CreateStreamPanel = () => {
  const { setCurrentPage } = useStreamStore();

  const handleCreateBlank = () => {
    setCurrentPage('studio');
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Создать трансляцию</h2>
      </div>
      <button
        onClick={handleCreateBlank}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCreateBlank();
          }
        }}
        className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-150 flex items-center gap-3 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Создать чистую трансляцию"
      >
        <Plus size={24} />
        Создать трансляцию
      </button>
    </div>
  );
};

