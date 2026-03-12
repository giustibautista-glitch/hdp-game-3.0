# 🃏 HDP — El Juego de Cartas

Juego de cartas multijugador online inspirado en Cards Against Humanity, con frases en español para jugar con amigos desde cualquier dispositivo.

---

## 🎮 Cómo Jugar

1. **Crea una sala** y comparte el código de 5 letras con tus amigos
2. El **juez** de la ronda lee una **carta negra** con una frase incompleta
3. Los demás jugadores eligen su **carta blanca** más graciosa
4. El juez elige la respuesta más chistosa → ese jugador gana un punto
5. El rol de juez rota cada ronda
6. ¡El primero en llegar al puntaje objetivo gana!

---

## 🗂 Estructura del Proyecto

```
game-hdp/
├── client/               # Frontend React + Vite + TailwindCSS
│   └── src/
│       ├── components/   # Componentes reutilizables
│       ├── context/      # GameContext (estado global)
│       ├── hooks/        # useSocket
│       └── pages/        # Home, Lobby, Game, GameEnd
├── server/               # Backend Node.js + Express + Socket.io
│   ├── server.js         # Punto de entrada
│   ├── socket.js         # Manejo de eventos Socket.io
│   └── rooms.js          # Lógica de salas y juego
├── data/
│   ├── blackCards.json   # Cartas negras (frases)
│   └── whiteCards.json   # Cartas blancas (respuestas)
├── render.yaml           # Config para Render.com
├── railway.toml          # Config para Railway
└── README.md
```

---

## ⚙️ Instalación y Desarrollo Local

### Requisitos

- Node.js v18+
- npm v8+

### 1. Clonar e instalar

```bash
git clone <tu-repo>
cd game-hdp

# Instalar dependencias del servidor
cd server && npm install && cd ..

# Instalar dependencias del cliente
cd client && npm install && cd ..
```

### 2. Ejecutar en desarrollo

**Terminal 1 — Servidor:**
```bash
cd server
npm run dev
# Servidor en http://localhost:3001
```

**Terminal 2 — Cliente:**
```bash
cd client
npm run dev
# Cliente en http://localhost:5173
```

Abre `http://localhost:5173` en el navegador.

---

## 🚀 Deploy en Producción

### Opción A — Render.com (Recomendado, GRATIS)

1. Sube tu proyecto a GitHub
2. Ve a [render.com](https://render.com) → New Web Service
3. Conecta tu repositorio
4. Render detectará el `render.yaml` automáticamente
5. Click en **Deploy**
6. Tu juego estará en `https://hdp-game.onrender.com`

**Variables de entorno en Render:**
```
NODE_ENV=production
PORT=3001
```

### Opción B — Railway.app

1. Ve a [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Selecciona tu repo
4. Railway detecta el `railway.toml` automáticamente
5. Deploy automático en cada push

### Opción C — VPS / DigitalOcean

```bash
# En el servidor
git clone <tu-repo>
cd game-hdp

# Build del cliente
cd client && npm install && npm run build

# Instalar servidor
cd ../server && npm install

# Ejecutar con PM2
npm install -g pm2
pm2 start server.js --name hdp-game
pm2 save
pm2 startup
```

Con Nginx como reverse proxy:
```nginx
server {
    listen 80;
    server_name tudominio.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🃏 Agregar Cartas

Las cartas están en la carpeta `data/`. Puedes editarlas fácilmente:

### `data/blackCards.json`
Array de strings. Usa `___` para el espacio en blanco:
```json
[
  "Lo que nadie sabe de mí es ___.",
  "Mi mayor miedo es ___.",
  "Nueva carta que agregaste aquí."
]
```

### `data/whiteCards.json`
Array de strings con respuestas:
```json
[
  "Tu nueva respuesta graciosa",
  "Otra respuesta aquí"
]
```

---

## 🔌 Eventos Socket.io

### Cliente → Servidor
| Evento | Datos | Descripción |
|--------|-------|-------------|
| `createRoom` | `{ playerName, settings }` | Crear sala |
| `joinRoom` | `{ playerName, roomCode }` | Unirse a sala |
| `startGame` | `{ roomCode }` | Iniciar partida (host) |
| `submitCard` | `{ roomCode, cardIndex }` | Enviar carta |
| `judgePick` | `{ roomCode, submissionIndex }` | Juez elige ganador |
| `nextRound` | `{ roomCode }` | Siguiente ronda (host) |
| `restartGame` | `{ roomCode }` | Reiniciar juego (host) |

### Servidor → Cliente
| Evento | Datos | Descripción |
|--------|-------|-------------|
| `roomUpdate` | `{ room }` | Estado de sala actualizado |
| `roundStart` | `{ room, blackCard, judgeId }` | Nueva ronda |
| `cardsReceived` | `{ hand }` | Cartas del jugador |
| `allSubmitted` | `{ room, submissions }` | Todos enviaron cartas |
| `roundWinner` | `{ winnerId, winnerName, winnerCard }` | Ganador de ronda |
| `gameEnd` | `{ winner, ranking }` | Fin del juego |
| `playerDisconnected` | `{ room, playerName }` | Jugador se fue |

---

## 🔧 Variables de Entorno

### Cliente (`client/.env.local`)
```
VITE_SERVER_URL=https://tu-server.com
```

### Servidor (`server/.env`)
```
PORT=3001
NODE_ENV=production
CLIENT_URL=https://tu-frontend.com
```

---

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ iOS Safari (iPhone/iPad)
- ✅ Android Chrome
- ✅ Desktop + Mobile

---

## 🛡 Seguridad Implementada

- Un jugador no puede enviar más de una carta por ronda
- Solo el juez puede elegir ganador
- Solo el host puede iniciar/reiniciar/avanzar rondas
- Validación de nombres duplicados en sala
- Manejo de desconexión de jugadores
- El host migra al siguiente jugador si se desconecta

---

## 📄 Licencia

MIT — úsalo, modifícalo, compártelo. ¡Juega responsablemente! 🃏
