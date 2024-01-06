const express = require('express');

exports.index = (req, res, next) => {
  res.json('Hello!');
};
