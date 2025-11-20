import { useStreamStore } from '../../stores/useStreamStore';
import { motion, AnimatePresence } from 'framer-motion';

const reactionTypes = ['👍', '❤️', '😂', '👏'] as const;

export const Reactions = () => {
  const { reactions, addReaction } = useStreamStore();

  return (
    <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-[#1a1a1a] border border-border rounded-lg p-2">
        {reactionTypes.map((type) => (
          <button
            key={type}
            onClick={() => addReaction(type)}
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

