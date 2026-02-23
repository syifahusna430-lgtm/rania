import pool from "../db/pool.js";

export const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ORDER BY p.id ASC`
    );

    res.json({ message: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id=$1`,
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "product not found" });

    res.json({ message: "success", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, category_id } = req.body;

    if (!name || !price || !stock || !category_id) {
      return res.status(400).json({ message: "data tidak lengkap" });
    }

    const result = await pool.query(
      "INSERT INTO products (name, price, stock, category_id) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, price, stock, category_id]
    );

    res.status(201).json({ message: "success", data: result.rows[0] });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({ message: "category_id tidak valid" });
    }
    res.status(500).json({ message: err.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category_id } = req.body;

    const result = await pool.query(
      `UPDATE products
       SET name=$1, price=$2, stock=$3, category_id=$4
       WHERE id=$5
       RETURNING *`,
      [name, price, stock, category_id, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "product not found" });

    res.json({ message: "success", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // jika produk sudah dipakai di transaksi -> gagal
    const result = await pool.query("DELETE FROM products WHERE id=$1 RETURNING *", [
      id,
    ]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "product not found" });

    res.json({ message: "success", data: result.rows[0] });
  } catch (err) {
    if (err.code === "23503") {
      return res.status(400).json({
        message: "failed: produk sedang dipakai di transaksi",
      });
    }
    res.status(500).json({ message: err.message });
  }
};