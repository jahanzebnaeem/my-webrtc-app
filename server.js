const express = require('express')
// import express from 'express';
const app = express()
let http = require('http').Server(app)

const port = process.env.PORT || 3000

let io = require('socket.io')(http)

app.use(express.static('public'))

http.listen(port, () => {
  console.log('listening on', port)
})

io.on('connection', function (socket) {
  console.log('a user connected')

  socket.on('create or join', room => {
    console.log('create or join to room', room)
    // const myRoom = io.sockets.adapter.rooms[room] || {length: 0}
    const myRoom = io.sockets.adapter.rooms.get(room) || {size: 0}
    // const numClients = myRoom.length
    const numClients = myRoom.size
    console.log(room, 'has', numClients, 'clients')

    if(numClients == 0) {
      socket.join(room)
      socket.emit('created', room)
    } else if (numClients == 1) {
      socket.join(room)
      socket.emit('joined', room)
    } else {
      socket.emit('full', room)
    }

  })

  socket.on('ready', room => {
    // socket.broadcast.to(room).emit('ready')
    socket.to(room).emit('ready')
  }) 

  socket.on('candidate', event => {
    // socket.broadcast.to(event.room).emit('candidate', event)
    socket.to(event.room).emit('candidate', event)
  }) 

  socket.on('offer', event => {
    // socket.broadcast.to(event.room).emit('offer', event.sdp)
    socket.to(event.room).emit('offer', event.sdp)
  }) 

  socket.on('answer', event => {
    // socket.broadcast.to(event.room).emit('answer', event.sdp)
    socket.to(event.room).emit('answer', event.sdp)
  }) 
})