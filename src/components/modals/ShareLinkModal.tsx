import * as Dialog from '@radix-ui/react-dialog';
import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ShareLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShareLinkModal = ({ open, onOpenChange }: ShareLinkModalProps) => {
  const [copied, setCopied] = useState(false);
  const streamUrl = `${window.location.origin}/stream/${Date.now()}`; // В реальном приложении будет ID трансляции

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(streamUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1a1a1a] border border-border rounded-lg w-[90vw] max-w-[500px] z-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-xl font-semibold text-white">Поделиться ссылкой</Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors duration-150">
                  <X size={20} className="text-text-muted" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Ссылка на трансляцию</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={streamUrl}
                    readOnly
                    className="flex-1 px-4 py-2 bg-[#0f0f0f] border border-border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-accent-blue hover:bg-[#5855eb] rounded-lg text-white transition-colors duration-150 flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check size={18} />
                        Скопировано
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Копировать
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-sm text-text-muted">
                  Отправьте эту ссылку спикерам, чтобы они могли присоединиться к трансляции
                </p>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};


