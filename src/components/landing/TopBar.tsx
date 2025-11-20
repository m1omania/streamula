import { useState } from 'react';
import { Search, Settings, Link2, Palette, LogOut } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { getInitials, getRandomColor } from '../../utils/mockData';

interface TopBarProps {
  onSearchChange?: (query: string) => void;
}

export const TopBar = ({ onSearchChange }: TopBarProps) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userName = 'Андрей Реуцкий';
  const userInitials = getInitials(userName);
  const userColor = getRandomColor(userName);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearchChange?.(value);
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4 overflow-hidden">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">streamula</h1>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl min-w-0 overflow-hidden">
          <div className="relative w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Поиск трансляций, записей, шаблонов..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full max-w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* User Menu */}
        <DropdownMenu.Root open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-150">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: userColor }}
              >
                {userInitials}
              </div>
              <span className="text-sm font-medium text-gray-900 hidden sm:block">{userName}</span>
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[200px] z-50"
              sideOffset={8}
            >
              <DropdownMenu.Item className="px-3 py-2 rounded hover:bg-gray-100 text-gray-900 text-sm cursor-pointer flex items-center gap-2">
                <Settings size={16} className="text-gray-600" />
                Мои настройки
              </DropdownMenu.Item>
              <DropdownMenu.Item className="px-3 py-2 rounded hover:bg-gray-100 text-gray-900 text-sm cursor-pointer flex items-center gap-2">
                <Link2 size={16} className="text-gray-600" />
                Интеграции
              </DropdownMenu.Item>
              <DropdownMenu.Item className="px-3 py-2 rounded hover:bg-gray-100 text-gray-900 text-sm cursor-pointer flex items-center gap-2">
                <Palette size={16} className="text-gray-600" />
                Брендинг
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
              <DropdownMenu.Item className="px-3 py-2 rounded hover:bg-gray-100 text-gray-900 text-sm cursor-pointer flex items-center gap-2">
                <LogOut size={16} className="text-gray-600" />
                Выйти
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  );
};

