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

exports.postGET = async (req, res, next) => {
  const posts = await Post.find().populate('comments').populate('author');
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
  const post = await Post.findById(req.params.id).populate('comments').populate('author');
  res.json(post);
};

exports.postPOSTComment = [
  body('content').notEmpty().trim().escape()
    .withMessage('Input required'),

  expressAsyncHandler(async (req, res, next) => {
    const currentUser = req.user;
    const [author, post] = await Promise.all(
      [User.findById(currentUser.user._id), Post.findById(req.params.id)],
    );
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      res.json(errorsArray);
    } else {
      const newComment = new Comment({
        author,
        content: req.body.content,
        date: new Date(),
      });

      await newComment.save();
      post.comments.push(newComment);
      await post.save();
      res.json(newComment);
    }
  }),
];

exports.postPUTComment = [
  body('content').notEmpty().trim().escape()
    .withMessage('Input required'),

  expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      res.json({ content: req.body.content, errorsArray });
    } else {
      const post = await Post.findById(req.params.id).populate('comments').populate('author');
      post.content = req.body.content;

      // has image file. Need to make file upload on the frontend has a persistent file, like edit inputs
      if (req.file) {
        post.image.fieldname = req.file.fieldname;
        post.image.originalname = req.file.originalname;
        post.image.encoding = req.file.encoding;
        post.image.mimetype = req.filemimetype;
        post.image.destination = req.file.destination;
        post.image.filename = req.filefilename;
        post.image.path = req.file.path;
        post.image.size = req.file.size;
      }

      await post.save();
      res.json(post);
    }
  })];

exports.postDELComment = async (req, res, next) => {
  await Post.deleteOne({ _id: req.params.id });
  res.json(`DEL - Moderator delete post ${req.params.id}`);
};

exports.commentGET = async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);
  res.json(comment);
};

exports.commentPUT = [
  body('content').notEmpty().trim().escape()
    .withMessage('Input required'),

  expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      res.json({ content: req.body.content, errorsArray });
    } else {
      const comment = await Comment.findById(req.params.commentId);
      comment.content = req.body.content;
      await comment.save();
      res.json(comment);
    }
  }),
];

exports.commentDEL = async (req, res, next) => {
  await Comment.findByIdAndDelete(req.params.commentId);
  res.json(`DEL - Moderator delete comment ${req.params.id}/${req.params.commentId}`);
};
