const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const { setupWSConnection } = require('y-websocket/bin/utils');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const users = new Map();
const messages = [];
const MAX_HISTORY = 100;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('setNickname', (nickname, callback) => {
    const existingUser = Array.from(users.values()).find(u => u.nickname === nickname);
    if (existingUser) {
      callback({ success: false, error: '该昵称已被使用' });
      return;
    }
    
    users.set(socket.id, {
      id: socket.id,
      nickname: nickname,
      joinedAt: Date.now()
    });
    
    callback({ success: true });
    
    io.emit('userJoined', {
      id: socket.id,
      nickname: nickname,
      timestamp: Date.now()
    });
    
    io.emit('onlineUsers', Array.from(users.values()));
    
    socket.emit('history', messages);
  });

  socket.on('sendMessage', (content, callback) => {
    const user = users.get(socket.id);
    if (!user) {
      callback({ success: false, error: '请先设置昵称' });
      return;
    }

    const message = {
      id: Date.now().toString(),
      userId: socket.id,
      nickname: user.nickname,
      content: content,
      timestamp: Date.now()
    };

    messages.push(message);
    if (messages.length > MAX_HISTORY) {
      messages.shift();
    }

    io.emit('newMessage', message);
    callback({ success: true, message });
  });

  socket.on('getOnlineUsers', () => {
    socket.emit('onlineUsers', Array.from(users.values()));
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      console.log('User disconnected:', user.nickname);
      
      io.emit('userLeft', {
        id: socket.id,
        nickname: user.nickname,
        timestamp: Date.now()
      });
      
      users.delete(socket.id);
      io.emit('onlineUsers', Array.from(users.values()));
    }
  });
});

const yjsServer = new WebSocketServer({ noServer: true });

yjsServer.on('connection', (conn, req) => {
  setupWSConnection(conn, req);
});

server.on('upgrade', (request, socket, head) => {
  const pathname = request.url;
  if (pathname.startsWith('/yjs')) {
    yjsServer.handleUpgrade(request, socket, head, (ws) => {
      yjsServer.emit('connection', ws, request);
    });
  }
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server running at http://localhost:${PORT}`);
  console.log(`Y.js WebSocket at ws://localhost:${PORT}/yjs`);
});
