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
const uploadImage = require('../config/cloudinary');

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
      return res.json(jsonResponses);
    } else {
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        jsonResponses.usernameError = '*User not found';
        return res.json(jsonResponses);
      }

      if (user.isMod === false) {
        jsonResponses.usernameError = '*User is not a moderator';
        return res.json(jsonResponses);
      }

      const match = await bcrypt.compare(req.body.password, user.password);
      if (!match) {
        jsonResponses.passwordError = '*Incorrect password';
        return res.json(jsonResponses);
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
            return res.json({ username, isMod, Bearer: `Bearer ${token}` });
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
  return res.json(posts);
};

exports.postPOST = [
  body('title').notEmpty().trim().escape().withMessage('Input required'),
  body('content').notEmpty().trim().escape().withMessage('Input required'),
  body('toPublish').escape(),

  expressAsyncHandler(async (req, res, next) => {
    const currentUser = req.user;
    const author = await User.findById(currentUser.user).select([
      'username',
      'isMod',
    ]);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      res.json({
        title: req.body.title,
        content: req.body.content,
        errorsArray,
      });
    } else {
      const newPost = new Post({
        author,
        title: req.body.title,
        content: req.body.content,
        image: await uploadImage(req.file.path),
        date: new Date(),
        isPublished: req.body.toPublish,
      });

      await newPost.save();
      return res.json(newPost);
    }
  }),
];

exports.postDEL = [
  expressAsyncHandler(async (req, res, next) => {
    const targetPost = await Post.findByIdAndDelete(
      req.body.targetPostId,
    ).populate('comments');
    const comments = targetPost.comments;
    const commentIds = comments.map((comment) => comment._id);
    await Comment.deleteMany({ _id: commentIds });
    const posts = await Post.find();
    return res.json(posts);
  }),
];

exports.postPUT = [
  body('title').notEmpty().trim().escape().withMessage('Input required'),
  body('content').notEmpty().trim().escape().withMessage('Input required'),
  body('toPublish').escape(),

  expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.json({
        title: req.body.title,
        content: req.body.content,
        isPublished: req.body.toPublish,
      });
    } else {
      const postObjectId = new mongoose.Types.ObjectId(req.body.editId);
      const updatedPost = await Post.findByIdAndUpdate(postObjectId, {
        title: req.body.title,
        content: req.body.content,
        isPublished: req.body.toPublish,
      });

      if (req.file) {
        updatedPost.image = await uploadImage(req.file.path);
      }

      await updatedPost.save();
      return res.json(updatedPost);
    }
  }),
];

exports.postIdGET = async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate({
      path: 'comments',
      populate: { path: 'author' },
      options: { sort: { date: -1 } },
    })
    .populate('author', 'username');
  return res.json(post);
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
          populate: { path: 'author', select: ['username', 'isMod'] },
        }),
    ]);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.json(errors);
    } else {
      const newComment = new Comment({
        author,
        content: req.body.newComment,
        date: new Date(),
      });

      await newComment.save();
      post.comments.push(newComment);
      await post.save();
      return res.json(post);
    }
  }),
];

exports.postPUTComment = [
  body('content').notEmpty().trim().escape().withMessage('Input required'),

  expressAsyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const errorsArray = errors.array();
      return res.json({ content: req.body.content, errorsArray });
    } else {
      const post = await Post.findById(req.params.id)
        .populate({ path: 'comments', populate: { path: 'author' } })
        .populate('author', 'username');
      post.content = req.body.content;

      await post.save();
      return res.json(post);
    }
  }),
];

exports.postDELComment = [
  expressAsyncHandler(async (req, res, next) => {
    const commentObjectId = new mongoose.Types.ObjectId(req.body.commentId);

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $pull: { comments: commentObjectId } },
      { new: true },
    ).populate({
      path: 'comments',
      populate: { path: 'author' },
      options: { sort: { date: -1 } },
    });

    await Comment.findByIdAndDelete(commentObjectId);
    await updatedPost.save();
    return res.json(updatedPost);
  }),
];
