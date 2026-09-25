import { Router } from "express";
import { signup, login } from "../controllers/auth.controller.js";
import { asyncHandler } from "../handler/asyncHandler.js";
import authMiddleware from "../middleware/auth.middleware.js";
const router = Router();

router.post("/signup", asyncHandler(signup));
router.post("/login", asyncHandler(login));
// router.get("/me", authMiddleware(), (req, res) => {
//   res.json({
//     success: true,
//     user: req.user,
//   });
// });

export default router;