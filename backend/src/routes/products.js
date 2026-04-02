import express from "express";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  upload
} from "../Controllers/productController.js";

import { authenticate, authorizeRoles } from "../middleware/authorization.js";

const router = express.Router();

// GET products - semua role bisa lihat
router.get("/", authenticate, authorizeRoles("admin", "kasir", "pembeli"), getAllProducts);
router.get("/:id", authenticate, authorizeRoles("admin", "kasir", "pembeli"), getProductById);

// POST - hanya admin (dengan upload file)
router.post("/", authenticate, authorizeRoles("admin"), upload.single('image'), createProduct);

// PUT - hanya admin (dengan upload file)
router.put("/:id", authenticate, authorizeRoles("admin"), upload.single('image'), updateProduct);

// DELETE - hanya admin
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteProduct);

export default router;