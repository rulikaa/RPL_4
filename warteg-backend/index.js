const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('./supabaseClient');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'wartegpos_super_secret_session_key_987654321';

// Middleware
app.use(cors());
app.use(express.json());

// Helper middleware to verify JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: 'Sesi kedaluwarsa atau token tidak valid' });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Akses ditolak, token diperlukan' });
  }
};

// ==========================================
// 1. ENDPOINT OTENTIKASI (User Auth)
// ==========================================

// Pendaftaran Akun (Register Admin/Cashier)
app.post('/api/auth/register', async (req, res) => {
  const { name, username, password, role } = req.body;
  
  if (!name || !username || !password) {
    return res.status(400).json({ error: 'Nama, username, dan password wajib diisi' });
  }

  try {
    // 1. Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // 2. Insert ke table users
    const { data, error } = await supabase
      .from('users')
      .insert([{
        full_name: name,
        username,
        password_hash,
        role: role || 'admin'
      }])
      .select();

    if (error) {
      if (error.code === '23505') { // PostgreSQL unique violation code
        return res.status(400).json({ error: 'Username sudah digunakan' });
      }
      throw error;
    }

    res.status(201).json({
      message: 'Registrasi berhasil',
      user: {
        id: data[0].id,
        name: data[0].full_name,
        username: data[0].username,
        role: data[0].role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Masuk Akun (Login)
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password wajib diisi' });
  }

  try {
    // 1. Cari user di database
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username);

    if (error) throw error;
    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'Username atau password salah' });
    }

    const user = users[0];

    // 2. Cek kesamaan hash password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Username atau password salah' });
    }

    // 3. Generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.full_name },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        name: user.full_name,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cek Profil / Verifikasi Session (Me)
app.get('/api/auth/me', authenticateJWT, async (req, res) => {
  res.json({ user: req.user });
});

// ==========================================
// 2. ENDPOINT MENU (Untuk Kasir & Admin)
// ==========================================

// Ambil semua menu makanan beserta nama kategorinya (Join Table)
app.get('/api/menus', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('menus')
      .select(`
        id, name, price, is_available, image_url, category_id,
        categories ( name )
      `)
      .order('id', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tambah Menu Baru (Admin)
app.post('/api/menus', async (req, res) => {
  const { name, category_id, price, is_available, image_url } = req.body;
  try {
    const { data, error } = await supabase
      .from('menus')
      .insert([{ name, category_id: parseInt(category_id), price: parseInt(price), is_available: is_available !== false, image_url }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Edit Menu (Admin)
app.put('/api/menus/:id', async (req, res) => {
  const { id } = req.params;
  const { name, category_id, price, is_available, image_url } = req.body;
  try {
    const { data, error } = await supabase
      .from('menus')
      .update({
        name,
        category_id: parseInt(category_id),
        price: parseInt(price),
        is_available: is_available === true || is_available === 'true',
        image_url
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Menu tidak ditemukan' });
    }
    res.json(data[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Hapus Menu (Admin)
app.delete('/api/menus/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase
      .from('menus')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Menu berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. ENDPOINT TRANSAKSI (Proses Check-out Kasir)
// ==========================================

// Catat Transaksi Baru
app.post('/api/transactions', async (req, res) => {
  const { user_id, total_items, total_portions, total_amount, cart_items } = req.body;
  // cart_items berformat array objek: [{ menu_id, price, quantity, subtotal }]

  if (!cart_items || cart_items.length === 0) {
    return res.status(400).json({ error: 'Detail item belanja (cart) kosong' });
  }

  try {
    // 1. Masukkan data ke table utama transaksi
    const { data: transactionData, error: txError } = await supabase
      .from('transactions')
      .insert([{ 
        user_id: user_id ? parseInt(user_id) : null, 
        total_items: parseInt(total_items), 
        total_portions: parseInt(total_portions), 
        total_amount: parseInt(total_amount)
      }])
      .select();

    if (txError) throw txError;
    const newTransactionId = transactionData[0].id;

    // 2. Petakan cart items untuk dimasukkan ke detail transaksi
    const detailsToInsert = cart_items.map(item => ({
      transaction_id: newTransactionId,
      menu_id: parseInt(item.menu_id),
      price_at_transaction: parseInt(item.price),
      quantity: parseInt(item.quantity),
      subtotal: parseInt(item.subtotal)
    }));

    // 3. Masukkan batch rincian item ke transaction_details
    const { error: detailError } = await supabase
      .from('transaction_details')
      .insert(detailsToInsert);

    if (detailError) throw detailError;

    res.status(201).json({ 
      message: 'Transaksi berhasil disimpan!', 
      transaction_id: newTransactionId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ambil Riwayat Transaksi Laporan Keuangan (Admin)
app.get('/api/transactions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        id,
        user_id,
        total_items,
        total_portions,
        total_amount,
        transaction_time,
        transaction_details (
          id,
          menu_id,
          price_at_transaction,
          quantity,
          subtotal,
          menus ( name )
        )
      `)
      .order('transaction_time', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hapus Transaksi (Admin)
app.delete('/api/transactions/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Hapus detail transaksi terlebih dahulu untuk mematuhi integritas FK
    const { error: detailError } = await supabase
      .from('transaction_details')
      .delete()
      .eq('transaction_id', id);

    if (detailError) throw detailError;

    // 2. Hapus transaksi utama
    const { error: txError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (txError) throw txError;

    res.json({ message: 'Transaksi berhasil dihapus dari sistem' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. ENDPOINT DASHBOARD & LAPORAN
// ==========================================

// Mengambil Statistik Laporan Dashboard Real-time
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // 1. Ambil semua transaksi
    const { data: allTransactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_time', { ascending: false });

    if (txError) throw txError;

    // 2. Ambil semua rincian transaksi beserta relasi menu
    const { data: allDetails, error: detailsError } = await supabase
      .from('transaction_details')
      .select(`
        quantity,
        menu_id,
        menus ( name )
      `);

    if (detailsError) throw detailsError;

    // Hitung stat khusus hari ini (zona waktu lokal server/client)
    const todayStr = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    let todayRevenue = 0;
    let todayTxCount = 0;
    let todayPortions = 0;

    allTransactions.forEach(tx => {
      const txDateStr = tx.transaction_time ? tx.transaction_time.split('T')[0] : '';
      if (txDateStr === todayStr) {
        todayRevenue += tx.total_amount || 0;
        todayTxCount += 1;
        todayPortions += tx.total_portions || 0;
      }
    });

    // Hitung lauk terlaris
    const menuSales = {};
    allDetails.forEach(detail => {
      const menuId = detail.menu_id;
      const quantity = detail.quantity || 0;
      const menuName = detail.menus ? detail.menus.name : 'Lauk Lain';

      if (!menuSales[menuId]) {
        menuSales[menuId] = { name: menuName, sold: 0 };
      }
      menuSales[menuId].sold += quantity;
    });

    const topSelling = Object.values(menuSales)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 3); // Ambil top 3 sesuai UI mockup

    // Format transaksi terbaru untuk dashboard
    const recentTransactions = allTransactions.slice(0, 3).map(tx => {
      const date = new Date(tx.transaction_time);
      const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      return {
        id: tx.id,
        amount: tx.total_amount,
        portions: tx.total_portions,
        time: timeStr
      };
    });

    res.json({
      todayRevenue,
      todayTxCount,
      todayPortions,
      topSelling,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`Backend Warteg POS berjalan di http://localhost:${PORT}`);
});