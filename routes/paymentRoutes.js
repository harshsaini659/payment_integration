const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// test route
router.get('/', (req, res) => res.send('Server is running...'));

// payment route
router.post('/pay', paymentController.makePayment);

module.exports = router;
