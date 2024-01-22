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
const Comment = require('../models/comment');

exports.signupGET = (req, res, next) => {
  res.json('GET - Signup page');
};

exports.signupPOST = [
  body('username').notEmpty().trim().escape().withMessage('Username required'),
  body('password').notEmpty().trim().escape().withMessage('Password required'),
  body('confirmPassword')
    .notEmpty()
    .trim()
    .custom((value, { req }) => value === req.body.password)
    .escape()
    .withMessage('Passwords do not match'),

  expressAsyncHandler(async (req, res, next) => {
    const jsonResponses = {
      usernameError: null,
      passwordError: null,
      confirmPasswordError: null,
    };

    const errors = validationResult(req);

    const newUser = new User({
      username: req.body.username,
      password: req.body.password,
      isMod: false,
    });

    const { username } = newUser;

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();

      errorsArray.forEach((error) => {
        if (error.path === 'username') {
          jsonResponses.usernameError = `*${error.msg}`;
        } else if (error.path === 'password') {
          jsonResponses.passwordError = `*${error.msg}`;
        } else {
          jsonResponses.confirmPasswordError = `*${error.msg}`;
        }
      });
      res.json(jsonResponses);
    } else {
      try {
        const checkDuplicate = await User.findOne({ username });

        if (checkDuplicate) {
          jsonResponses.usernameError =
            '*Username has been taken. Try another.';
          res.json(jsonResponses);
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        newUser.password = hashedPassword;
        // await newUser.save();
        res.json('Sign up successful!');
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
  body('username').notEmpty().trim().escape().withMessage('Username required'),
  body('password').notEmpty().trim().escape().withMessage('Password required'),

  expressAsyncHandler(async (req, res, next) => {
    const jsonResponses = {
      usernameError: null,
      passwordError: null,
    };
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();

      errorsArray.forEach((error) => {
        if (error.path === 'username') {
          jsonResponses.usernameError = `*${error.msg}`;
        } else {
          jsonResponses.passwordError = `*${error.msg}`;
        }
      });
      res.json(jsonResponses);
    } else {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        jsonResponses.usernameError = '*User not found';
        res.json(jsonResponses);
      }

      const match = await bcrypt.compare(req.body.password, user.password);
      if (!match) {
        jsonResponses.passwordError = '*Incorrect password';
        res.json(jsonResponses);
      }

      jwt.sign(
        { user },
        process.env.SECRET,
        { expiresIn: '1h', algorithm: 'HS256' },
        (err, token) => {
          if (err) {
            throw Error(err);
          } else {
            const { username, isMod } = user;
            res.json({ username, isMod, Bearer: `Bearer ${token}` });
          }
        },
      );
    }
  }),
];

exports.postGET = async (req, res, next) => {
  const posts = await Post.find()
    .populate({ path: 'comments', populate: { path: 'author' } })
    .populate('author', 'username')
    .sort({ date: -1 });
  res.json(posts);
};

exports.postIdGET = async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate({
      path: 'comments',
      populate: { path: 'author' },
      options: { sort: { date: -1 } },
    })
    .populate('author', 'username');
  res.json(post);
};

exports.postPOSTComment = [
  body('newComment').notEmpty().trim().escape().withMessage('Input required'),

  expressAsyncHandler(async (req, res, next) => {
    const currentUser = req.user;
    const [author, post] = await Promise.all([
      User.findById(currentUser.user._id),
      Post.findById(req.params.id)
        .populate('author', 'username')
        .populate({
          path: 'comments',
          populate: { path: 'author', select: 'username', select: 'isMod' },
        }),
    ]);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json(errors);
    } else {
      const newComment = new Comment({
        author,
        content: req.body.newComment,
        date: new Date(),
      });

      await newComment.save();
      post.comments.push(newComment);
      await post.save();
      res.json(post);
    }
  }),
];
