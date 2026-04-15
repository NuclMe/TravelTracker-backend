import type { Request, Response, NextFunction } from 'express';
const Trip = require('../models/Trip');

exports.createTrip = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
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
      budget,
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
