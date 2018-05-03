'use strict';

const net = require('net');
const Event = require('events');
const Client = require('../model/client.js');

const PORT = process.env.PORT || 3000;

const chatServer = net.createServer();
const eventNew = new Event();

const chatPool = [];

chatServer.on('connection', function(socket) {
  var client = new Client(socket);
  chatPool.push(client);
  console.log(client.socket);
  console.log(client.nickname);

  eventNew.on('default', function(client) {
    client.socket.write('Improper command, please begin with @\n');
  });

  socket.on('data', function(data) {
    console.log('data', data.toString());
    const command = data.toString().split(' ').shift().trim();
    if (command.startsWith('@')) {
      eventNew.emit(command, client, data.toString().split(' ').splice(1).join(' '));
      console.log(data.toString().split(' ').splice(1).join(' '));
      console.log(command);
      return;
    };
    eventNew.emit('default', client);
  });

  //test
  socket.on('end', function() {
    chatPool.splice(chatPool.indexOf(client), 1);
    console.log('remove client');
  });
  //test

});

eventNew.on('@all', function(client, string) {
  chatPool.forEach(poolPerson => {
    poolPerson.socket.write(`${client.nickname}: ${string}`);
  });
});

eventNew.on('@to', function(client, string) {
  let nickname = string.split(' ').shift().trim();
  let message = string.split(' ').splice(1).join(' ').trim();
  chatPool.forEach(poolPerson => {
    if (poolPerson.nickname === nickname) {
      poolPerson.socket.write(`${client.nickname}: ${message}\n`)
    };
  });
});

eventNew.on('@nickname', function(client, string) {
  let nickname = string.split(' ').shift().trim();
  client.nickname = nickname;
  console.log(string);
  client.socket.write(`User nickname has been changed to ${nickname}\n`);
});

eventNew.on('@list', function(client) {
  chatPool.forEach(poolPerson => {
    client.socket.write(`${poolPerson.nickname}`);
  });
});

//check
eventNew.on('@quit', function(client) {
//   console.log(chatPool.length);
  client.socket.disconnect();
  console.log('disconnected from server')
//   chatPool.splice(chatPool.indexOf(client), 1)
});
//check

chatServer.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});