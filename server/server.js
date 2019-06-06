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

const getColor = () => '#233555';

const connectClient = (client, nbClients) => {
  const clientInfo = {
    id: uuidv4(),
    username: `Anonymous${nbClients}`,
    color: getColor(),
    type: 'clientInfo',
  };

  client.send(JSON.stringify(clientInfo));
};

const splitArguments = content => {
  console.log('Content', content);
  const splitContent = content.split(' ');

  const [command, ...arguments] = splitContent;

  return {
    command: command.replace('/', ''),
    arguments: arguments.join(' '),
  };
};

const getGiphy = (searchContent, cb) => {
  reqOptions = {
    url: `http://api.giphy.com/v1/gifs/search?api_key=${
      process.env.GIPHY_API_KEY
    }&q=${searchContent}`,
    json: true,
  };

  request(reqOptions, (err, resp, body) => {
    const { data } = body;

    const randomIndex = Math.floor(Math.random() * data.length);
    cb(data[randomIndex]);
  });
};

const getPokemon = (category, cb) => {
  const reqOptions = {
    url: `https://api.pokemontcg.io/v1/cards?types=${category}`,
    json: true,
  };
  request(reqOptions, (err, resp, body) => {
    const { cards } = body;

    const randomIndex = Math.floor(Math.random() * cards.length);

    cb(cards[randomIndex]);
  });
};

wss.on('connection', wsClient => {
  console.log('Client connected');
  connectClient(wsClient, wss.clients.size);

  wsClient.on('message', message => {
    const receivedMsg = JSON.parse(message);

    // if the first character is '/', we've got a command

    if (receivedMsg.content[0] === '/') {
      // separate the command and the arguements into 2 different variables
      const { command, arguments } = splitArguments(receivedMsg.content);

      // Reassign the content of received message
      receivedMsg.content = arguments;

      switch (command) {
        case 'me':
          receivedMsg.type = 'meMessage';
          wsClient.send(JSON.stringify(receivedMsg));
          break;
        case 'shrug':
          receivedMsg.type = 'shrugMessage';
          wss.broadcast(JSON.stringify(receivedMsg));
          break;
        case 'gif':
          receivedMsg.type = 'gifMessage';
          getGiphy(receivedMsg.content, giphy => {
            // Sending back the content as an object containing the title and url
            receivedMsg.content = {
              title: giphy.title,
              imageUrl: giphy.images.original.url,
            };

            wss.broadcast(JSON.stringify(receivedMsg));
          });

          break;
        case 'pokemon':
          receivedMsg.type = 'pokeMessage';
          getPokemon(receivedMsg.content, card => {
            receivedMsg.content = {
              name: card.name,
              imageUrl: card.imageUrl,
            };

            wss.broadcast(JSON.stringify(receivedMsg));
          });

          break;
        default:
          // Send an error message back if unkown command
          receivedMsg.type = 'errorMessage';
          receivedMsg.content = 'Error: unknown command.';
          wsClient.send(JSON.stringify(receivedMsg));
      }
    }
  });
  wsClient.on('close', () => console.log('Client disconnected'));
});
