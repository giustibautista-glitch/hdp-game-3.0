const blackCards = require('../data/blackCards.json');
const whiteCards = require('../data/whiteCards.json');

const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createRoom(hostId, hostName, settings = {}) {
  let code;
  do { code = generateRoomCode(); } while (rooms.has(code));

  const room = {
    code,
    hostId,
    players: [{
      id: hostId,
      name: hostName,
      score: 0,
      hand: [],
      isConnected: true
    }],
    state: 'waiting', // waiting | playing | judging | roundEnd | gameEnd
    settings: {
      maxPlayers: settings.maxPlayers || 10,
      winScore: settings.winScore || 8,
      roundTime: settings.roundTime || 90
    },
    currentRound: 0,
    judgeIndex: 0,
    currentBlackCard: null,
    submissions: [],
    blackDeck: [],
    whiteDeck: [],
    usedBlackCards: [],
    usedWhiteCards: []
  };

  rooms.set(code, room);
  return room;
}

function getRoom(code) {
  return rooms.get(code) || null;
}

function joinRoom(code, playerId, playerName) {
  const room = rooms.get(code);
  if (!room) return { error: 'Sala no encontrada' };
  if (room.state !== 'waiting') return { error: 'La partida ya comenzó' };
  if (room.players.length >= room.settings.maxPlayers) return { error: 'Sala llena' };
  if (room.players.find(p => p.name.toLowerCase() === playerName.toLowerCase())) {
    return { error: 'Ese nombre ya está en uso' };
  }

  room.players.push({
    id: playerId,
    name: playerName,
    score: 0,
    hand: [],
    isConnected: true
  });

  return { room };
}

function startGame(code, playerId) {
  const room = rooms.get(code);
  if (!room) return { error: 'Sala no encontrada' };
  if (room.hostId !== playerId) return { error: 'Solo el host puede iniciar' };
  if (room.players.length < 2) return { error: 'Se necesitan al menos 2 jugadores' };
  if (room.state !== 'waiting') return { error: 'El juego ya inició' };

  room.blackDeck = shuffle(blackCards);
  room.whiteDeck = shuffle(whiteCards);
  room.state = 'playing';
  room.judgeIndex = 0;
  room.currentRound = 0;

  // Deal 10 cards to each player
  room.players.forEach(player => {
    player.hand = room.whiteDeck.splice(0, 10);
    player.score = 0;
  });

  return startRound(code);
}

function startRound(code) {
  const room = rooms.get(code);
  if (!room) return { error: 'Sala no encontrada' };

  room.currentRound++;
  room.submissions = [];
  room.state = 'playing';

  if (room.blackDeck.length === 0) {
    room.blackDeck = shuffle(blackCards);
  }
  room.currentBlackCard = room.blackDeck.pop();

  return { room };
}

function submitCard(code, playerId, cardIndex) {
  const room = rooms.get(code);
  if (!room) return { error: 'Sala no encontrada' };
  if (room.state !== 'playing') return { error: 'No es momento de enviar cartas' };

  const judge = room.players[room.judgeIndex % room.players.length];
  if (judge.id === playerId) return { error: 'El juez no puede enviar cartas' };

  if (room.submissions.find(s => s.playerId === playerId)) {
    return { error: 'Ya enviaste tu carta' };
  }

  const player = room.players.find(p => p.id === playerId);
  if (!player) return { error: 'Jugador no encontrado' };
  if (cardIndex < 0 || cardIndex >= player.hand.length) return { error: 'Carta inválida' };

  const card = player.hand[cardIndex];
  player.hand.splice(cardIndex, 1);

  // Draw new card
  if (room.whiteDeck.length === 0) {
    room.whiteDeck = shuffle(whiteCards);
  }
  player.hand.push(room.whiteDeck.pop());

  room.submissions.push({ playerId, card });

  const nonJudgePlayers = room.players.filter(p => p.id !== judge.id && p.isConnected);
  const allSubmitted = nonJudgePlayers.every(p => room.submissions.find(s => s.playerId === p.id));

  if (allSubmitted) {
    room.state = 'judging';
    room.submissions = shuffle(room.submissions);
  }

  return { room, allSubmitted };
}

function judgePick(code, judgeId, submissionIndex) {
  const room = rooms.get(code);
  if (!room) return { error: 'Sala no encontrada' };
  if (room.state !== 'judging') return { error: 'No es momento de juzgar' };

  const judge = room.players[room.judgeIndex % room.players.length];
  if (judge.id !== judgeId) return { error: 'Solo el juez puede elegir' };
  if (submissionIndex < 0 || submissionIndex >= room.submissions.length) return { error: 'Elección inválida' };

  const winner = room.submissions[submissionIndex];
  const winnerPlayer = room.players.find(p => p.id === winner.playerId);
  winnerPlayer.score++;

  room.state = 'roundEnd';

  const gameOver = winnerPlayer.score >= room.settings.winScore;
  if (gameOver) room.state = 'gameEnd';

  return { room, winnerId: winner.playerId, winnerName: winnerPlayer.name, winnerCard: winner.card, gameOver };
}

function nextRound(code, playerId) {
  const room = rooms.get(code);
  if (!room) return { error: 'Sala no encontrada' };
  if (room.hostId !== playerId) return { error: 'Solo el host puede avanzar' };

  room.judgeIndex++;
  return startRound(code);
}

function playerDisconnect(socketId) {
  for (const [code, room] of rooms.entries()) {
    const player = room.players.find(p => p.id === socketId);
    if (player) {
      player.isConnected = false;

      const connected = room.players.filter(p => p.isConnected);
      if (connected.length === 0) {
        rooms.delete(code);
      } else if (room.hostId === socketId && connected.length > 0) {
        room.hostId = connected[0].id;
      }

      return { code, room, disconnectedPlayer: player };
    }
  }
  return null;
}

function restartGame(code, playerId) {
  const room = rooms.get(code);
  if (!room) return { error: 'Sala no encontrada' };
  if (room.hostId !== playerId) return { error: 'Solo el host puede reiniciar' };

  room.players.forEach(p => { p.score = 0; p.hand = []; });
  room.state = 'waiting';
  room.currentRound = 0;
  room.judgeIndex = 0;
  room.submissions = [];
  room.currentBlackCard = null;

  return { room };
}

function getPublicRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    state: room.state,
    currentRound: room.currentRound,
    settings: room.settings,
    currentBlackCard: room.currentBlackCard,
    judgeId: room.players[room.judgeIndex % room.players.length]?.id,
    players: room.players.map(p => ({
      id: p.id,
      name: p.name,
      score: p.score,
      isConnected: p.isConnected,
      handCount: p.hand.length,
      submitted: room.submissions.some(s => s.playerId === p.id)
    })),
    submissionsCount: room.submissions.length,
    submissions: room.state === 'judging' ? room.submissions.map(s => ({ card: s.card })) : []
  };
}

module.exports = {
  createRoom, getRoom, joinRoom, startGame, submitCard,
  judgePick, nextRound, playerDisconnect, restartGame, getPublicRoom
};
