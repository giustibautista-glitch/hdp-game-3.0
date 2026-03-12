import { useState } from 'react';
import { useGame } from '../context/GameContext';
import Scoreboard from '../components/Scoreboard';

export default function Game() {
  const {
    room, hand, blackCard, judgeId, submissions, roundResult,
    myId, isJudge, isHost, submitCard, judgePick, nextRound,
    phase
  } = useGame();

  const [selectedCard, setSelectedCard] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showScores, setShowScores] = useState(false);

  const judge = room?.players?.find(p => p.id === judgeId);
  const myPlayer = room?.players?.find(p => p.id === myId);
  const alreadySubmitted = room?.players?.find(p => p.id === myId)?.submitted;

  const handleSubmit = async () => {
    if (selectedCard === null) return;
    try {
      await submitCard(selectedCard);
      setSubmitted(true);
      setSelectedCard(null);
    } catch (e) {}
  };

  const handleJudgePick = (index) => {
    judgePick(index);
  };

  const handleNextRound = () => {
    setSubmitted(false);
    setSelectedCard(null);
    nextRound();
  };

  if (!room || !blackCard) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-brand-muted animate-pulse font-mono">Cargando ronda...</div>
    </div>
  );

  return (
    <div className="min-h-screen noise-bg flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border bg-brand-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div>
          <span className="font-mono text-brand-muted text-xs uppercase">Ronda {room.currentRound}</span>
          <p className="font-body font-bold text-white text-sm">{myPlayer?.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowScores(!showScores)}
            className="text-xs font-mono text-brand-muted hover:text-white transition-colors flex items-center gap-1"
          >
            🏆 {myPlayer?.score}pts
          </button>
          <div className="text-xs font-mono text-brand-muted">
            {isJudge ? (
              <span className="text-brand-gold bg-brand-gold/10 px-2 py-1 rounded-full">⚖️ Juez</span>
            ) : (
              <span className="text-brand-accent/70 bg-brand-accent/10 px-2 py-1 rounded-full">🃏 {hand.length} cartas</span>
            )}
          </div>
        </div>
      </div>

      {/* Scoreboard overlay */}
      {showScores && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowScores(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm">
            <Scoreboard players={room.players} myId={myId} judgeId={judgeId} winScore={room.settings.winScore} />
            <button onClick={() => setShowScores(false)} className="btn-secondary w-full mt-3">Cerrar</button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {/* Black card */}
        <div className="card-black mb-5 animate-slide-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-brand-accent rounded-md flex items-center justify-center">
              <span className="text-xs text-white font-bold">🃏</span>
            </div>
            <span className="text-white/40 text-xs font-mono uppercase tracking-widest">Carta Negra</span>
          </div>
          <p className="text-white text-lg font-bold leading-snug">{blackCard}</p>
          <div className="mt-3 flex items-center gap-2 text-white/30 text-xs font-mono">
            <span>Juez: {judge?.name}</span>
            {isJudge && <span className="text-brand-gold">— ¡Eres el juez!</span>}
          </div>
        </div>

        {/* JUDGE VIEW - after all submitted */}
        {isJudge && phase === 'judging' && (
          <div className="animate-slide-up">
            <p className="text-center text-brand-gold font-body font-bold mb-4">
              ⚖️ Elige la respuesta más graciosa
            </p>
            <div className="space-y-3">
              {submissions.map((sub, i) => (
                <button
                  key={i}
                  onClick={() => handleJudgePick(i)}
                  className="card-white w-full text-left animate-slide-up hover:ring-2 hover:ring-brand-gold"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <p className="text-black font-bold">{sub.card}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* JUDGE VIEW - waiting for submissions */}
        {isJudge && phase === 'playing' && (
          <div className="glass-panel p-6 text-center animate-slide-up">
            <div className="text-4xl mb-3">⌛</div>
            <p className="text-white font-bold text-lg">Esperando respuestas...</p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {room.players.filter(p => p.id !== judgeId && p.isConnected).map(p => (
                <div key={p.id} className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${p.submitted ? 'bg-green-500/20 text-green-400' : 'bg-brand-surface text-brand-muted'}`}>
                  {p.submitted ? '✓' : '○'} {p.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PLAYER VIEW - select and submit */}
        {!isJudge && phase === 'playing' && !alreadySubmitted && (
          <div className="animate-slide-up">
            <p className="text-center text-white/60 font-body mb-3 text-sm">
              Selecciona tu carta más graciosa
            </p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {hand.map((card, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedCard(selectedCard === i ? null : i)}
                  className={`card-white card-deal text-left ${selectedCard === i ? 'selected' : ''}`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {card}
                </button>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={selectedCard === null}
              className="btn-primary w-full py-4"
            >
              {selectedCard !== null ? `Enviar: "${hand[selectedCard]}"` : 'Selecciona una carta'}
            </button>
          </div>
        )}

        {/* PLAYER VIEW - already submitted */}
        {!isJudge && phase === 'playing' && alreadySubmitted && (
          <div className="glass-panel p-6 text-center animate-bounce-in">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-white font-bold text-lg">¡Carta enviada!</p>
            <p className="text-brand-muted text-sm mt-1">Esperando al juez...</p>
          </div>
        )}

        {/* PLAYER VIEW - judging phase */}
        {!isJudge && phase === 'judging' && (
          <div className="glass-panel p-6 text-center animate-bounce-in">
            <div className="text-4xl mb-3">⚖️</div>
            <p className="text-white font-bold text-lg">{judge?.name} está eligiendo...</p>
          </div>
        )}

        {/* Round result */}
        {roundResult && (phase === 'roundEnd' || phase === 'judging') && (
          <div className="mt-4 animate-bounce-in">
            <div className={`glass-panel p-5 text-center border-2 ${roundResult.winnerId === myId ? 'border-brand-gold' : 'border-brand-border'}`}>
              <div className="text-4xl mb-2">{roundResult.winnerId === myId ? '🎉' : '🏆'}</div>
              <p className="font-display text-3xl text-brand-gold mb-1">{roundResult.winnerName}</p>
              <p className="text-white/60 text-sm mb-3">ganó esta ronda con:</p>
              <div className="card-white inline-block max-w-xs text-left">
                {roundResult.winnerCard}
              </div>
            </div>
            {isHost && (
              <button onClick={handleNextRound} className="btn-primary w-full mt-3 py-4 text-lg animate-pulse-glow">
                ➡️ Siguiente Ronda
              </button>
            )}
            {!isHost && (
              <p className="text-center text-brand-muted text-sm mt-3">
                Esperando al host...
              </p>
            )}
          </div>
        )}

        {/* Mini scoreboard always visible */}
        <div className="mt-6 pt-4 border-t border-brand-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-brand-muted text-xs uppercase tracking-widest font-mono">Puntajes</span>
            <span className="text-brand-muted text-xs font-mono">Meta: {room.settings.winScore}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[...room.players].sort((a, b) => b.score - a.score).slice(0, 4).map(p => (
              <div key={p.id} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${p.id === myId ? 'bg-brand-accent/10 border border-brand-accent/30' : 'bg-brand-card'}`}>
                <span className="font-body text-xs text-white/80 flex-1 truncate">{p.name}</span>
                <span className="font-mono font-bold text-brand-gold text-sm">{p.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
