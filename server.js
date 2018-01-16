const express = require('express');
const SocketServer = require('ws').Server;
const uuidv1 = require('uuid/v1');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.


let userCount = 0;

let systemMessage = {
  type: 'count',
  content: userCount
}

wss.on('connection', function connection(ws) {

  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === ws.OPEN) {
        userCount += 1;
        client.send(data);
      }
    });
  };

  systemMessage.content = userCount
  wss.broadcast(JSON.stringify(systemMessage));

  ws.on('message', function incoming(data) {
    const newData = JSON.parse(data);
    if (newData.type === 'count') {
      newData.id = uuidv1();
      console.log('Received count update');
    }
    else if (newData.type === 'system') {
      newData.id = uuidv1();
      console.log('Received system update');
    }
    else if (newData.type === 'message') {
      newData.id = uuidv1();
      console.log('Received message update');
    }
    wss.broadcast(JSON.stringify(newData));
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    userCount -= 1;
    systemMessage.content = 'Client connected. ' + (userCount -= 1) + ' user[s] online.'
    wss.broadcast(JSON.stringify(systemMessage));
  });
});
