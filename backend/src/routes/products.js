import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../Controllers/productController.js";

import { authenticate, authorizeRoles } from "../middleware/authorization.js";

const router = express.Router();

// ============= PUBLIC / SEMUA ROLE BISA AKSES =============
// GET products - semua role (admin, kasir, pembeli) bisa lihat
router.get("/", authenticate, authorizeRoles("admin", "kasir", "pembeli"), getAllProducts);

// GET product by id - semua role bisa lihat
router.get("/:id", authenticate, authorizeRoles("admin", "kasir", "pembeli"), getProductById);

// ============= HANYA ADMIN =============
// POST /products - hanya admin
router.post("/", authenticate, authorizeRoles("admin"), createProduct);

// PUT /products/:id - hanya admin
router.put("/:id", authenticate, authorizeRoles("admin"), updateProduct);

// DELETE /products/:id - hanya admin
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteProduct);

export default router;