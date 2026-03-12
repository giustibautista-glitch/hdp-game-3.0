export default function Scoreboard({ players, myId, judgeId, winScore }) {
  const sorted = [...(players || [])].sort((a, b) => b.score - a.score);

  return (
    <div className="glass-panel p-5">
      <h3 className="font-body font-bold text-white/80 text-xs uppercase tracking-widest mb-4">
        Marcador — Meta: {winScore} pts
      </h3>
      <div className="space-y-2">
        {sorted.map((player, i) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
              player.id === myId ? 'bg-brand-accent/15 border border-brand-accent/30' : 'bg-brand-card'
            } ${!player.isConnected ? 'opacity-40' : ''}`}
          >
            <span className="font-mono text-brand-muted w-5 text-center text-sm">{i + 1}</span>
            <div className="w-7 h-7 rounded-md bg-brand-surface flex items-center justify-center text-xs font-bold text-white/60">
              {player.name[0].toUpperCase()}
            </div>
            <span className={`font-body font-semibold flex-1 truncate ${player.id === myId ? 'text-white' : 'text-white/80'}`}>
              {player.name}
            </span>
            <div className="flex items-center gap-1.5">
              {player.id === judgeId && <span className="text-xs text-brand-gold">⚖️</span>}
              {!player.isConnected && <span className="text-xs text-red-400">✗</span>}
              <span className="font-mono font-bold text-brand-gold text-sm w-8 text-right">{player.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
