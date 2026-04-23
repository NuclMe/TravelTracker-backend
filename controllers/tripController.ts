import type { Request, Response, NextFunction } from 'express';
import cloudinary from '../config/cloudinary';

const Trip = require('../models/Trip');
const mongoose = require('mongoose');

const uploadFilesToCloudinary = async (files: any[] = []) => {
  const uploads = files.map(async (file) => {
    const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'travel-tracker/trips',
      resource_type: 'image',
    });

    return {
      fileName: file.originalname,
      url: result.secure_url,
      publicId: result.public_id,
      uploadedAt: new Date(),
    };
  });

  return Promise.all(uploads);
};

exports.createTrip = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { tripName, destination, startDate, endDate, budget } = req.body;

    if (!tripName || !destination || !startDate || !endDate || !budget) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const trip = new Trip({
      tripName,
      destination,
      startDate,
      endDate,
      budget: Number(budget),
      photos: await uploadFilesToCloudinary(req.files as any[]),
    });
    const savedTrip = await trip.save();

    return res.status(201).json({
      message: 'Trip created successfully',
      trip: savedTrip,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Failed to create trip',
      error: err.message,
    });
  }
};

exports.uploadPhotos = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: 'Invalid trip id' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const uploadedPhotos = await uploadFilesToCloudinary(req.files as any[]);

    trip.photos.push(...uploadedPhotos);
    const updatedTrip = await trip.save();

    return res.status(200).json({
      message: 'Photos uploaded successfully',
      trip: updatedTrip,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Failed to upload photos',
      error: err.message,
    });
  }
};

exports.getTrip = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: 'Invalid trip id' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    return res.status(200).json({
      message: 'Trip retrieved successfully',
      trip: trip,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Failed to retrieve trip',
      error: err.message,
    });
  }
};

exports.getTrips = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const trips = await Trip.find();

    return res.status(200).json({
      message: 'Trips retrieved successfully',
      trips: trips,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Failed to retrieve trips',
      error: err.message,
    });
  }
};

exports.addPlace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tripId } = req.params;
    const { name, address, category, lat, lng } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: 'Invalid trip id' });
    }

    if (
      !name ||
      !address ||
      !category ||
      lat === undefined ||
      lng === undefined
    ) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const newPlace = {
      name,
      address,
      category,
      lat: Number(lat),
      lng: Number(lng),
    };

    trip.places.push(newPlace);
    const updatedTrip = await trip.save();

    return res.status(200).json({
      message: 'Place added successfully',
      trip: updatedTrip,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Failed to add place',
      error: err.message,
    });
  }
};

exports.updatePlace = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tripId, placeId } = req.params;
    const { name, address, category, status, lat, lng } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: 'Invalid trip id' });
    }

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ message: 'Invalid place id' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const place = trip.places.id(placeId);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    if (name !== undefined) place.name = name;
    if (address !== undefined) place.address = address;
    if (category !== undefined) place.category = category;
    if (status !== undefined) place.status = status;
    if (lat !== undefined) place.lat = Number(lat);
    if (lng !== undefined) place.lng = Number(lng);

    const updatedTrip = await trip.save();

    return res.status(200).json({
      message: 'Place updated successfully',
      trip: updatedTrip,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Failed to update place',
      error: err.message,
    });
  }
};

exports.deletePlace = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tripId, placeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: 'Invalid trip id' });
    }

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      return res.status(400).json({ message: 'Invalid place id' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const place = trip.places.id(placeId);
    if (!place) {
      return res.status(404).json({ message: 'Place not found' });
    }

    place.remove();
    const updatedTrip = await trip.save();

    return res.status(200).json({
      message: 'Place deleted successfully',
      trip: updatedTrip,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Failed to delete place',
      error: err.message,
    });
  }
};

exports.deletePhoto = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tripId, photoIndex } = req.params as {
      tripId: string;
      photoIndex: string;
    };

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ message: 'Invalid trip id' });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const index = parseInt(photoIndex as string);
    if (index < 0 || index >= trip.photos.length) {
      return res.status(400).json({ message: 'Invalid photo index' });
    }

    const photoToDelete = trip.photos[index];
    if (photoToDelete?.publicId) {
      await cloudinary.uploader.destroy(photoToDelete.publicId);
    }

    trip.photos.splice(index, 1);
    const updatedTrip = await trip.save();

    return res.status(200).json({
      message: 'Photo deleted successfully',
      trip: updatedTrip,
    });
  } catch (err: any) {
    return res.status(500).json({
      message: 'Failed to delete photo',
      error: err.message,
    });
  }
};

