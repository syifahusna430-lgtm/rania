import pool from "../db/pool.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: "username & password wajib" });

    const result = await pool.query("SELECT * FROM users WHERE username=$1", [
      username,
    ]);

    if (result.rows.length === 0)
      return res.status(401).json({ message: "Username tidak ditemukan" });

    const user = result.rows[0];

    // Karena DB password masih plain
    if (user.password !== password)
      return res.status(401).json({ message: "Password salah" });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1d" }
    );

    res.json({
      message: "login success",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    // versi UKT: refresh token = buat token baru dari token lama
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: "Token tidak ada" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const newToken = jwt.sign(
      { id: decoded.id, username: decoded.username, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "1d" }
    );

    res.json({ message: "refresh success", token: newToken });
  } catch (err) {
    res.status(401).json({ message: "Token invalid/expired" });
  }
};

export const logout = async (req, res) => {
  // Karena JWT stateless, logout cukup di client hapus token
  res.json({ message: "logout success (hapus token di client)" });
};