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

exports.postGET = (req, res, next) => {
  res.json('GET - Admin home page');
};

exports.postPOST = [
  body('title').notEmpty().trim().escape()
    .withMessage('Input required'),
  body('content').notEmpty().trim().escape()
    .withMessage('Input required'),

  expressAsyncHandler(async (req, res, next) => {
    const currentUser = req.user;
    console.log(currentUser);
    const author = await User.findById(currentUser.user._id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      res.json({ title: req.body.title, content: req.body.content, errorsArray });
    } else {
      const newPost = new Post({
        author,
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
      // await newPost.save();
      res.json(newPost);
    }
  }),
];

exports.postIdGET = (req, res, next) => {
  res.json(`GET - Admin post page ${req.params.postId}`);
};

exports.postIdPUT = (req, res, next) => {
  res.json(`PUT - Admin edit post ${req.params.postId}`);
};

exports.postIdDEL = (req, res, next) => {
  res.json(`DEL - Admin delete post ${req.params.postId}`);
};

exports.commentGET = (req, res, next) => {
  res.json(`GET - Admin comment page ${req.params.postId}/${req.params.commentId}`);
};

exports.commentPUT = (req, res, next) => {
  res.json(`PUT - Admin edit comment ${req.params.postId}/${req.params.commentId}`);
};

exports.commentDEL = (req, res, next) => {
  res.json(`DEL - Admin delete comment ${req.params.postId}/${req.params.commentId}`);
};
