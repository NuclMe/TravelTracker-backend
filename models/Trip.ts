const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    tripName: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    photos: [
      {
        fileName: String,
        url: String,
        publicId: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    places: [
      {
        name: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        category: {
          type: String,
          enum: ['cafe', 'museum', 'park', 'hotel', 'viewpoint'],
          required: true,
        },
        status: {
          type: String,
          enum: ['planned', 'visited'],
          default: 'planned',
        },
        lat: { type: Number, required: true, min: -90, max: 90 },
        lng: { type: Number, required: true, min: -180, max: 180 },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Trip', tripSchema);
