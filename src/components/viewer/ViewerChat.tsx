import { useState, useRef, useEffect } from 'react';
import { useStreamStore } from '../../stores/useStreamStore';
import { ChatMessage } from '../chat/ChatMessage';
import { Send } from 'lucide-react';

interface ViewerChatProps {
  sendChatMessage: (message: string, author: string) => void;
}

export const ViewerChat = ({ sendChatMessage }: ViewerChatProps) => {
  const { messages } = useStreamStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim()) {
      sendChatMessage(inputValue.trim(), 'Вы');
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-medium text-text-muted">Чат</h3>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="p-4 text-center text-text-muted text-sm">
            Нет сообщений. Начните общение!
          </div>
        ) : (
          <div>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Leave comment"
            className="flex-1 px-4 py-2 bg-[#0f0f0f] border border-border-light rounded-lg text-white placeholder:text-text-muted focus:outline-none focus:border-accent-blue transition-colors duration-150"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="px-4 py-2 bg-accent-blue rounded-lg text-white hover:bg-[#5855eb] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

