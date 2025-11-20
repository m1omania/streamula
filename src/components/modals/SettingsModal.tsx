import * as Dialog from '@radix-ui/react-dialog';
import { X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const [broadcastMode, setBroadcastMode] = useState('Режиссерская');
  const [showParticipants, setShowParticipants] = useState(true);
  const [access, setAccess] = useState('Открытая регистрация');
  const [emailConfirmation, setEmailConfirmation] = useState('Необязательно');

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1a1a1a] border border-border rounded-lg w-[90vw] max-w-[500px] z-50">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <Dialog.Title className="text-xl font-semibold text-white">Настройки</Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors duration-150">
                  <X size={20} className="text-text-muted" />
                </button>
              </Dialog.Close>
            </div>

            {/* Settings */}
            <div className="space-y-6">
              {/* Режим трансляции */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">Режим трансляции</label>
                <div className="relative">
                  <select
                    value={broadcastMode}
                    onChange={(e) => setBroadcastMode(e.target.value)}
                    className="appearance-none px-4 py-2 pr-8 bg-[#0f0f0f] border border-border rounded-lg text-sm text-white cursor-pointer hover:bg-[#1a1a1a] transition-colors duration-150"
                  >
                    <option value="Режиссерская">Режиссерская</option>
                    <option value="Автоматическая">Автоматическая</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>

              {/* Отображать спикеров */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">Отображать спикеров</label>
                <button
                  onClick={() => setShowParticipants(!showParticipants)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-150 ${
                    showParticipants ? 'bg-accent-purple' : 'bg-[#2a2a2a]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-150 ${
                      showParticipants ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Доступ */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">Доступ</label>
                <div className="relative">
                  <select
                    value={access}
                    onChange={(e) => setAccess(e.target.value)}
                    className="appearance-none px-4 py-2 pr-8 bg-[#0f0f0f] border border-border rounded-lg text-sm text-white cursor-pointer hover:bg-[#1a1a1a] transition-colors duration-150"
                  >
                    <option value="Открытая регистрация">Открытая регистрация</option>
                    <option value="По приглашению">По приглашению</option>
                    <option value="Закрытая">Закрытая</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>

              {/* Подтверждение email */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white">Подтверждение email</label>
                <div className="relative">
                  <select
                    value={emailConfirmation}
                    onChange={(e) => setEmailConfirmation(e.target.value)}
                    className="appearance-none px-4 py-2 pr-8 bg-[#0f0f0f] border border-border rounded-lg text-sm text-white cursor-pointer hover:bg-[#1a1a1a] transition-colors duration-150"
                  >
                    <option value="Необязательно">Необязательно</option>
                    <option value="Обязательно">Обязательно</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Стилизация button */}
            <div className="mt-8">
              <button className="w-full px-4 py-3 bg-[#0f0f0f] border border-border rounded-lg text-white hover:bg-[#1a1a1a] transition-colors duration-150 font-medium">
                Стилизация
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

