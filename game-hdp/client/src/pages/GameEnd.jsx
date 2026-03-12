import { useGame } from '../context/GameContext';

export default function GameEnd() {
  const { gameResult, room, myId, isHost, restartGame, goHome } = useGame();
  if (!gameResult) return null;

  const amWinner = gameResult.ranking[0]?.name === room?.players?.find(p => p.id === myId)?.name;

  return (
    <div className="min-h-screen noise-bg flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Confetti-like decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ['#ff3c3c', '#f5c842', '#fff', '#ff6b6b'][i % 4],
              animationDelay: `${Math.random() * 2}s`,
              opacity: 0.3
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="animate-bounce-in mb-8">
          <div className="text-7xl mb-4">{amWinner ? '👑' : '🏆'}</div>
          <p className="text-brand-muted text-xs uppercase tracking-widest mb-2">¡Tenemos ganador!</p>
          <h1 className="font-display text-6xl text-brand-gold mb-1">{gameResult.winner}</h1>
          <p className="text-white/60">se llevó la victoria</p>
        </div>

        {/* Ranking */}
        <div className="glass-panel p-5 mb-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-body font-bold text-white/80 text-xs uppercase tracking-widest mb-4">Ranking Final</h3>
          <div className="space-y-2">
            {gameResult.ranking.map((player, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${i === 0 ? 'bg-brand-gold/20 border border-brand-gold/40' : 'bg-brand-card'}`}
              >
                <span className="font-display text-2xl w-8 text-center">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
                </span>
                <span className={`font-body font-bold flex-1 text-left ${i === 0 ? 'text-brand-gold' : 'text-white'}`}>
                  {player.name}
                </span>
                <span className={`font-mono font-bold ${i === 0 ? 'text-brand-gold' : 'text-brand-muted'}`}>
                  {player.score} pts
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {isHost ? (
            <button onClick={restartGame} className="btn-primary w-full py-4 text-lg">
              🔄 Jugar de Nuevo
            </button>
          ) : (
            <div className="glass-panel p-4 text-center text-brand-muted text-sm">
              Esperando al host...
            </div>
          )}
          <button onClick={goHome} className="btn-secondary w-full py-3">
            🏠 Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
