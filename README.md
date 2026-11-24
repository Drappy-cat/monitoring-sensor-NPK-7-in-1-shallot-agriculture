# 🌱 Monitoring Sensor NPK 7-in-1 — Pertanian Bawang Merah

Website dashboard monitoring real-time untuk pembacaan sensor NPK 7-in-1 (4 sensor: sensor_1 s/d sensor_4), debit air, status katup irigasi, dan kondisi tanah secara langsung dari Firebase Realtime Database.

---

## 🚀 Fitur Utama

- 🟢 **Real-time Live Sync**: Menggunakan WebSocket Firebase (`onValue`) ke `test_kalibrasi/latest` dan time-series `test_kalibrasi/readings/{tanggal}`.
- 🧪 **Line Chart Nutrisi Tanah (NPK)**:
  - Nitrogen (N) — mg/kg (4 sensor)
  - Fosfor (P) — mg/kg (4 sensor)
  - Kalium (K) — mg/kg (4 sensor)
- 🌍 **Line Chart Kondisi Lingkungan**:
  - pH Tanah (4 sensor)
  - Kelembaban / Moisture (%) + Rata-rata Kelembaban
  - Suhu Tanah (°C) (4 sensor)
  - Konduktivitas Listrik / EC (µS/cm) (4 sensor)
- 💧 **Line Chart Irigasi**:
  - Debit Air Saat Ini (L/min) & Total Akumulasi Debit (L) (Dual-axis)
- 📊 **Status Cards**:
  - Rata-rata Kelembaban (AvgMoisture)
  - Debit & Total Debit
  - Status Katup Irigasi (OPEN / CLOSED)
  - Indikator Batas Maksimum (MaxLimitReached)
- 📋 **Tabel Perbandingan Sensor**:
  - Membandingkan nilai Sensor 1 s/d 4 secara real-time dengan highlight nilai tertinggi & terendah.

---

## 💻 Menjalankan di Lokal (Development)

Cukup buka terminal di folder project ini:

```bash
npm run dev
```

Buka browser di **[http://localhost:3000](http://localhost:3000)**.

---

## 🌐 Cara Deploy ke GitHub & Vercel

### 1. Push ke GitHub
```bash
git add .
git commit -m "feat: real-time NPK monitoring dashboard for shallot agriculture"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

### 2. Deploy ke Vercel (Gratis)
1. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
2. Klik **"Add New..."** → **"Project"**.
3. Pilih repository GitHub Anda.
4. *(Root Directory biarkan default `./` karena project sudah berada di root)*.
5. Pada bagian **Environment Variables**, tambahkan:
   - **Key**: `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
   - **Value**: `https://agriculture-esp32-2f547-default-rtdb.asia-southeast1.firebasedatabase.app`
6. Klik **Deploy**!
7. Selesai! Dashboard Anda online dan dapat diakses dari mana saja.
