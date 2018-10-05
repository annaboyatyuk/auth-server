'use strict';

import express from 'express';
const authRouter = express.Router();

// import User from './user.js';
// import auth from './middleware.js';


// let sendJSON = (res, data) => {
//   res.statusCode = 200;
//   res.statusMessage = 'OK';
//   res.setHeader('Content-Type', 'application/json');
//   res.write(JSON.stringify(data));
//   res.end();
// };


authRouter.get('/', (req, res) => {
  res.write('HELLO');
  res.end();
});

export default authRouter;