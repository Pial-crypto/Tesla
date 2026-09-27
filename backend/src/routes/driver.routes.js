import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  getRequests,
  acceptDriverRide,
  getPool,
  arrivePool,
  startDriverPool,
  completeDriverPool,
} from "../controllers/driver.controller.js";
const router = Router();

router.get(
  "/requests",
  authMiddleware("DRIVER"),
  getRequests
);
router.post(
  "/rides/:id/accept",
  authMiddleware("DRIVER"),
  acceptDriverRide
);
router.get(
  "/pool",
  authMiddleware("DRIVER"),
  getPool
);
router.post(
  "/pool/arrive",
  authMiddleware("DRIVER"),
  arrivePool
);
router.post(
  "/pool/start",
  authMiddleware("DRIVER"),
  startDriverPool
);
router.post(
  "/pool/complete",
  authMiddleware("DRIVER"),
  completeDriverPool
);
export default router;