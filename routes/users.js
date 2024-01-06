const express = require('express');
const indexController = require('../controllers/userController');

const router = express.Router();

/* GET users listing. */
router.get('/', indexController.user);

module.exports = router;
