require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const expressAsyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dbConnection = require('../config/db');
const User = require('../models/user');

exports.homeGET = (req, res, next) => {
  res.json('Hello!');
};

exports.signupGET = (req, res, next) => {
  res.json('GET - Signup page');
};

exports.signupPOST = [
  body('username').notEmpty().trim().escape()
    .withMessage('Input required'),
  body('password').notEmpty().trim().escape()
    .withMessage('Input required'),
  body('confirmPassword').notEmpty().trim().custom((value, { req }) => value === req.body.password)
    .escape()
    .withMessage('Passwords do not match'),

  expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const newUser = new User({
      username: req.body.username,
      password: req.body.password,
      isMod: false,
    });

    const { username } = newUser;

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      res.json(username, errorsArray);
    } else {
      const checkDuplicate = await User.findOne({ username });

      if (checkDuplicate) {
        res.json(username, { duplicateError: 'Username has been taken. Try another.' });
      }

      try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        newUser.password = hashedPassword;
        // await newUser.save();
        res.json(newUser);
      } catch (err) {
        return next(err);
      }
    }
  }),
];

exports.loginGET = (req, res, next) => {
  res.json('GET - Login page');
};

exports.loginPOST = [
  body('username').notEmpty().trim().escape()
    .withMessage('Input required'),
  body('password').notEmpty().trim().escape()
    .withMessage('Input required'),

  expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      res.json(errorsArray);
    } else {
      const currentUser = await User.findOne({ username: req.body.username });
      if (!currentUser) {
        res.json('User not found');
      }

      const match = await bcrypt.compare(req.body.password, currentUser.password);
      if (!match) {
        res.json('Wrong password');
      }

      jwt.sign({ currentUser }, process.env.SECRET, { expiresIn: '30s', algorithm: 'HS256' }, (err, token) => {
        if (err) {
          throw Error(err);
        } else {
          res.json({ token });
        }
      });
    }
  }),
];

exports.postGET = (req, res, next) => {
  res.json(`GET - Post page ${req.params.postId}`);
};

exports.postPOST = (req, res, next) => {
  res.json(`POST - Post page ${req.params.postId}`);
};
