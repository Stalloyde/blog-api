const express = require('express');
const passport = require('passport');
const modController = require('../controllers/modController');
const isMod = require('../config/isMod');

const router = express.Router();

/* GET admin listing. */
router.get('/posts', passport.authenticate('jwt', { session: false }), isMod, modController.postGET);
router.post('/posts', passport.authenticate('jwt', { session: false }), isMod, modController.postPOST);
router.get('/posts/:postId', passport.authenticate('jwt', { session: false }), isMod, modController.postIdGET);
router.put('/posts/:postId', passport.authenticate('jwt', { session: false }), isMod, modController.postIdPUT);
router.delete('/posts/:postId', passport.authenticate('jwt', { session: false }), isMod, modController.postIdDEL);
router.get('/posts/:postId/:commentId', passport.authenticate('jwt', { session: false }), isMod, modController.commentGET);
router.put('/posts/:postId/:commentId', passport.authenticate('jwt', { session: false }), isMod, modController.commentPUT);
router.delete('/posts/:postId/:commentId', passport.authenticate('jwt', { session: false }), isMod, modController.commentDEL);

module.exports = router;
