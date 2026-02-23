import express from "express";
import {
  profile,
  register,
  deactivateUser,
} from "../Controllers/userController.js";

import { authenticate, authorizeRoles } from "../middleware/authorization.js";

const router = express.Router();

// User Management (Admin)
router.get("/profile", authenticate, profile);

// Register (admin only)
router.post("/register", authenticate, authorizeRoles("admin"), register);

// deactivate user (admin only)
router.put(
  "/deactivate-user",
  authenticate,
  authorizeRoles("admin"),
  deactivateUser
);

export default router;