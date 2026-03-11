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

// ============= PUBLIC / SEMUA ROLE BISA AKSES =============
// GET categories - semua role (admin, kasir, pembeli) bisa lihat
router.get("/", authenticate, authorizeRoles("admin", "kasir", "pembeli"), getAllCategories);

// GET category by id - semua role bisa lihat
router.get("/:id", authenticate, authorizeRoles("admin", "kasir", "pembeli"), getCategoryById);

// ============= HANYA ADMIN =============
// POST /categories - hanya admin
router.post("/", authenticate, authorizeRoles("admin"), createCategory);

// PUT /categories/:id - hanya admin
router.put("/:id", authenticate, authorizeRoles("admin"), updateCategory);

// DELETE /categories/:id - hanya admin
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteCategory);

export default router;