import {
  createRide,
  getPassengerRides,
  estimateFare,
} from "../services/ride.service.js";

async function createRideRequest(req, res, next) {
  try {
    const ride = await createRide(
      req.user.id,
      req.body
    );

    res.status(201).json({
      success: true,
      ride,
    });
  } catch (error) {
    next(error);
  }
}

async function getMyRides(req, res, next) {
  try {
    const rides = await getPassengerRides(
      req.user.id
    );

    res.json({
      success: true,
      rides,
    });
  } catch (error) {
    next(error);
  }
}

async function getFareEstimate(req, res, next) {
  try {
    const fare = await estimateFare(req.query);

    res.json({
      success: true,
      fare,
    });
  } catch (error) {
    next(error);
  }
}

export {
  createRideRequest,
  getMyRides,
  getFareEstimate,
};