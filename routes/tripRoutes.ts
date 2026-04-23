const express = require('express');
const multer = require('multer');
const {
  createTrip,
  uploadPhotos,
  getTrip,
  getTrips,
  deletePhoto,
} = require('../controllers/tripController');

const router = express.Router();

// Configure multer for memory storage (buffer)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit per file
  fileFilter: (req: any, file: any, cb: any) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

router.post('/createTrip', upload.array('photos', 10), createTrip); // Create a new trip with optional photos
router.post('/uploadPhotos/:tripId', upload.array('photos', 10), uploadPhotos); // Upload photos to a trip
router.get('/getTrips', getTrips); // Get all trips
router.get('/:tripId', getTrip); // Get trip details with photos
router.delete('/:tripId/photo/:photoIndex', deletePhoto); // Delete a photo from trip

module.exports = router;
