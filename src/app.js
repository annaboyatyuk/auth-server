'use strict';

import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import authRouter from './auth/router.js';

// import badRequest from './middleware/400';

let app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(authRouter);

// app.use(badRequest);

let server = false;

module.exports = {
  start: (port) => {
    if(!server) {
      server = app.listen(port, (err) => {
        if(err) {
          throw err;
        }
        console.log(`Server running on ${port}`);
      });
    }
    else{
      console.log('Server is already running');
    }
  },
  stop: () => {
    server.close(() => {
      console.log('Server has stopped');
    });
  },
  server: app,
};