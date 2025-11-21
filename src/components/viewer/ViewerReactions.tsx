import { useStreamStore } from '../../stores/useStreamStore';
import { motion, AnimatePresence } from 'framer-motion';

const reactionTypes = ['👍', '❤️', '😂', '👏'] as const;

interface ViewerReactionsProps {
  sendReaction: (reaction: string) => void;
}

export const ViewerReactions = ({ sendReaction }: ViewerReactionsProps) => {
  const { reactions } = useStreamStore();

  return (
    <div className="relative">
      <div className="flex items-center gap-2 bg-[#1a1a1a] border border-border rounded-lg p-2">
        {reactionTypes.map((type) => (
          <button
            key={type}
            onClick={() => sendReaction(type)}
            className="p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors duration-150 text-2xl"
            title={`Добавить реакцию ${type}`}
          >
            {type}
          </button>
        ))}
      </div>

      {/* Animated Reactions */}
      <AnimatePresence>
        {reactions.map((reaction) => {
          const randomOffset = (Math.random() - 0.5) * 200;
          return (
            <motion.div
              key={reaction.id}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -150, scale: 1, x: randomOffset }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="absolute left-1/2 text-4xl pointer-events-none z-50"
            >
              {reaction.type}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

