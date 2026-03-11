import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StrukPage.css';

function StrukPage() {
  const [transaction, setTransaction] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Ambil data transaksi terakhir dari localStorage
    const lastTransaction = localStorage.getItem('lastTransaction');
    if (lastTransaction) {
      setTransaction(JSON.parse(lastTransaction));
    } else {
      navigate('/transactions/kasir');
    }
  }, [navigate]);

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    localStorage.removeItem('lastTransaction');
    navigate('/transactions/kasir');
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  if (!transaction) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Memuat struk...</p>
      </div>
    );
  }

  return (
    <div className="struk-container">
      <div className="struk-card">
        {/* Header Struk */}
        <div className="struk-header">
          <h1>🏺 TOKO GERABAH</h1>
          <p>Jl. Gerabah No. 123</p>
          <p>Tel: (021) 1234567</p>
        </div>

        {/* Info Transaksi */}
        <div className="struk-info">
          <div className="info-row">
            <span>Tanggal:</span>
            <span>{transaction.date}</span>
          </div>
          <div className="info-row">
            <span>Kasir:</span>
            <span>{transaction.cashier}</span>
          </div>
          <div className="info-row">
            <span>Pembeli:</span>
            <span>{transaction.customerName}</span>
          </div>
          <div className="info-row">
            <span>Metode:</span>
            <span className="payment-badge">{transaction.paymentMethod}</span>
          </div>
        </div>

        {/* Daftar Item */}
        <div className="struk-items">
          <table>
            <thead>
              <tr>
                <th>Item Gerabah</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {transaction.items.map((item, index) => (
                <tr key={index}>
                  <td>
                    {item.name}
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatRupiah(item.price)}</td>
                  <td>{formatRupiah(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ringkasan Harga */}
        <div className="struk-summary">
          <div className="summary-row">
            <span>Subtotal:</span>
            <span>{formatRupiah(transaction.subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Pajak (10%):</span>
            <span>{formatRupiah(transaction.tax)}</span>
          </div>
          <div className="summary-row total">
            <span>Total:</span>
            <span className="total-amount">{formatRupiah(transaction.total)}</span>
          </div>
        </div>

        {/* Footer Struk */}
        <div className="struk-footer">
          <p>Terima Kasih Telah Berbelanja</p>
          <p>di TOKO GERABAH</p>
          <p className="small">* Produk gerabah berkualitas tinggi *</p>
        </div>

        {/* Tombol Aksi */}
        <div className="struk-actions">
          <button onClick={handleClose} className="btn-close">
            Tutup
          </button>
          <button onClick={handlePrint} className="btn-print">
            Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
}

export default StrukPage; 