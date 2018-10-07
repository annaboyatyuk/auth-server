'use strict';

import superagent from 'superagent';

import User from './user.js';

const googleAuthorize = req => {
  let code = req.query.code;
  console.log('1. The code: ', code);

  return superagent
    .post('https://www.googleapis.com/oauth2/v4/token')
    .type('form')
    .send({
      code: code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.API_URL}/oauth/google/code`,
      grant_type: 'authorization_code',
    })
    .then(response => {
      let googleToken = response.body.access_token;
      console.log('2. Google token is: ', googleToken);
      return googleToken;
    })
    .then(token => {
      return superagent.get('https://www.googleapis.com/plus/v1/people/me/openIdConnect')
        .set('Authorization', `Bearer ${token}`)
        .then(response => {
          let googleUser = response.body;
          console.log('3. Google User ', googleUser);
          return googleUser;
        });
    })
    .then(user => {
      console.log('4. Creating user model');
      return User.fromOauth(user);
    })
    .then(newUser => {
      console.log('5. user model created, making token');
      req.id = newUser._id;
      return newUser.generateToken();
    });
};

export default googleAuthorize;