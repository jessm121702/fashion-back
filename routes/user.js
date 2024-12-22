const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.post('/Subscription' , userController.Subscription);
router.post('/checkSubscription' , userController.checkSubscription);
router.post('/upload-csv' , userController.uploadCSV);

module.exports = router;