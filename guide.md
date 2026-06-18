# Manual Book Warteg POS

## 1. Gambaran Umum

Warteg POS adalah aplikasi kasir dan administrasi warteg berbasis web. Aplikasi ini digunakan untuk mencatat transaksi penjualan, mengelola menu lauk, melihat ringkasan pendapatan, melihat riwayat transaksi, dan memvalidasi akun karyawan kasir.

URL website production: `https://warteg-frontend.vercel.app`

## 2. Jenis Pengguna

### Admin / Pemilik

Admin memiliki akses ke seluruh fitur:

- Dashboard ringkasan penjualan.
- Manajemen lauk/menu.
- Catatan transaksi.
- Validasi akun kasir.
- Halaman POS kasir.

### Kasir / Karyawan

Kasir memiliki akses utama ke halaman POS untuk membuat transaksi. Jika akun kasir belum diverifikasi admin, kasir akan melihat halaman menunggu verifikasi dan belum bisa menggunakan POS.

## 3. Login

1. Buka website Warteg POS.
2. Masukkan `Username`.
3. Masukkan `Password`.
4. Klik tombol `SIGN IN NOW`.
5. Setelah login berhasil:
   - Admin diarahkan ke dashboard admin.
   - Kasir terverifikasi diarahkan ke halaman POS kasir.
   - Kasir belum terverifikasi diarahkan ke halaman `Akun Belum Aktif`.

Jika login gagal, periksa kembali username dan password yang digunakan.

## 4. Registrasi Akun Baru

1. Pada halaman login, klik `DAFTAR AKUN BARU`.
2. Isi `Nama Lengkap Pemilik`.
3. Isi `Username Baru`.
4. Pilih role akun:
   - `Pemilik (Admin)` untuk akun admin.
   - `Karyawan (Kasir)` untuk akun kasir.
5. Isi `Kata Sandi` minimal 8 karakter.
6. Isi `Konfirmasi Kata Sandi` dengan nilai yang sama.
7. Klik `BUAT AKUN ADMIN`.
8. Jika berhasil, sistem akan kembali ke halaman login.

Catatan: akun kasir perlu diverifikasi oleh admin sebelum dapat menggunakan POS.

## 5. Menggunakan POS Kasir

Halaman POS digunakan untuk memilih lauk, membuat pesanan, menyimpan transaksi, dan mencetak struk.

### Memilih Menu

1. Masuk sebagai kasir atau admin.
2. Buka halaman POS.
3. Gunakan filter kategori di bagian atas untuk melihat menu berdasarkan kategori.
4. Klik kartu menu untuk menambahkan lauk ke keranjang.

Menu yang statusnya `Habis` tidak ditampilkan di daftar POS kasir.

### Mengatur Keranjang

1. Setelah menu diklik, item masuk ke bagian `Pesanan Baru`.
2. Klik tombol `+` untuk menambah jumlah porsi.
3. Klik tombol `-` untuk mengurangi jumlah porsi.
4. Jika jumlah menjadi 0, item akan otomatis hilang dari keranjang.
5. Periksa subtotal dan total sebelum membayar.

Pada layar mobile, keranjang tampil sebagai drawer bawah. Gunakan tombol `Lihat Keranjang` untuk membukanya.

### Menyimpan Transaksi

1. Pastikan keranjang tidak kosong.
2. Klik `BAYAR SEKARANG`.
3. Sistem menyimpan transaksi ke database.
4. Jika berhasil, muncul modal `Pembayaran Berhasil` berisi ringkasan transaksi.
5. Klik `Tutup` untuk menutup modal, atau klik `Cetak Struk` untuk mencetak struk.

## 6. Dashboard Admin

Dashboard admin berisi ringkasan performa penjualan.

Informasi yang ditampilkan:

- `Total Pendapatan Hari Ini`.
- `Jumlah Transaksi` hari ini.
- `Total Lauk Terjual` hari ini.
- Top 3 lauk terlaris.
- Transaksi terbaru.

Admin dapat berpindah tab melalui sidebar desktop atau navigasi bawah pada mobile.

## 7. Manajemen Lauk

Tab `Manajemen Lauk` digunakan untuk menambah, mengedit, menghapus, dan mengatur status ketersediaan lauk.

### Menambah Lauk Baru

1. Buka dashboard admin.
2. Pilih tab `Manajemen Lauk`.
3. Klik `Tambah Lauk Baru`.
4. Isi `Nama Lauk`.
5. Pilih kategori:
   - Ayam & Ikan
   - Sayuran
   - Gorengan
   - Lain-lain
6. Isi `Harga Lauk`.
7. Isi `Foto Makanan (URL)` jika ada. Jika kosong, sistem memakai gambar default.
8. Klik `Simpan`.

### Mengedit Lauk

1. Pada daftar menu, klik `Edit` di lauk yang ingin diubah.
2. Ubah nama, kategori, harga, URL foto, atau status ketersediaan.
3. Pilih status `Tersedia` jika menu bisa dijual.
4. Pilih status `Habis` jika menu tidak ingin muncul di POS kasir.
5. Klik `Simpan`.

### Menghapus Lauk

1. Pada daftar menu, klik `Hapus`.
2. Konfirmasi penghapusan.
3. Jika berhasil, lauk hilang dari daftar menu.

Gunakan fitur hapus dengan hati-hati karena data menu akan dihapus dari sistem.

## 8. Catatan Transaksi

Tab `Catatan Transaksi` menampilkan semua transaksi yang tersimpan.

### Melihat Detail Transaksi

1. Buka dashboard admin.
2. Pilih tab `Catatan Transaksi`.
3. Klik salah satu transaksi.
4. Modal detail akan menampilkan daftar lauk, jumlah, subtotal, dan total transaksi.

### Menghapus Transaksi

1. Buka detail transaksi.
2. Klik `HAPUS TRANSAKSI INI`.
3. Konfirmasi penghapusan.
4. Transaksi akan dihapus dan rekap pendapatan ikut menyesuaikan.

## 9. Validasi Akun

Tab `Validasi Akun` digunakan admin untuk mengaktifkan atau menangguhkan akun kasir.

### Memverifikasi Akun

1. Buka dashboard admin.
2. Pilih tab `Validasi Akun`.
3. Cari akun dengan status `Menunggu`.
4. Klik `Verifikasi`.
5. Konfirmasi tindakan.
6. Akun berubah menjadi `Aktif` dan kasir dapat menggunakan POS setelah login ulang atau refresh halaman.

### Menangguhkan Akun

1. Cari akun yang statusnya `Aktif`.
2. Klik `Tangguhkan`.
3. Konfirmasi tindakan.
4. Akun tidak dapat menggunakan POS sampai diverifikasi kembali.

Admin tidak dapat menangguhkan akun yang sedang digunakan sendiri dari tombol akun tersebut.

## 10. Logout

Klik tombol `Keluar` atau `Keluar / Logout` untuk keluar dari sistem. Setelah logout, token sesi dan data pengguna akan dihapus dari browser.

## 11. Troubleshooting

### Tidak Bisa Login

- Pastikan username dan password benar.
- Pastikan backend production aktif.
- Jika akun kasir baru dibuat, minta admin melakukan verifikasi akun.

### Menu Tidak Muncul di POS

- Pastikan menu berstatus `Tersedia` di tab `Manajemen Lauk`.
- Pastikan menu memiliki kategori yang benar.
- Refresh halaman jika data belum berubah.

### Transaksi Gagal Disimpan

- Pastikan keranjang tidak kosong.
- Pastikan koneksi internet stabil.
- Coba refresh halaman dan ulangi transaksi.

### Akun Kasir Menunggu Verifikasi

- Hubungi admin/pemilik warteg.
- Admin perlu membuka tab `Validasi Akun` dan menekan `Verifikasi` pada akun kasir tersebut.

## 12. Alur Operasional Harian

1. Admin login dan memastikan menu hari ini berstatus benar.
2. Admin menambahkan atau mengedit menu jika ada perubahan harga/stok.
3. Kasir login dan membuka halaman POS.
4. Kasir mencatat setiap pesanan melalui keranjang POS.
5. Kasir menekan `BAYAR SEKARANG` setelah pembayaran diterima.
6. Admin memantau pendapatan dan transaksi dari dashboard.
7. Admin menutup hari dengan mengecek catatan transaksi dan total pendapatan.
