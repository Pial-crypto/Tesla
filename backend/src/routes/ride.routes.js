import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  createRideRequest,
  getMyRides,
  getFareEstimate,
} from "../controllers/ride.controller.js";

const router = Router();


router.post(
  "/",
  authMiddleware("PASSENGER"),
  createRideRequest
);

router.get(
  "/",
  authMiddleware("PASSENGER"),
  getMyRides
);


router.get(
  "/fare/estimate",
  authMiddleware("PASSENGER"),
  getFareEstimate
);

export default router;