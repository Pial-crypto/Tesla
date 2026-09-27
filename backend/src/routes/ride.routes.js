import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  createRideRequest,
  getMyRides,
  getFareEstimate,
  cancelRideRequest,
  getRideHistoryRequest,
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

router.get(
  "/:id/history",
  authMiddleware("PASSENGER"),
  getRideHistoryRequest
);
export default router;