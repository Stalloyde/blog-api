const express = require('express');
const passport = require('passport');
const indexController = require('../controllers/indexController');

const router = express.Router();

/* GET home page. */
router.get('*', indexController.postGET);
router.get('/login', indexController.loginGET);
router.post('/login', indexController.loginPOST);
router.get('/signup', indexController.signupGET);
router.post('/signup', indexController.signupPOST);
router.get('/posts', indexController.postGET);
router.get('/posts/:id', indexController.postIdGET);
router.post(
  '/posts/:id',
  passport.authenticate('jwt', { session: false }),
  indexController.postPOSTComment,
);

module.exports = router;
