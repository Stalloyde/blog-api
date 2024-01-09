const express = require('express');

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers.authorization;
  if (bearerHeader !== undefined) {
    const bearer = bearerHeader.split(' ');
    req.token = bearer[1];
    next();
  } else {
    res.sendStatus(403);
  }
  next();
};

module.exports = verifyToken;
