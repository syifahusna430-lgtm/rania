import express from "express";
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransactionAddItem,
} from "../Controllers/transactionController.js";

import { authenticate, authorizeRoles } from "../middleware/authorization.js";

const router = express.Router();

// transaksi: kasir boleh, admin boleh lihat tapi tidak boleh create/edit (sesuai skenario)
router.get("/", authenticate, authorizeRoles("kasir", "admin"), getAllTransactions);
router.get("/:id", authenticate, authorizeRoles("kasir"), getTransactionById);

// create & update hanya kasir
router.post("/", authenticate, authorizeRoles("kasir"), createTransaction);
router.put("/:id", authenticate, authorizeRoles("kasir"), updateTransactionAddItem);

export default router;