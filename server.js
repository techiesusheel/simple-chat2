// server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const url = require("url");

const app = express();
app.use(express.static("public")); // Serve index.html from 'public' folder

app.get("/", (req, res) => {
  res.send("Server is live! 🚀");
});

const PORT = process.env.PORT || 3001;
const server = http.createServer(app); // Use same server for both HTTP & WS

const wss = new WebSocket.Server({ server, path: "/ws" });

const rooms = {};

wss.on("connection", (ws, req) => {
  const query = url.parse(req.url, true).query;
  const room = query.room || "default";

  if (!rooms[room]) rooms[room] = new Set();
  rooms[room].add(ws);

  ws.on("message", msg => {
    const message = msg.toString(); // ensure text message
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

server.listen(PORT, () => {
  console.log(`✅ Chat server running at http://localhost:${PORT}`);
});
