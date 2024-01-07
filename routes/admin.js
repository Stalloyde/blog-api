const express = require('express');
const adminController = require('../controllers/adminController');

const router = express.Router();

/* GET admin listing. */
router.get('/', adminController.homeGET);
router.post('/', adminController.homePOST);
router.get('/:postId', adminController.postGET);
router.put('/:postId', adminController.postPUT);
router.delete('/:postId', adminController.postDEL);
router.get('/:postId/:commentId', adminController.commentGET);
router.put('/:postId/:commentId', adminController.commentPUT);
router.delete('/:postId/:commentId', adminController.commentDEL);

module.exports = router;
