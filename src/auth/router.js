'use strict';

import express from 'express';
const authRouter = express.Router();

import User from './user.js';
import auth from './auth.js';
import oauth from './oauth.js';
import Profile from './profile.js';


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
  res.cookie('token', req.token);
  res.send(req.token);
});


authRouter.get('/oauth/google/code',(req, res, next) => {
  oauth.googleAuthorize(req)
    .then(token => {
      res.cookie('token', token);
      res.redirect(`${process.env.API_URL}/signin`);
    })
    .catch(next);
});



authRouter.get('/api/v1/profiles', (req, res, next) => {
  Profile.find({}, {_id: 0, userID: 0})
    .then(profiles => {
      res.send(profiles);
    })
    .catch(err => {
      next(err);
    });
});

authRouter.get('/api/v1/profiles/id/:id', (req, res) => {
  Profile.findOne({_id: req.params.id}, {_id: 0, userID: 0})
    .then(profile => {
      res.send(profile);
    });
});

authRouter.get('/api/v1/profiles/username/:id', (req, res) => {
  Profile.findOne({username: req.params.id}, {_id: 0, userID: 0})
    .then(profile => {
      res.send(profile);
    });
});


export default authRouter;