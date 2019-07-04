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

wss.broadcast = data => {
  wss.clients.forEach(client => {
    if (client.readyState === SocketServer.OPEN) {
      client.send(data);
    }
  });
};

const getColor = colors => {
  let index = 0;

  return () => {
    const nextColor = colors[index];

    index = (index + 1) % colors.length;
    return nextColor;
  };
};

const nextColor = getColor([
  'red',
  'blue',
  'orange',
  'pink',
  'green',
  'coral',
  'royalblue',
  'salmon',
]);

const connectClient = (client, nbClients) => {
  const clientInfo = {
    id: uuidv4(),
    username: `Anonymous${nbClients}`,
    color: getColor(),
    type: 'clientInfo',
  };

  client.send(JSON.stringify(clientInfo));
};

wss.on('connection', wsClient => {
  console.log('Client connected');
  connectClient(wsClient, wss.clients.size);

  wsClient.on('message', message => {
    const receivedMsg = JSON.parse(message);

    console.log(receivedMsg);
  });
  wsClient.on('close', () => console.log('Client disconnected'));
});
