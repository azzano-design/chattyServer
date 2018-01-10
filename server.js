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
  type: 'system',
  content: userCount + ' users online'
}

wss.on('connection', function connection(ws) {
  console.log('Client connected. ' + (userCount += 1) + ' user[s] online.');
  // ws.send(JSON.stringify(userCount));
  // console.log(userCount);

  ws.on('message', function incoming(data) {
    const newData = JSON.parse(data);
    newData.id = uuidv1();
    console.log(typeof newData, newData);
    ws.send(JSON.stringify(newData));
  });

  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected. ' + (userCount -= 1) + ' user[s] online.');
    console.log(userCount);
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    if (client.readyState === SocketServer.OPEN) {
      const newData = JSON.parse(data);
      newData.id = uuidv1();
      console.log(typeof newData, newData);
      client.send(JSON.stringify(newData));
    }
  });
};
