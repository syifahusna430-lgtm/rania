import pool from '../db/pool.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pastikan folder upload ada
const uploadDir = path.join(__dirname, '../../public/images/produk/');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Folder upload dibuat:', uploadDir);
}

// Konfigurasi multer untuk upload file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../public/images/produk/');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = 'produk-' + uniqueSuffix + ext;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('File harus berupa gambar!'), false);
  }
};

export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});

// GET all products
export const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET product by id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// CREATE product
export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, category_id, description } = req.body;
    let image_url = null;
    
    if (req.file) {
      image_url = req.file.filename;
    }
    
    if (!name || !price || !stock || !category_id) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }
    
    const result = await pool.query(
      'INSERT INTO products (name, price, stock, category_id, image_url, description) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, price, stock, category_id, image_url, description || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error create product:', error);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, category_id, description } = req.body;
    let image_url = req.body.image_url;
    
    if (!name || !price || !stock || !category_id) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }
    
    if (req.file) {
      image_url = req.file.filename;
      
      // Hapus gambar lama
      const oldProduct = await pool.query('SELECT image_url FROM products WHERE id = $1', [id]);
      if (oldProduct.rows.length > 0 && oldProduct.rows[0].image_url) {
        const oldFilePath = path.join(__dirname, '../../public/images/produk/', oldProduct.rows[0].image_url);
        try {
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        } catch (err) {
          console.error('Gagal hapus gambar lama:', err);
        }
      }
    }
    
    const result = await pool.query(
      'UPDATE products SET name = $1, price = $2, stock = $3, category_id = $4, image_url = $5, description = $6 WHERE id = $7 RETURNING *',
      [name, price, stock, category_id, image_url, description || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error update product:', error);
    res.status(500).json({ message: error.message });
  }
};

// DELETE product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await pool.query('SELECT image_url FROM products WHERE id = $1', [id]);
    if (product.rows[0]?.image_url) {
      const filePath = path.join(__dirname, '../../public/images/produk/', product.rows[0].image_url);
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error('Gagal hapus gambar:', err);
      }
    }
    
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }
    
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};