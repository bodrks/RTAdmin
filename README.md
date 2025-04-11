# Aplikasi Administrasi RT - Iuran dan Pengeluaran

Sebuah aplikasi berbasis Laravel & React untuk membantu Ketua RT dalam mengelola:

- Data penghuni rumah
- Data rumah
- Pembayaran iuran satpam & kebersihan (bulanan & tahunan)
- Riwayat penghuni
- Riwayat pembayaran
- Data pengeluaran bulanan
- Laporan ringkasan & detail per bulan dalam bentuk grafik

---

## 🔧 Fitur

### ✅ Pengelolaan Data
- Menambah, mengedit, dan menghapus **data rumah** & **penghuni**
- Catatan **riwayat penghuni** setiap rumah

### ✅ Iuran Warga
- Jenis iuran: **Satpam (Rp100.000)** dan **Kebersihan (Rp15.000)**
- Bisa bayar **bulanan** atau **tahunan**
- Cek status **lunas/belum** per bulan dan tahun

### ✅ Pengeluaran RT
- Data dummy untuk pengeluaran bulanan (misalnya gaji satpam, token listrik)
- Menampilkan pengeluaran per bulan

### ✅ Laporan Keuangan
- **Grafik ringkasan** pemasukan vs pengeluaran
- **Detail laporan** bulanan
- Tampilan user-friendly & responsive

---

## 🧱 Teknologi

- **Backend**: Laravel 12.x
- **Frontend**: React.js + Bootstrap
- **Database**: MySQL
- **Charting**: Chart.js
- **API Comm**: Axios

---

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/bodrks/RTAdmin.git
```
### 2. Backend
- cd RTAdmin
- composer install
- cp .env.example .env
- sesuaikan database di env
- php artisan key:generate
- php artisan migrate --seed
- php artisan serve

### 3. Frontend
- cd RTAdmin/rt-frontend
- npm install
- npm run dev
