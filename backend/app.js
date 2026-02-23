import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./src/routes/auth.js";
import usersRoutes from "./src/routes/users.js";
import categoriesRoutes from "./src/routes/categories.js";
import productsRoutes from "./src/routes/products.js";
import transactionsRoutes from "./src/routes/transactions.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API TOKO GERABAH RUNNING 🚀" });
});

app.use("/auth", authRoutes);
app.use("/", usersRoutes); // profile, register, deactivate-user
app.use("/categories", categoriesRoutes);
app.use("/products", productsRoutes);
app.use("/transactions", transactionsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));