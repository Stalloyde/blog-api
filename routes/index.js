const express = require('express');
const indexController = require('../controllers/indexController');

const router = express.Router();

/* GET home page. */
router.get('/', indexController.homeGET);
router.get('/login', indexController.loginGET);
router.post('/login', indexController.loginPOST);
router.get('/signup', indexController.signupGET);
router.post('/signup', indexController.signupPOST);
router.get('/:postId', indexController.postGET);
router.post('/:postId', indexController.postPOST);

module.exports = router;
