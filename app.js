const express = require('express')
// import express from 'express';
const app = express()
let http = require('http').Server(app);

const port = process.env.PORT || 3000;

app.use(express.static('public'));

http.listen(port, () => {
  console.log('listening on ', port);
})
