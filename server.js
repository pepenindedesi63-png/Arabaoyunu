const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const srv = http.createServer(app);
const io = new Server(srv, { cors: { origin: '*' } });
app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

const players = {};

io.on('connection', (s) => {
  players[s.id] = { id: s.id, x: 1000, y: 1000, a: 0, hue: Math.floor(Math.random() * 360) };
  s.emit('init', { id: s.id, players });
  s.broadcast.emit('join', players[s.id]);

  s.on('state', (d) => {
    const p = players[s.id];
    if (!p) return;
    p.x = d.x; p.y = d.y; p.a = d.a;
    s.broadcast.emit('state', { id: s.id, x: d.x, y: d.y, a: d.a });
  });

  s.on('disconnect', () => {
    delete players[s.id];
    io.emit('leave', s.id);
  });
});

const PORT = process.env.PORT || 3000;
srv.listen(PORT, () => console.log('Sunucu hazır: http://localhost:' + PORT));
