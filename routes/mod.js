const express = require('express');
const passport = require('passport');
const modController = require('../controllers/modController');
const isMod = require('../config/isMod');
const multer = require('multer');
const upload = multer({ dest: 'public/images/uploads/' });
const router = express.Router();

router.post('/login', modController.loginPOST);

router.get(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  isMod,
  modController.postGET,
);

router.post(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  isMod,
  upload.single('image'),
  modController.postPOST,
);

router.put(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  isMod,
  upload.single('image'),
  modController.postPUT,
);

router.delete(
  '/posts',
  passport.authenticate('jwt', { session: false }),
  isMod,
  modController.postDEL,
);

router.get(
  '/posts/:id',
  passport.authenticate('jwt', { session: false }),
  isMod,
  modController.postIdGET,
);

router.post(
  '/posts/:id',
  passport.authenticate('jwt', { session: false }),
  isMod,
  modController.postPOSTComment,
);

///unused..delete
router.put(
  '/posts/:id',
  passport.authenticate('jwt', { session: false }),
  isMod,
  modController.postPUTComment,
);

router.delete(
  '/posts/:id',
  passport.authenticate('jwt', { session: false }),
  isMod,
  modController.postDELComment,
);

module.exports = router;
