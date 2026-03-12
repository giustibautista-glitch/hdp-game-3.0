import { useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import GameEnd from './pages/GameEnd';
import Notification from './components/Notification';

function AppContent() {
  const { phase, setError } = useGame();

  // Handle ?code= URL param for direct join
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code && phase === 'home') {
      // Prefill code for user
      window.__prefillCode = code.toUpperCase();
    }
  }, []);

  return (
    <div className="min-h-screen bg-brand-black">
      <Notification />
      {phase === 'home' && <Home />}
      {phase === 'lobby' && <Lobby />}
      {(phase === 'playing' || phase === 'judging' || phase === 'roundEnd') && <Game />}
      {phase === 'gameEnd' && <GameEnd />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
