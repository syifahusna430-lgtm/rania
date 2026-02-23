import pool from "../db/pool.js";

export const getAllTransactions = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.name AS cashier_name
       FROM transactions t
       LEFT JOIN users u ON u.id = t.cashier_id
       ORDER BY t.id DESC`
    );
    res.json({ message: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const trx = await pool.query(
      `SELECT t.*, u.name AS cashier_name
       FROM transactions t
       LEFT JOIN users u ON u.id = t.cashier_id
       WHERE t.id=$1`,
      [id]
    );

    if (trx.rows.length === 0)
      return res.status(404).json({ message: "transaction not found" });

    const details = await pool.query(
      `SELECT td.*, p.name AS product_name
       FROM transaction_details td
       LEFT JOIN products p ON p.id = td.product_id
       WHERE td.transaction_id=$1`,
      [id]
    );

    res.json({
      message: "success",
      data: {
        transaction: trx.rows[0],
        items: details.rows,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /transactions
export const createTransaction = async (req, res) => {
  const client = await pool.connect();
  try {
    const { buyer_name, items } = req.body;
    const cashier_id = req.user.id;

    if (!buyer_name || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "data transaksi tidak lengkap" });
    }

    await client.query("BEGIN");

    // buat transaksi awal total 0
    const trx = await client.query(
      "INSERT INTO transactions (cashier_id, buyer_name, total) VALUES ($1,$2,0) RETURNING *",
      [cashier_id, buyer_name]
    );

    const transaction_id = trx.rows[0].id;

    // insert detail (trigger akan cek stok + hitung subtotal + update total)
    for (const it of items) {
      const { product_id, qty } = it;
      if (!product_id || !qty) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "item tidak valid" });
      }

      // ambil harga dari products
      const prod = await client.query("SELECT price FROM products WHERE id=$1", [
        product_id,
      ]);

      if (prod.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "product tidak ditemukan" });
      }

      const price = prod.rows[0].price;

      await client.query(
        `INSERT INTO transaction_details (transaction_id, product_id, qty, price)
         VALUES ($1,$2,$3,$4)`,
        [transaction_id, product_id, qty, price]
      );
    }

    await client.query("COMMIT");

    const finalTrx = await pool.query("SELECT * FROM transactions WHERE id=$1", [
      transaction_id,
    ]);

    res.status(201).json({
      message: "success",
      data: finalTrx.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
};

// PUT /transactions/:id  (edit transaksi tambah 1 item)
export const updateTransactionAddItem = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { product_id, qty } = req.body;

    if (!product_id || !qty)
      return res.status(400).json({ message: "product_id & qty wajib" });

    await client.query("BEGIN");

    // cek transaksi ada
    const trx = await client.query("SELECT * FROM transactions WHERE id=$1", [id]);
    if (trx.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "transaction not found" });
    }

    // ambil harga product
    const prod = await client.query("SELECT price FROM products WHERE id=$1", [
      product_id,
    ]);

    if (prod.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "product tidak ditemukan" });
    }

    const price = prod.rows[0].price;

    // insert detail baru (trigger akan update total & stok)
    await client.query(
      `INSERT INTO transaction_details (transaction_id, product_id, qty, price)
       VALUES ($1,$2,$3,$4)`,
      [id, product_id, qty, price]
    );

    await client.query("COMMIT");

    const updated = await pool.query("SELECT * FROM transactions WHERE id=$1", [id]);

    res.json({ message: "success", data: updated.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ message: err.message });
  } finally {
    client.release();
  }
};