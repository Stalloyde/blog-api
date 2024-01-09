const express = require('express');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const jwt = require('jsonwebtoken');
const indexController = require('../controllers/indexController');
const verifyToken = require('../config/verifyToken');

const router = express.Router();

/* GET home page. */
router.get('/', indexController.homeGET);
router.get('/login', indexController.loginGET);
router.post('/login', indexController.loginPOST);
router.get('/signup', indexController.signupGET);
router.post('/signup', indexController.signupPOST);
router.get('/:postId', verifyToken, passport.authenticate('jwt', { session: false }), indexController.postGET);
router.post('/:postId', verifyToken, passport.authenticate('jwt', { session: false }), indexController.postPOST);

module.exports = router;
