import { useStreamStore } from '../../stores/useStreamStore';

export const Poll = () => {
  const { activePoll, votePoll } = useStreamStore();

  if (!activePoll) return null;

  const totalVotes = Object.values(activePoll.votes).reduce((sum, count) => sum + count, 0);

  return (
    <div className="p-4 bg-[#0f0f0f] border border-border rounded-lg mb-4">
      <h3 className="text-sm font-medium text-white mb-3">{activePoll.question}</h3>
      <div className="space-y-2">
        {activePoll.options.map((option) => {
          const votes = activePoll.votes[option] || 0;
          const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;

          return (
            <button
              key={option}
              onClick={() => votePoll(activePoll.id, option)}
              className="w-full p-3 bg-[#1a1a1a] rounded-lg hover:bg-[#2a2a2a] transition-colors duration-150 text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between relative z-10">
                <span className="text-sm text-white">{option}</span>
                <span className="text-xs text-text-muted">{votes} голосов</span>
              </div>
              <div
                className="absolute inset-0 bg-accent-blue/20 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-text-muted">
        Всего голосов: {totalVotes}
      </div>
    </div>
  );
};

