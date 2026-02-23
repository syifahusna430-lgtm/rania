import pool from "../db/pool.js";

export const profile = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT id, name, username, role, created_at FROM users WHERE id=$1",
      [userId]
    );

    res.json({ message: "success", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const register = async (req, res) => {
  try {
    const { name, username, password, role } = req.body;

    if (!name || !username || !password || !role) {
      return res.status(400).json({ message: "data tidak lengkap" });
    }

    const allowedRoles = ["admin", "kasir", "pembeli"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "role tidak valid" });
    }

    const result = await pool.query(
      "INSERT INTO users (name, username, password, role) VALUES ($1,$2,$3,$4) RETURNING id, name, username, role",
      [name, username, password, role]
    );

    res.status(201).json({ message: "register success", data: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "username sudah dipakai" });
    }
    res.status(500).json({ message: err.message });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.body; // sesuai jobsheet: specify in request body
    if (!id) return res.status(400).json({ message: "id wajib" });

    // Admin tidak boleh deactivate diri sendiri (sesuai skenario uji)
    if (Number(id) === Number(req.user.id)) {
      return res
        .status(403)
        .json({ message: "Admin tidak boleh deactivate dirinya sendiri" });
    }

    // Karena DB tidak ada kolom active, kita hapus user
    const result = await pool.query("DELETE FROM users WHERE id=$1 RETURNING *", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "user tidak ditemukan" });
    }

    res.json({ message: "deactivate success (user deleted)", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};