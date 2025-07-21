// server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const url = require("url");

const app = express();
app.use(express.static("public")); // serve index.html

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: "/ws" });

const rooms = {};

wss.on("connection", (ws, req) => {
  const query = url.parse(req.url, true).query;
  const room = query.room || "default";

  if (!rooms[room]) rooms[room] = new Set();
  rooms[room].add(ws);

  ws.on("message", msg => {
    const message = msg.toString(); // ✅ convert to string to avoid [object Blob]
    for (const client of rooms[room]) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  ws.on("close", () => {
    rooms[room].delete(ws);
    if (rooms[room].size === 0) delete rooms[room];
  });
});

server.listen(3001, () => {
  console.log("✅ Chat server running at http://localhost:3001");
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});

