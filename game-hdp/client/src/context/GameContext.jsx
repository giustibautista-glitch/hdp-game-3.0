import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { socket, connected } = useSocket();
  const [room, setRoom] = useState(null);
  const [hand, setHand] = useState([]);
  const [phase, setPhase] = useState('home'); // home | lobby | playing | judging | roundEnd | gameEnd
  const [blackCard, setBlackCard] = useState(null);
  const [judgeId, setJudgeId] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [roundResult, setRoundResult] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [myId, setMyId] = useState(null);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (socket) setMyId(socket.id);
  }, [socket, connected]);

  const notify = useCallback((msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('roomUpdate', ({ room }) => {
      setRoom(room);
      if (room.state === 'waiting') setPhase('lobby');
    });

    socket.on('roundStart', ({ room, blackCard, judgeId }) => {
      setRoom(room);
      setBlackCard(blackCard);
      setJudgeId(judgeId);
      setSubmissions([]);
      setRoundResult(null);
      setPhase('playing');
    });

    socket.on('cardsReceived', ({ hand }) => {
      setHand(hand);
    });

    socket.on('allSubmitted', ({ room, submissions }) => {
      setRoom(room);
      setSubmissions(submissions);
      setPhase('judging');
    });

    socket.on('roundWinner', ({ room, winnerId, winnerName, winnerCard, gameOver }) => {
      setRoom(room);
      setRoundResult({ winnerId, winnerName, winnerCard });
      if (!gameOver) setPhase('roundEnd');
    });

    socket.on('gameEnd', ({ winner, ranking }) => {
      setGameResult({ winner, ranking });
      setPhase('gameEnd');
    });

    socket.on('playerDisconnected', ({ room, playerName }) => {
      setRoom(room);
      notify(`${playerName} se desconectó`, 'warning');
    });

    return () => {
      socket.off('roomUpdate');
      socket.off('roundStart');
      socket.off('cardsReceived');
      socket.off('allSubmitted');
      socket.off('roundWinner');
      socket.off('gameEnd');
      socket.off('playerDisconnected');
    };
  }, [socket, notify]);

  const createRoom = useCallback((playerName, settings) => {
    return new Promise((resolve, reject) => {
      socket.emit('createRoom', { playerName, settings }, (res) => {
        if (res.error) { setError(res.error); reject(res.error); return; }
        setRoom(res.room);
        setHand(res.hand);
        setMyId(socket.id);
        setPhase('lobby');
        resolve(res);
      });
    });
  }, [socket]);

  const joinRoom = useCallback((playerName, roomCode) => {
    return new Promise((resolve, reject) => {
      socket.emit('joinRoom', { playerName, roomCode }, (res) => {
        if (res.error) { setError(res.error); reject(res.error); return; }
        setRoom(res.room);
        setHand(res.hand);
        setMyId(socket.id);
        setPhase('lobby');
        resolve(res);
      });
    });
  }, [socket]);

  const startGame = useCallback(() => {
    socket.emit('startGame', { roomCode: room.code }, (res) => {
      if (res?.error) setError(res.error);
    });
  }, [socket, room]);

  const submitCard = useCallback((cardIndex) => {
    return new Promise((resolve, reject) => {
      socket.emit('submitCard', { roomCode: room.code, cardIndex }, (res) => {
        if (res?.error) { setError(res.error); reject(res.error); return; }
        setHand(res.hand);
        resolve(res);
      });
    });
  }, [socket, room]);

  const judgePick = useCallback((submissionIndex) => {
    socket.emit('judgePick', { roomCode: room.code, submissionIndex }, (res) => {
      if (res?.error) setError(res.error);
    });
  }, [socket, room]);

  const nextRound = useCallback(() => {
    socket.emit('nextRound', { roomCode: room.code }, (res) => {
      if (res?.error) setError(res.error);
    });
  }, [socket, room]);

  const restartGame = useCallback(() => {
    socket.emit('restartGame', { roomCode: room.code }, (res) => {
      if (res?.error) setError(res.error);
    });
  }, [socket, room]);

  const goHome = useCallback(() => {
    setRoom(null);
    setHand([]);
    setPhase('home');
    setBlackCard(null);
    setJudgeId(null);
    setSubmissions([]);
    setRoundResult(null);
    setGameResult(null);
  }, []);

  const isJudge = myId && judgeId && myId === judgeId;
  const isHost = myId && room && myId === room.hostId;
  const myPlayer = room?.players?.find(p => p.id === myId);

  return (
    <GameContext.Provider value={{
      socket, connected, room, hand, phase, blackCard, judgeId,
      submissions, roundResult, gameResult, myId, error, notification,
      isJudge, isHost, myPlayer,
      createRoom, joinRoom, startGame, submitCard, judgePick,
      nextRound, restartGame, goHome, setError, notify
    }}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
