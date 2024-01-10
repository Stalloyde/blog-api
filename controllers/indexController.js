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
const Post = require('../models/post');

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
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        res.json('User not found');
      }

      const match = await bcrypt.compare(req.body.password, user.password);
      if (!match) {
        res.json('Wrong password');
      }

      jwt.sign({ user }, process.env.SECRET, { expiresIn: '1h', algorithm: 'HS256' }, (err, token) => {
        if (err) {
          throw Error(err);
        } else {
          res.json({ Bearer: `Bearer ${token}` });
        }
      });
    }
  }),
];

exports.postGET = (req, res, next) => {
  res.json({
    posts: 'Query all posts and pass it here',
    user: req.user,
    bearer: req.headers.authorization,
  });
};

exports.postPOST = [
  body('title').notEmpty().trim().escape()
    .withMessage('Input required'),
  body('content').notEmpty().trim().escape()
    .withMessage('Input required'),

  expressAsyncHandler(async (req, res, next) => {
    const currentUser = req.user;
    const user = await User.findById(currentUser.user._id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      res.json({ title: req.body.title, content: req.body.content, errorsArray });
    } else {
      const newPost = new Post({
        user,
        title: req.body.title,
        content: req.body.content,
        date: new Date(),
        isPublished: true,
      });

      // has image file
      if (req.file) {
        newPost.image.fieldname = req.file.fieldname;
        newPost.image.originalname = req.file.originalname;
        newPost.image.encoding = req.file.encoding;
        newPost.image.mimetype = req.filemimetype;
        newPost.image.destination = req.file.destination;
        newPost.image.filename = req.filefilename;
        newPost.image.path = req.file.path;
        newPost.image.size = req.file.size;
      }
      await newPost.save();
      res.json(newPost);
    }
  }),
];
