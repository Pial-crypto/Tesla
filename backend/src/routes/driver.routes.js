import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  getRequests,acceptDriverRide
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
export default router;