import { useGame } from '../context/GameContext';

export default function Notification() {
  const { notification } = useGame();
  if (!notification) return null;

  const colors = {
    info: 'bg-brand-surface border-brand-border text-white',
    warning: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
    success: 'bg-green-500/20 border-green-500/40 text-green-300',
    error: 'bg-red-500/20 border-red-500/40 text-red-300'
  };

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl border text-sm font-body font-semibold shadow-xl animate-slide-up ${colors[notification.type] || colors.info}`}>
      {notification.msg}
    </div>
  );
}
