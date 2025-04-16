const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');

router.post('/Subscription' , userController.Subscription);
router.post('/checkSubscription' , userController.checkSubscription);
router.post('/upload-csv' , userController.uploadCSV);
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get("/secure-route", userController.isAuthenticated, (req, res) => {
    res.status(200).json({ message: "This is a secured route", user: req.user });
});

module.exports = router;