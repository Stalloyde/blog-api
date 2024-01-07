require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const dbConnection = require('../config/db');
const User = require('../models/user');

exports.homeGET = (req, res, next) => {
  res.json('Hello!');
};

exports.loginGET = (req, res, next) => {
  res.json('GET - Login page');
};

exports.loginPOST = (req, res, next) => {
  //   const newUser = new User({
  //     username: 'Stalloyde',
  //     password: 'test',
  //     isMod: true,
  //   });

  //   await newUser.save();
  res.json('POST - Login page');
};

exports.signupGET = (req, res, next) => {
  res.json('GET - Signup page');
};

exports.signupPOST = (req, res, next) => {
  //   const newUser = new User({
  //     username: 'Stalloyde',
  //     password: 'test',
  //     isMod: true,
  //   });

  //   await newUser.save();
  res.json('POST - Signup page');
};

exports.postGET = (req, res, next) => {
  res.json(`GET - Post page ${req.params.postId}`);
};

exports.postPOST = (req, res, next) => {
  //   const newUser = new User({
  //     username: 'Stalloyde',
  //     password: 'test',
  //     isMod: true,
  //   });

  //   await newUser.save();
  res.json(`POST - Post page ${req.params.postId}`);
};
