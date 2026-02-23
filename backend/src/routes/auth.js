import express from "express";
import { login, refreshToken, logout } from "../Controllers/authController.js";
import { authenticate } from "../middleware/authorization.js";

const router = express.Router();

router.post("/login", login);
router.post("/refresh-token", authenticate, refreshToken);
router.post("/logout", authenticate, logout);

export default router;