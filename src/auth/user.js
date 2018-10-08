'use strict';

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import Profile from './profile.js';

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  email: {type: String, unique: true},
  password: {type: String, required: true},
  role: {type: String, required: true, enum: ['user', 'editor', 'admin'], default: 'user'},
});

const capabilities = {
  user: ['read'],
  editor: ['read', 'update'],
  admin: ['create', 'read', 'update', 'delete'],
};

userSchema.pre('save', function(next) {
  bcrypt.hash(this.password, 10)
    .then(hashedPassword => {
      this.password = hashedPassword;
      next();
    })
    .catch(error => {throw error;});
});

userSchema.post('save', function(next) {
  let newProfile = new Profile({
    userID: this._id,
    username: this.username,
    email: this.email,
  });

  newProfile.save()
    .then(() => {
      console.log('Profile created');
      next();
    })
    .catch(err => {
      throw err;
    });
});

userSchema.statics.authorize = function(token) {
  let parsedToken = jwt.verify(token, process.env.APP_SECRET || 'secret');
  let query = {_id:parsedToken.id};
  return this.findOne(query)
    .then(user => {
      return user;
    })
    .catch(error => error);
};

userSchema.statics.authenticate = function(auth) {
  let query = {username: auth.username};
  return this.findOne(query)
    .then(user => user && user.comparePassword(auth.password))
    .catch(error => error);
};

userSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.password)
    .then(valid => valid ? this : null);
};

userSchema.methods.generateToken = function() {
  return jwt.sign({id:this._id, capabilities: capabilities[this.role]}, process.env.APP_SECRET || 'secret');
};

userSchema.statics.fromOauth = function(googleUser) {
  if(!googleUser || !googleUser.email) {
    return Promise.reject('VALIDATION ERROR: missing username/email or password');
  }
  return this.findOne({email: googleUser.email})
    .then(user => {
      if(!user) {
        throw new Error('User Not Found');
      }
      return user;
    })
    .catch((error) => {
      console.log(error);
      console.log(googleUser);
      let username = googleUser.email;
      let password = googleUser.given_name + googleUser.sub + googleUser.family_name + 'secretpassword';
      return this.create({
        username: username,
        password: password,
        email: googleUser.email,
      });
    });
};

export default mongoose.model('User', userSchema);