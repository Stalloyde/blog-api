const express = require('express');
const passport = require('passport');
const adminController = require('../controllers/adminController');

const router = express.Router();

/* GET admin listing. */
router.get('/posts', passport.authenticate('jwt', { session: false }), adminController.postGET);
router.post('/posts', passport.authenticate('jwt', { session: false }), adminController.postPOST);
router.get('/posts/:postId', adminController.postGET);
router.put('/posts/:postId', adminController.postPUT);
router.delete('/posts/:postId', adminController.postDEL);
router.get('/posts/:postId/:commentId', adminController.commentGET);
router.put('/posts/:postId/:commentId', adminController.commentPUT);
router.delete('/posts/:postId/:commentId', adminController.commentDEL);

module.exports = router;
