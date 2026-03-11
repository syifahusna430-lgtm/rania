import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { getRole, getUsername } from '../../utils/auth';
import KasirCart from '../../components/Cart/KasirCart';
import './KasirPage.css';

function KasirPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('TUNAI');
  const navigate = useNavigate();
  const role = getRole();
  const username = getUsername();

  useEffect(() => {
    if (role !== 'kasir' && role !== 'admin') {
      alert('Akses ditolak. Halaman ini hanya untuk kasir dan admin');
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      
      // Extract data
      const productsData = Array.isArray(productsRes.data) ? productsRes.data : 
                          (productsRes.data?.data || []);
      const categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : 
                            (categoriesRes.data?.data || []);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Gagal fetch data:', error);
      alert('Gagal mengambil data produk');
    } finally {
      setLoading(false);
    }
  };

  // FUNGSI ADD TO CART - TANPA VARIANT
  const addToCart = (product) => {
    if (product.stock < 1) {
      alert(`Stok ${product.name} habis!`);
      return;
    }

    setCart(prev => {
      const existingItem = prev.find(item => item.id === product.id);

      if (existingItem) {
        if (existingItem.quantity + 1 > product.stock) {
          alert(`Stok ${product.name} tidak mencukupi!`);
          return prev;
        }
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock
      }];
    });
  };

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(index);
      return;
    }

    setCart(prev => {
      const item = prev[index];
      if (newQuantity > item.stock) {
        alert(`Stok ${item.name} hanya tersisa ${item.stock}`);
        return prev;
      }
      return prev.map((item, i) => 
        i === index ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Kosongkan keranjang?')) {
      setCart([]);
      setCustomerName('');
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.1; // Pajak 10%
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Keranjang masih kosong!');
      return;
    }

    if (!customerName.trim()) {
      alert('Masukkan nama pembeli!');
      return;
    }

    try {
      const subtotal = calculateSubtotal();
      const tax = calculateTax();
      const total = calculateTotal();

      const transactionData = {
        buyer_name: customerName,
        items: cart.map(item => ({
          product_id: item.id,
          qty: item.quantity,
          price: item.price
        })),
        payment_method: paymentMethod,
        subtotal: subtotal,
        tax: tax,
        total: total
      };

      console.log('Mengirim transaksi:', transactionData);

      // Simpan transaksi ke database
      const response = await api.post('/transactions', transactionData);
      
      // Simpan data struk ke localStorage untuk preview
      localStorage.setItem('lastTransaction', JSON.stringify({
        id: response.data.id,
        items: cart,
        customerName: customerName,
        paymentMethod: paymentMethod,
        subtotal: subtotal,
        tax: tax,
        total: total,
        date: new Date().toLocaleString('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        cashier: username
      }));

      // Redirect ke halaman struk
      navigate('/transactions/struk');
      
    } catch (error) {
      console.error('Error checkout:', error);
      alert('Gagal memproses transaksi: ' + (error.response?.data?.message || error.message));
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
      product.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="kasir-page">
      {/* Header */}
      <div className="kasir-header">
        <div>
          <h1>🏺 TOKO GERABAH</h1>
          <p>Jl. Gerabah No. 123 | Tel: (021) 1234567</p>
        </div>
        <div className="kasir-info">
          <span>👤 {username} ({role})</span>
          <button onClick={() => navigate('/dashboard')} className="btn-back">
            Kembali
          </button>
        </div>
      </div>

      <div className="kasir-content">
        {/* Left Panel - Daftar Produk */}
        <div className="products-panel">
          <h2>📋 Daftar Produk Gerabah</h2>
          
          {/* Search & Filter */}
          <div className="product-filters">
            <input
              type="text"
              placeholder="Cari produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Product Grid */}
          <div className="product-grid-scroll">
            <div className="product-grid">
              {filteredProducts.length === 0 ? (
                <p className="no-products">Tidak ada produk ditemukan</p>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id} className="product-item">
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="product-price">{formatRupiah(product.price)}</p>
                      <p className={`product-stock ${product.stock < 5 ? 'low-stock' : ''}`}>
                        Stok: {product.stock}
                      </p>
                    </div>
                    <div className="product-actions">
                      <button 
                        onClick={() => addToCart(product)}
                        className="btn-add"
                        disabled={product.stock < 1}
                      >
                        + Tambah
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Keranjang */}
        <div className="cart-panel">
          <KasirCart
            cart={cart}
            customerName={customerName}
            setCustomerName={setCustomerName}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            calculateSubtotal={calculateSubtotal}
            calculateTax={calculateTax}
            calculateTotal={calculateTotal}
            formatRupiah={formatRupiah}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}

export default KasirPage;