const express = require('express');

const isMod = (req, res, next) => {
  const { user } = req;
  if (user.user.isMod) {
    console.log('Current user is mod');
    next();
  } else {
    console.log('Current user is not mod');
    throw new Error(403);
  }
};

module.exports = isMod;
