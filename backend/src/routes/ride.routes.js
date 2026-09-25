import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  createRideRequest,
  getMyRides,
  getFareEstimate,
} from "../controllers/ride.controller.js";

const router = Router();

// Passenger ride request
router.post(
  "/",
  authMiddleware("PASSENGER"),
  createRideRequest
);

// Passenger's own ride history/list
router.get(
  "/",
  authMiddleware("PASSENGER"),
  getMyRides
);

// Fare estimation
router.get(
  "/fare/estimate",
  authMiddleware("PASSENGER"),
  getFareEstimate
);

export default router;