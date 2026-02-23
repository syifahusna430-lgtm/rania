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

// GET products boleh admin & kasir
router.get("/", authenticate, authorizeRoles("admin", "kasir"), getAllProducts);
router.get("/:id", authenticate, authorizeRoles("admin", "kasir"), getProductById);

// CRUD hanya admin
router.post("/", authenticate, authorizeRoles("admin"), createProduct);
router.put("/:id", authenticate, authorizeRoles("admin"), updateProduct);
router.delete("/:id", authenticate, authorizeRoles("admin"), deleteProduct);

export default router;