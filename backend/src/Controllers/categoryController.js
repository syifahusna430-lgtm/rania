import pool from "../db/pool.js";

export const getAllCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.json({ message: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM categories WHERE id=$1", [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "category not found" });

    res.json({ message: "success", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // skenario UKT: data sesuai / tidak sesuai
    if (!name || name.length < 3) {
      return res.status(400).json({ message: "data tidak sesuai" });
    }

    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name]
    );

    res.status(201).json({ message: "success", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const result = await pool.query(
      "UPDATE categories SET name=$1 WHERE id=$2 RETURNING *",
      [name, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "category not found" });

    res.json({ message: "success", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // jika category dipakai product -> gagal (FK)
    const result = await pool.query("DELETE FROM categories WHERE id=$1 RETURNING *", [
      id,
    ]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "category not found" });

    res.json({ message: "success", data: result.rows[0] });
  } catch (err) {
    // FK error
    if (err.code === "23503") {
      return res.status(400).json({
        message: "failed: category masih dipakai oleh product",
      });
    }
    res.status(500).json({ message: err.message });
  }
};