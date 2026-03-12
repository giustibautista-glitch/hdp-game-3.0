import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function Home() {
  const { createRoom, joinRoom, error, setError, connected } = useGame();
  const [mode, setMode] = useState(null); // null | create | join
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [winScore, setWinScore] = useState(8);
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) { setLocalError('Escribe tu nombre'); return; }
    setLoading(true); setLocalError('');
    try { await createRoom(name.trim(), { winScore }); }
    catch (e) { setLocalError(e); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    if (!name.trim()) { setLocalError('Escribe tu nombre'); return; }
    if (!code.trim()) { setLocalError('Escribe el código de sala'); return; }
    setLoading(true); setLocalError('');
    try { await joinRoom(name.trim(), code.trim().toUpperCase()); }
    catch (e) { setLocalError(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen noise-bg flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-brand-accent rounded-2xl flex items-center justify-center shadow-lg shadow-brand-accent/30">
              <span className="font-display text-white text-2xl">🃏</span>
            </div>
          </div>
          <h1 className="font-display text-7xl text-white tracking-wider leading-none mb-2">HDP</h1>
          <p className="text-brand-muted font-body text-sm uppercase tracking-widest">El juego de cartas irreverente</p>
        </div>

        {!mode ? (
          <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={() => setMode('create')}
              className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
            >
              <span>🎲</span> Crear Sala
            </button>
            <button
              onClick={() => setMode('join')}
              className="btn-secondary w-full text-lg py-4 flex items-center justify-center gap-2"
            >
              <span>🚪</span> Unirse a Sala
            </button>

            {!connected && (
              <p className="text-center text-brand-accent text-sm font-mono mt-4 animate-pulse">
                ⚡ Conectando al servidor...
              </p>
            )}

            <div className="glass-panel p-4 mt-6">
              <h3 className="font-body font-bold text-white/80 text-xs uppercase tracking-widest mb-3">¿Cómo jugar?</h3>
              <ul className="space-y-2 text-brand-muted text-sm">
                <li className="flex gap-2"><span className="text-brand-accent">1.</span> Crea o únete a una sala</li>
                <li className="flex gap-2"><span className="text-brand-accent">2.</span> El juez muestra una carta negra</li>
                <li className="flex gap-2"><span className="text-brand-accent">3.</span> Completa la frase con tu carta más graciosa</li>
                <li className="flex gap-2"><span className="text-brand-accent">4.</span> El juez elige al ganador de la ronda</li>
                <li className="flex gap-2"><span className="text-brand-accent">5.</span> ¡El primero en llegar al puntaje gana!</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 animate-bounce-in">
            <button
              onClick={() => { setMode(null); setLocalError(''); }}
              className="text-brand-muted hover:text-white mb-4 text-sm flex items-center gap-1 transition-colors"
            >
              ← Volver
            </button>

            <h2 className="font-display text-3xl text-white mb-6">
              {mode === 'create' ? 'Crear Sala' : 'Unirse a Sala'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-brand-muted mb-1 font-body">Tu nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (mode === 'create' ? handleCreate() : handleJoin())}
                  placeholder="¿Cómo te llamas?"
                  maxLength={20}
                  className="input-field"
                  autoFocus
                />
              </div>

              {mode === 'join' && (
                <div>
                  <label className="block text-sm text-brand-muted mb-1 font-body">Código de sala</label>
                  <input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    placeholder="EJ: ABXRT"
                    maxLength={5}
                    className="input-field font-mono text-xl tracking-widest uppercase"
                  />
                </div>
              )}

              {mode === 'create' && (
                <div>
                  <label className="block text-sm text-brand-muted mb-1 font-body">
                    Puntos para ganar: <span className="text-white font-bold">{winScore}</span>
                  </label>
                  <input
                    type="range"
                    min={3} max={15}
                    value={winScore}
                    onChange={e => setWinScore(Number(e.target.value))}
                    className="w-full accent-brand-accent"
                  />
                  <div className="flex justify-between text-xs text-brand-muted">
                    <span>3 (rápido)</span><span>15 (largo)</span>
                  </div>
                </div>
              )}

              {(localError || error) && (
                <p className="text-brand-accent text-sm bg-brand-accent/10 rounded-lg px-3 py-2">
                  ⚠️ {localError || error}
                </p>
              )}

              <button
                onClick={mode === 'create' ? handleCreate : handleJoin}
                disabled={loading || !connected}
                className="btn-primary w-full py-4"
              >
                {loading ? 'Conectando...' : mode === 'create' ? '🎲 Crear Sala' : '🚪 Entrar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
