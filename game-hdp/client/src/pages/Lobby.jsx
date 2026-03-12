import { useGame } from '../context/GameContext';

export default function Lobby() {
  const { room, myId, isHost, startGame, goHome } = useGame();
  if (!room) return null;

  const shareUrl = `${window.location.origin}?code=${room.code}`;

  const copyCode = () => {
    navigator.clipboard.writeText(room.code).catch(() => {});
  };

  const shareRoom = () => {
    if (navigator.share) {
      navigator.share({ title: 'HDP - Juego de Cartas', text: `Únete a mi sala! Código: ${room.code}`, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
      alert('¡Link copiado!');
    }
  };

  return (
    <div className="min-h-screen noise-bg flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <p className="text-brand-muted text-xs uppercase tracking-widest mb-2">Sala de espera</p>
          <h1 className="font-display text-5xl text-white mb-1">HDP</h1>
          <p className="text-white/50 text-sm">
            {room.settings.winScore} puntos para ganar
          </p>
        </div>

        {/* Room code */}
        <div className="glass-panel p-6 mb-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-brand-muted text-xs uppercase tracking-widest mb-2 text-center">Código de sala</p>
          <div
            onClick={copyCode}
            className="bg-brand-card border border-brand-border rounded-xl p-4 text-center cursor-pointer hover:border-brand-accent/50 transition-colors group"
          >
            <span className="font-mono text-4xl font-bold text-white tracking-[0.3em] group-hover:text-brand-accent transition-colors">
              {room.code}
            </span>
            <p className="text-brand-muted text-xs mt-1">Toca para copiar</p>
          </div>
          <button onClick={shareRoom} className="btn-secondary w-full mt-3 text-sm py-2.5">
            📤 Compartir enlace
          </button>
        </div>

        {/* Players list */}
        <div className="glass-panel p-5 mb-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-body font-bold text-white/80 text-xs uppercase tracking-widest">
              Jugadores
            </h3>
            <span className="font-mono text-brand-muted text-xs">
              {room.players.length}/{room.settings.maxPlayers}
            </span>
          </div>
          <ul className="space-y-2">
            {room.players.filter(p => p.isConnected).map((player, i) => (
              <li
                key={player.id}
                className="flex items-center gap-3 bg-brand-card rounded-lg px-3 py-2.5 animate-slide-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-8 h-8 rounded-lg bg-brand-accent/20 flex items-center justify-center text-sm font-bold text-brand-accent">
                  {player.name[0].toUpperCase()}
                </div>
                <span className="font-body font-semibold text-white flex-1">{player.name}</span>
                <div className="flex items-center gap-1.5">
                  {player.id === room.hostId && (
                    <span className="text-xs bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded-full font-mono">Host</span>
                  )}
                  {player.id === myId && (
                    <span className="text-xs bg-brand-accent/20 text-brand-accent px-2 py-0.5 rounded-full font-mono">Tú</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {isHost ? (
            <>
              <button
                onClick={startGame}
                disabled={room.players.filter(p => p.isConnected).length < 2}
                className="btn-primary w-full py-4 text-lg"
              >
                {room.players.filter(p => p.isConnected).length < 2
                  ? 'Esperando jugadores...'
                  : '🚀 ¡Iniciar Partida!'}
              </button>
              <p className="text-center text-brand-muted text-xs">
                Se necesitan mínimo 2 jugadores
              </p>
            </>
          ) : (
            <div className="glass-panel p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
                <p className="text-brand-muted font-body">Esperando que el host inicie...</p>
              </div>
            </div>
          )}

          <button onClick={goHome} className="btn-secondary w-full py-3 text-sm">
            Salir
          </button>
        </div>
      </div>
    </div>
  );
}
