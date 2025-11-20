import { X, Plus, Play, Image, FileText } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface MediaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type TabType = 'videos' | 'images' | 'slides';

export const MediaModal = ({ open, onOpenChange }: MediaModalProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('videos');
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const slidesInputRef = useRef<HTMLInputElement>(null);

  // Закрытие меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleMenuClick = (tab: TabType) => {
    setActiveTab(tab);
    setShowMenu(false);
    
    // Открываем нативное окно выбора файлов
    if (tab === 'videos' && videoInputRef.current) {
      videoInputRef.current.click();
    } else if (tab === 'images' && imageInputRef.current) {
      imageInputRef.current.click();
    } else if (tab === 'slides' && slidesInputRef.current) {
      slidesInputRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, type: TabType) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Здесь можно обработать выбранные файлы
      console.log(`Selected ${type}:`, Array.from(files));
      // TODO: Добавить логику загрузки файлов
    }
    // Сброс значения input для возможности повторного выбора того же файла
    event.target.value = '';
  };

  if (!open) return null;

  return (
    <>
      {/* Скрытые input элементы для выбора файлов */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileChange(e, 'videos')}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileChange(e, 'images')}
      />
      <input
        ref={slidesInputRef}
        type="file"
        accept=".pdf,.ppt,.pptx"
        multiple
        className="hidden"
        onChange={(e) => handleFileChange(e, 'slides')}
      />
      
      <div className="fixed left-[60px] top-16 bottom-20 w-[400px] bg-white border border-gray-200 rounded-lg z-40 flex flex-col shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Media</h2>
        <div className="flex items-center gap-3 relative">
          <button
            ref={buttonRef}
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150 relative"
          >
            <Plus size={20} className="text-gray-700" />
          </button>
          
          {/* Dropdown Menu */}
          {showMenu && (
            <div
              ref={menuRef}
              className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
            >
              <button
                onClick={() => handleMenuClick('videos')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150 text-left"
              >
                <Play size={20} className="text-gray-700" />
                <span className="text-gray-900 font-medium">Videos</span>
              </button>
              <button
                onClick={() => handleMenuClick('images')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150 text-left"
              >
                <Image size={20} className="text-gray-700" />
                <span className="text-gray-900 font-medium">Images</span>
              </button>
              <button
                onClick={() => handleMenuClick('slides')}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150 text-left"
              >
                <FileText size={20} className="text-gray-700" />
                <span className="text-gray-900 font-medium">Slides</span>
              </button>
            </div>
          )}
          
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-150"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>
      </div>

          {/* Tabs */}
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('videos')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${
                  activeTab === 'videos'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Videos
              </button>
              <button
                onClick={() => setActiveTab('images')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${
                  activeTab === 'images'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Images
              </button>
              <button
                onClick={() => setActiveTab('slides')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-150 ${
                  activeTab === 'slides'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Slides
              </button>
            </div>
          </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-white">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          {/* Icon */}
          <div className="w-24 h-24 rounded-lg border-2 border-gray-300 flex items-center justify-center mb-6">
            <Play size={40} className="text-gray-400 ml-1" fill="currentColor" />
          </div>

          {/* Text */}
          <p className="text-center text-gray-600 mb-8 max-w-md">
            {activeTab === 'videos' && 'Add videos from the Library to use them in your event'}
            {activeTab === 'images' && 'Add images from the Library to use them in your event'}
            {activeTab === 'slides' && 'Add slides from the Library to use them in your event'}
          </p>

          {/* Button */}
          <button className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-150 flex items-center gap-2">
            <Plus size={20} />
            {activeTab === 'videos' && 'Add videos'}
            {activeTab === 'images' && 'Add images'}
            {activeTab === 'slides' && 'Add slides'}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

