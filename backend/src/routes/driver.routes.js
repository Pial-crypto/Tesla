import { Router } from "express";

import authMiddleware from "../middleware/auth.middleware.js";

import {
  getRequests,
} from "../controllers/driver.controller.js";

const router = Router();

router.get(
  "/requests",
  authMiddleware("DRIVER"),
  getRequests
);

export default router;