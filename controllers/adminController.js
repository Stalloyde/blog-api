const express = require('express');
const mongoose = require('mongoose');
const dbConnection = require('../config/db');
const User = require('../models/user');

exports.homeGET = (req, res, next) => {
  res.json('GET - Admin home page');
};

exports.homePOST = (req, res, next) => {
  res.json('POST - Admin Add new post');
};

exports.postGET = (req, res, next) => {
  res.json(`GET - Admin post page ${req.params.postId}`);
};

exports.postPUT = (req, res, next) => {
  res.json(`PUT - Admin edit post ${req.params.postId}`);
};

exports.postDEL = (req, res, next) => {
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
