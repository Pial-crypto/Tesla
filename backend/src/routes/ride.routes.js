import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  createRideRequest,
  getMyRides,
  getFareEstimate,
  cancelRideRequest,
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
router.post(
  "/:id/cancel",
  authMiddleware("PASSENGER"),
  cancelRideRequest
);
export default router;