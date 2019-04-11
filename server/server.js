const express = require('express');
const SocketServer = require('ws');
const uuidv4 = require('uuid/v4');
const request = require('request');
require('dotenv').config();

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
  // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () =>
    console.log(`Listening on ${PORT}`)
  );

const wss = new SocketServer.Server({ server });

const clientList = {};

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === SocketServer.OPEN) {
      client.send(data);
    }
  });
};

wss.on('connection', ws => {
  console.log('Client connected');
  connectClient(ws, wss.clients.size);

  ws.on('message', message => {
    const receivedMsg = JSON.parse(message);
  });
  ws.on('close', () => console.log('Client disconnected'));
});
