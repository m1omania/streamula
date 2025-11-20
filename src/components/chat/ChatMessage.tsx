import type { Message } from '../../types';
import { getInitials, getRandomColor } from '../../utils/mockData';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const initials = message.avatar || getInitials(message.author);
  const bgColor = getRandomColor(message.author);

  return (
    <div className="flex gap-3 p-3 hover:bg-[#0f0f0f] transition-colors duration-150">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0"
        style={{ backgroundColor: bgColor }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">{message.author}</span>
          <span className="text-xs text-text-muted">{message.time}</span>
        </div>
        <p className="text-sm text-text-muted">{message.text}</p>
      </div>
    </div>
  );
};

