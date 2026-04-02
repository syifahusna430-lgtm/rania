import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// IMPORT ROUTES
import authRoutes from "./src/routes/auth.js";
import usersRoutes from "./src/routes/users.js";
import categoriesRoutes from "./src/routes/categories.js";
import productsRoutes from "./src/routes/products.js";
import transactionsRoutes from "./src/routes/transactions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// 🔥 STATIC FILES (GAMBAR)
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ROUTES
app.get("/", (req, res) => {
  res.json({ message: "API TOKO GERABAH RUNNING 🚀" });
});

app.use("/auth", authRoutes);
app.use("/", usersRoutes);
app.use("/categories", categoriesRoutes);
app.use("/products", productsRoutes);
app.use("/transactions", transactionsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));