const express = require('express');

exports.user = (req, res, next) => {
  res.json('User Route');
};
