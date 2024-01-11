const express = require('express');
const passport = require('passport');
const modController = require('../controllers/modController');
const isMod = require('../config/isMod');

const router = express.Router();

/* GET admin listing. */
router.get('/posts', passport.authenticate('jwt', { session: false }), isMod, modController.postGET);
router.post('/posts', passport.authenticate('jwt', { session: false }), isMod, modController.postPOST);
router.get('/posts/:id', passport.authenticate('jwt', { session: false }), isMod, modController.postIdGET);
router.put('/posts/:id', passport.authenticate('jwt', { session: false }), isMod, modController.postIdPUT);
router.delete('/posts/:id', passport.authenticate('jwt', { session: false }), isMod, modController.postIdDEL);
router.get('/posts/:id/:commentId', passport.authenticate('jwt', { session: false }), isMod, modController.commentGET);
router.put('/posts/:id/:commentId', passport.authenticate('jwt', { session: false }), isMod, modController.commentPUT);
router.delete('/posts/:id/:commentId', passport.authenticate('jwt', { session: false }), isMod, modController.commentDEL);

module.exports = router;
