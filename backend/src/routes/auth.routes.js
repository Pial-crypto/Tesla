import { Router } from "express";
import { signup, login } from "../controllers/auth.controller.js";
import { asyncHandler } from "../handler/asyncHandler.js";
const router = Router();

router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));

export default router;