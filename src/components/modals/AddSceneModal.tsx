import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { useStreamStore } from '../../stores/useStreamStore';
import { useState } from 'react';
import type { SceneType } from '../../types';

interface AddSceneModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddSceneModal = ({ open, onOpenChange }: AddSceneModalProps) => {
  const { scenes, addScene, setActiveScene } = useStreamStore();
  const [name, setName] = useState('');
  const [type, setType] = useState<SceneType>('blank');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newId = Math.max(...scenes.map(s => s.id), 0) + 1;
    const newScene = {
      id: newId,
      name: name.trim() || `Сцена ${newId}`,
      type,
      thumbnail: '',
    };

    addScene(newScene);
    setActiveScene(newId);
    setName('');
    setType('blank');
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1a1a1a] border border-border rounded-lg w-[90vw] max-w-[500px] z-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold text-white">Новая сцена</Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors duration-150">
                  <X size={20} className="text-text-muted" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Название сцены
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите название"
                  className="w-full px-4 py-2 bg-[#0f0f0f] border border-border-light rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-accent-blue transition-colors duration-150"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Тип сцены
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as SceneType)}
                  className="w-full px-4 py-2 bg-[#0f0f0f] border border-border-light rounded-lg text-white focus:outline-none focus:border-accent-blue transition-colors duration-150"
                >
                  <option value="blank">Пустая</option>
                  <option value="text">Текст</option>
                  <option value="image">Изображение</option>
                  <option value="template">Шаблон</option>
                  <option value="presentation">Презентация</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="px-4 py-2 bg-[#1a1a1a] border border-border rounded-lg text-white hover:bg-[#2a2a2a] transition-colors duration-150"
                  >
                    Отмена
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={!name.trim()}
                  className="px-4 py-2 bg-accent-blue rounded-lg text-white hover:bg-[#5855eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

