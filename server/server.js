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

// Closure. Returns a function that will get the next color in the array.
const getColor = colors => {
  let index = 0;

  return () => {
    const nextColor = colors[index];

    index = (index + 1) % colors.length;
    return nextColor;
  };
};

// Assign the return function of getColors
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

// splitting the command and the arguments separately
const splitArguments = content => {
  // desctructuring the array. Using the rest(...) operator to gather arguments
  const [command, ...arguments] = content.split(' ');

  // returning the command and the arguments
  return {
    command: command.replace('/', '').toLowerCase(),
    arguments: arguments.join(' '),
  };
};

// Making a request to the pokemon API to get a list of cards according to a category
const getPokemonCard = (category, cb) => {
  const reqOptions = {
    url: `https://api.pokemontcg.io/v1/cards?types=${category}`,
    json: true,
  };

  request(reqOptions, function(error, response, data) {
    if (error) {
      console.log('error:', error); // Print the error if one occurred
    }

    // destructuring cards to get the array
    const { cards } = data;

    // generating a random Index
    const randomIndex = Math.floor(Math.random() * cards.length);

    // Returning a random card
    cb(cards[randomIndex]);
  });
};

// Making a request to the giphy API to get a list of cards according to a category
// You need to register and get your own api key
const getGiphy = (searchContent, cb) => {
  reqOptions = {
    url: `http://api.giphy.com/v1/gifs/search?api_key=${
      process.env.GIPHY_API_KEY
    }&q=${searchContent}`,
    json: true,
  };

  request(reqOptions, (error, response, images) => {
    if (error) {
      console.log('error:', error); // Print the error if one occurred
    }

    const { data } = images;

    // generating a random Index
    const randomIndex = Math.floor(Math.random() * data.length);

    // return a random gif image
    cb(data[randomIndex]);
  });
};

wss.on('connection', wsClient => {
  console.log('Client connected');
  connectClient(wsClient, wss.clients.size);

  wsClient.on('message', message => {
    const receivedMsg = JSON.parse(message);

    // Adding the id to the message
    receivedMsg.id = uuidv4();

    // Is it a command such as /me ?
    const isCommand = receivedMsg.content[0] === '/';

    if (isCommand) {
      // separating the command and the arguments parts
      const { command, arguments } = splitArguments(receivedMsg.content);

      switch (command) {
      case 'me':
        receivedMsg.type = 'meMessage';
        receivedMsg.content = arguments;
        wss.broadcast(JSON.stringify(receivedMsg));
        break;
      case 'shrug':
        receivedMsg.type = 'shrugMessage';
        receivedMsg.content = arguments;
        wss.broadcast(JSON.stringify(receivedMsg));
        break;
      case 'pokemon':
        receivedMsg.type = 'pokeMessage';
        // request to the pokemon API
        // provide a callback function
        getPokemonCard(arguments, card => {
          receivedMsg.content = {
            name: card.name,
            imageUrl: card.imageUrl,
          };
          wss.broadcast(JSON.stringify(receivedMsg));
        });

        break;
      case 'gif':
        receivedMsg.type = 'gifMessage';
        // request to the giphy API
        // provide a callback function
        getGiphy(arguments, image => {
          receivedMsg.content = {
            title: image.title,
            imageUrl: image.images.original.url,
          };

          wss.broadcast(JSON.stringify(receivedMsg));
        });
        break;
      default:
        // if we use a command not in the list
        receivedMsg.type = 'errorMessage';
        receivedMsg.content = 'Error. Unknown command';
        wsClient.send(JSON.stringify(receivedMsg));
      }
    }
  });
  wsClient.on('close', () => console.log('Client disconnected'));
});
