const express = require('express');
const { createTrip } = require('../controllers/tripController');

const router = express.Router();

router.post('/createTrip', createTrip); // Create a new trip

module.exports = router;
