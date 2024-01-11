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

exports.postGET = async (req, res, next) => {
  const posts = await Post.find().populate('Comments').populate('User');
  res.json(posts);
};

exports.postPOST = [
  body('title').notEmpty().trim().escape()
    .withMessage('Input required'),
  body('content').notEmpty().trim().escape()
    .withMessage('Input required'),

  expressAsyncHandler(async (req, res, next) => {
    const currentUser = req.user;
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
      await newPost.save();
      res.json(newPost);
    }
  }),
];

exports.postIdGET = async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('Comments').populate('User');
  res.json(post);
};

exports.postIdPUT = [
  body('title').notEmpty().trim().escape()
    .withMessage('Input required'),
  body('content').notEmpty().trim().escape()
    .withMessage('Input required'),

  expressAsyncHandler(async (req, res, next) => {
    const currentUser = req.user;
    const author = await User.findById(currentUser.user._id);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      res.json({ title: req.body.title, content: req.body.content, errorsArray });
    } else {
      const updatedPost = new Post({
        id: req.params.id,
        author,
        title: req.body.title,
        content: req.body.content,
        date: new Date(),
        isPublished: true,
      });

      // has image file. Need to make file upload on the frontend has a persistent file, like edit inputs
      if (req.file) {
        updatedPost.image.fieldname = req.file.fieldname;
        updatedPost.image.originalname = req.file.originalname;
        updatedPost.image.encoding = req.file.encoding;
        updatedPost.image.mimetype = req.filemimetype;
        updatedPost.image.destination = req.file.destination;
        updatedPost.image.filename = req.filefilename;
        updatedPost.image.path = req.file.path;
        updatedPost.image.size = req.file.size;
      }

      const post = await Post.findByIdAndUpdate(req.params.id, { updatedPost });
      await post.save();
      res.json(post);
    }
  })];

exports.postIdDEL = async (req, res, next) => {
  await Post.deleteOne({ _id: req.params.id });
  res.json(`DEL - Moderator delete post ${req.params.id}`);
};

exports.commentGET = (req, res, next) => {
  res.json(`GET - Moderator comment page ${req.params.postId}/${req.params.commentId}`);
};

exports.commentPUT = (req, res, next) => {
  res.json(`PUT - Moderator edit comment ${req.params.postId}/${req.params.commentId}`);
};

exports.commentDEL = (req, res, next) => {
  res.json(`DEL - Moderator delete comment ${req.params.postId}/${req.params.commentId}`);
};
