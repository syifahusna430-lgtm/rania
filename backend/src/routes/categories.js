import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../Controllers/categoryController.js";

import { authenticate, authorizeRoles } from "../middleware/authorization.js";

const router = express.Router();

// GET categories boleh admin & kasir
router.get("/", authenticate, authorizeRoles("admin", "kasir"), getAllCategories);
router.get("/:id", authenticate, authorizeRoles("admin", "kasir"), getCategoryById);

// CRUD hanya admin
router.post("/", authenticate, authorizeRoles("admin"), createCategory);
router.put("/:id", authenticate, authorizeRoles("admin"), updateCategory);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteCategory);

export default router;