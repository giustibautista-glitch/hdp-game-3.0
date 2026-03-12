const {
  createRoom, getRoom, joinRoom, startGame, submitCard,
  judgePick, nextRound, playerDisconnect, restartGame, getPublicRoom
} = require('./rooms');

module.exports = function setupSockets(io) {
  io.on('connection', (socket) => {
    console.log(`[+] Connected: ${socket.id}`);

    socket.on('createRoom', ({ playerName, settings }, cb) => {
      if (!playerName?.trim()) return cb({ error: 'Nombre requerido' });
      const room = createRoom(socket.id, playerName.trim(), settings);
      socket.join(room.code);
      cb({ room: getPublicRoom(room), hand: room.players[0].hand });
    });

    socket.on('joinRoom', ({ playerName, roomCode }, cb) => {
      if (!playerName?.trim()) return cb({ error: 'Nombre requerido' });
      if (!roomCode?.trim()) return cb({ error: 'Código requerido' });
      const result = joinRoom(roomCode.toUpperCase(), socket.id, playerName.trim());
      if (result.error) return cb(result);
      socket.join(roomCode.toUpperCase());
      const publicRoom = getPublicRoom(result.room);
      io.to(roomCode.toUpperCase()).emit('roomUpdate', { room: publicRoom });
      const player = result.room.players.find(p => p.id === socket.id);
      cb({ room: publicRoom, hand: player.hand });
    });

    socket.on('startGame', ({ roomCode }, cb) => {
      const result = startGame(roomCode, socket.id);
      if (result.error) return cb(result);
      const room = result.room;
      room.players.forEach(player => {
        io.to(player.id).emit('cardsReceived', { hand: player.hand });
      });
      io.to(roomCode).emit('roundStart', {
        room: getPublicRoom(room),
        blackCard: room.currentBlackCard,
        judgeId: room.players[room.judgeIndex % room.players.length].id
      });
      cb({ success: true });
    });

    socket.on('submitCard', ({ roomCode, cardIndex }, cb) => {
      const result = submitCard(roomCode, socket.id, cardIndex);
      if (result.error) return cb(result);
      const room = result.room;
      const publicRoom = getPublicRoom(room);
      io.to(roomCode).emit('roomUpdate', { room: publicRoom });
      if (result.allSubmitted) {
        io.to(roomCode).emit('allSubmitted', {
          room: publicRoom,
          submissions: room.submissions.map(s => ({ card: s.card }))
        });
      }
      cb({ success: true, hand: room.players.find(p => p.id === socket.id)?.hand });
    });

    socket.on('judgePick', ({ roomCode, submissionIndex }, cb) => {
      const result = judgePick(roomCode, socket.id, submissionIndex);
      if (result.error) return cb(result);
      io.to(roomCode).emit('roundWinner', {
        room: getPublicRoom(result.room),
        winnerId: result.winnerId,
        winnerName: result.winnerName,
        winnerCard: result.winnerCard,
        gameOver: result.gameOver
      });
      if (result.gameOver) {
        const sorted = [...result.room.players].sort((a, b) => b.score - a.score);
        io.to(roomCode).emit('gameEnd', {
          winner: result.winnerName,
          ranking: sorted.map(p => ({ name: p.name, score: p.score }))
        });
      }
      cb({ success: true });
    });

    socket.on('nextRound', ({ roomCode }, cb) => {
      const result = nextRound(roomCode, socket.id);
      if (result.error) return cb(result);
      const room = result.room;
      room.players.forEach(player => {
        io.to(player.id).emit('cardsReceived', { hand: player.hand });
      });
      io.to(roomCode).emit('roundStart', {
        room: getPublicRoom(room),
        blackCard: room.currentBlackCard,
        judgeId: room.players[room.judgeIndex % room.players.length].id
      });
      cb({ success: true });
    });

    socket.on('restartGame', ({ roomCode }, cb) => {
      const result = restartGame(roomCode, socket.id);
      if (result.error) return cb(result);
      io.to(roomCode).emit('roomUpdate', { room: getPublicRoom(result.room) });
      cb({ success: true });
    });

    socket.on('getRoomState', ({ roomCode }, cb) => {
      const room = getRoom(roomCode);
      if (!room) return cb({ error: 'Sala no encontrada' });
      const player = room.players.find(p => p.id === socket.id);
      cb({ room: getPublicRoom(room), hand: player?.hand || [] });
    });

    socket.on('disconnect', () => {
      console.log(`[-] Disconnected: ${socket.id}`);
      const result = playerDisconnect(socket.id);
      if (result) {
        const { code, room, disconnectedPlayer } = result;
        io.to(code).emit('playerDisconnected', {
          room: getPublicRoom(room),
          playerName: disconnectedPlayer.name
        });
      }
    });
  });
};
