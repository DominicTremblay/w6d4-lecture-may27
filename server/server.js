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

const getCommandParts = message => {
  const parts = message.split(' ');
  const [cmd, ...content] = parts;

  return {
    cmd: cmd.replace('/', '').toLowerCase(),
    content: content.join(' '),
  };
};

const getPokemonCard = (content, cb) => {
  const reqOptions = {
    url: `https://api.pokemontcg.io/v1/cards?types=${content}`,
    json: true,
  };

  request(reqOptions, (err, req, data) => {
    if (err) {
      console.log(err);
    }

    const { cards } = data;
    const card = cards[Math.floor(Math.random() * cards.length)];
    cb(card);
  });
};

const connectClient = (client, nb) => {
  clientId = uuidv4();
  client.id = clientId;
  clientList[clientId] = {
    id: clientId,
    username: `Anonymous${nb}`,
  };

  console.log(clientList);

  const clientInfo = clientList[clientId];
  clientInfo.type = 'incomingClientInfo';
  console.log(clientInfo);
  client.send(JSON.stringify(clientInfo));
};

const getUsernames = () =>
  Object.values(clientList).map(client => client.username);

const getGiphy = (content, cb) => {
  reqOptions = {
    url: `http://api.giphy.com/v1/gifs/search?api_key=${
      process.env.GIPHY_API_KEY
    }&q=${content}`,
    json: true,
  };

  request(reqOptions, (err, req, gifs) => {
    const { data } = gifs;
    console.log(data);
    cb(data[Math.floor(Math.random() * data.length)]);
  });
};

wss.on('connection', ws => {
  console.log('Client connected');
  connectClient(ws, wss.clients.size);

  ws.on('message', message => {
    const receivedMsg = JSON.parse(message);

    if (receivedMsg.content[0] === '/') {
      const { cmd, content } = getCommandParts(receivedMsg.content);

      receivedMsg.id = uuidv4();

      switch (cmd) {
        case 'me':
          receivedMsg.type = 'meMessage';
          receivedMsg.content = content;
          wss.broadcast(JSON.stringify(receivedMsg));
          break;

        case 'shrug':
          receivedMsg.type = 'shrugMessage';
          receivedMsg.id = uuidv4();
          receivedMsg.content = `${content} ¯\\_(ツ)_/¯`;
          wss.broadcast(JSON.stringify(receivedMsg));
          break;

        case 'who':
          receivedMsg.type = 'whoMessage';
          receivedMsg.id = uuidv4();
          receivedMsg.content = getUsernames();
          ws.send(JSON.stringify(receivedMsg));
          break;
        case 'pokemon':
          getPokemonCard(content, card => {
            receivedMsg.content = {
              name: card.name,
              image: card.imageUrl,
            };
            receivedMsg.type = 'pokeMessage';
            console.log(receivedMsg);
            wss.broadcast(JSON.stringify(receivedMsg));
          });
          break;
        case 'gif':
          getGiphy(content, gif => {
            receivedMsg.type = 'gifMessage';
            receivedMsg.content = {
              title: gif.title,
              image: gif.images.original.url,
            };
            console.log(receivedMsg);
            wss.broadcast(JSON.stringify(receivedMsg));
          });
          break;
        default:
          receivedMsg.type = 'errorMessage';
          receivedMsg.content = 'Error: Unknown type of message';
          ws.send(JSON.stringify(receivedMsg));
      }
    }
  });
  ws.on('close', () => console.log('Client disconnected'));
});
