'use strict';

import express from 'express';
const authRouter = express.Router();

import User from './user.js';
import auth from './auth.js';


authRouter.get('/', (req, res) => {
  res.write('HELLO');
  res.end();
});


authRouter.post('/signup', (req, res, next) => {
  if(!Object.keys(req.body).length) {
    console.log('no body');
    next(400);
  }
  let user = new User(req.body);
  user.save()
    .then(user => res.send(user.generateToken()))
    .catch(next);
});

authRouter.get('/signin', auth, (req, res, next) => {
  res.cookie('Token', req.token);
  res.send(req.token);
});





// let sendJSON = (res, data) => {
//   res.statusCode = 200;
//   res.statusMessage = 'OK';
//   res.setHeader('Content-Type', 'application/json');
//   res.write(JSON.stringify(data));
//   res.end();
// };


export default authRouter;