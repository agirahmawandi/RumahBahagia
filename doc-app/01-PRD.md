# PRD — Product Requirement Documentation
**Produk:** RumahBahagia — Catatan Keuangan Keluarga
**Versi:** 1.0 | **Tanggal:** 29 Okt 2026 | **Platform:** Web App (React + Next.js di Vercel, Database Supabase)

---

## 1. Latar Belakang
Banyak keluarga mencatat keuangan secara sporadis (catatan HP, Excel) sehingga sulit melihat posisi kekayaan bersih, arus kas, dan progres tabungan. Produk ini membawa **prinsip akuntansi perusahaan (double-entry / pembukuan berpasangan)** ke skala rumah tangga, namun dengan antarmuka sederhana yang tidak menuntut pengguna paham akuntansi.

## 2. Tujuan Produk
| # | Tujuan | Indikator Keberhasilan |
|---|--------|------------------------|
| G1 | Mencatat semua arus uang (masuk, keluar, transfer) dengan cepat | Input transaksi < 15 detik |
| G2 | Mengetahui saldo setiap rekening & cash secara akurat | Saldo app = saldo riil (rekonsiliasi) |
| G3 | Memantau aset, investasi, dan pos tabungan | Laporan Neraca otomatis |
| G4 | Mendukung pemakaian bersama oleh keluarga | ≥ 2 anggota per buku keuangan |
| G5 | Menyediakan laporan ala perusahaan | Neraca, Laba-Rugi (Surplus/Defisit), Arus Kas |

## 3. Target Pengguna & Persona
1. **Kepala Keluarga / Pengelola Keuangan (Owner)** — mengatur rekening, kategori, anggaran, melihat laporan.
2. **Pasangan / Anggota (Editor)** — menginput pemasukan & pengeluaran harian.
3. **Anak / Viewer** — hanya melihat (opsional).
4. **Pengguna Pribadi** — single user, satu buku keuangan.

## 4. Ruang Lingkup (Scope)

### 4.1 In Scope (MVP)
- Autentikasi (email/password, Google OAuth, magic link).
- **Buku Keuangan (Household/Ledger)**: Pribadi atau Keluarga, undang anggota dengan peran.
- **Menu Pemasukan**: catat pemasukan, kategori (Gaji, Bonus, Usaha, Hadiah, Lainnya — bisa ditambah), ke rekening tujuan.
- **Menu Pengeluaran**: catat pengeluaran, kategori & sub-kategori, dari rekening sumber, lampiran foto struk.
- **Transfer antar rekening** (mis. Bank → Cash, Bank → E-Wallet).
- **Rekening (Akun Kas)**: banyak rekening, jenis: `Cash`, `Bank`, `E-Wallet`, `Kartu Kredit` (liabilitas). Saldo awal, warna/ikon, arsip.
- **Tabungan (Pos Tabungan)**: pos dibuat manual (Dana Darurat, Pendidikan, Hari Tua, Liburan, dst.), target nominal & tanggal, setor/tarik, progres %.
- **Investasi**: Reksa Dana, Saham, Emas, Obligasi/SBN, Deposito, Kripto, Lainnya. Catat beli/jual, nilai pokok, update nilai pasar manual, hitung untung/rugi belum terealisasi.
- **Aset**: aset non-kas (Rumah, Kendaraan, Elektronik, Tanah, dll.), nilai perolehan, nilai saat ini (manual), penyusutan opsional.
- **Utang/Liabilitas** (pendukung neraca): KPR, cicilan kendaraan, pinjaman, kartu kredit.
- **Dashboard**: total kekayaan bersih, saldo per rekening, pemasukan vs pengeluaran bulan ini, progres tabungan, transaksi terakhir.
- **Laporan**: Neraca, Laporan Surplus/Defisit (Laba-Rugi), Arus Kas, Buku Besar per akun, Jurnal Umum. Filter periode. Ekspor CSV/PDF.
- **Anggaran (Budget)** bulanan per kategori pengeluaran (Should-have).
- **Rekonsiliasi saldo**: sesuaikan saldo rekening dengan saldo riil (membuat jurnal penyesuaian).

### 4.2 Out of Scope (MVP)
- Integrasi otomatis bank / open banking.
- Harga pasar investasi real-time (fase 2).
- Multi-mata uang penuh (MVP: IDR; kolom currency disiapkan).
- Aplikasi native mobile (PWA di fase 2).

## 5. Fitur & Requirement Fungsional

| ID | Modul | Requirement | Prioritas |
|----|-------|-------------|-----------|
| F-01 | Auth | Daftar, login, logout, reset password | Must |
| F-02 | Household | Buat buku, undang anggota via email, peran Owner/Editor/Viewer | Must |
| F-03 | Rekening | CRUD rekening; jenis Cash/Bank/E-Wallet/Kartu Kredit; saldo awal; arsip | Must |
| F-04 | Pemasukan | Input: tanggal, nominal, kategori, rekening tujuan, catatan, tag | Must |
| F-05 | Pengeluaran | Input: tanggal, nominal, kategori, rekening sumber, catatan, lampiran | Must |
| F-06 | Transfer | Pindah dana antar rekening + biaya admin opsional | Must |
| F-07 | Tabungan | CRUD pos tabungan manual; target; setor/tarik dari rekening; progres | Must |
| F-08 | Investasi | CRUD portofolio; transaksi beli/jual/dividen; update nilai pasar | Must |
| F-09 | Aset | CRUD aset; nilai perolehan; revaluasi; jual/hapus aset | Must |
| F-10 | Utang | CRUD liabilitas; pembayaran cicilan (pokok + bunga) | Should |
| F-11 | Jurnal | Setiap transaksi otomatis menghasilkan jurnal double-entry seimbang | Must |
| F-12 | Laporan | Neraca, Surplus/Defisit, Arus Kas, Buku Besar | Must |
| F-13 | Dashboard | Ringkasan & grafik | Must |
| F-14 | Kategori | CRUD kategori pemasukan/pengeluaran (default disediakan) | Must |
| F-15 | Anggaran | Budget bulanan per kategori + peringatan > 80% | Should |
| F-16 | Transaksi berulang | Template berulang (gaji, listrik, cicilan) | Could |
| F-17 | Ekspor | CSV & PDF | Should |
| F-18 | Audit log | Siapa membuat/mengubah transaksi | Should |
| F-19 | Rekonsiliasi | Penyesuaian saldo rekening | Should |

## 6. Prinsip Akuntansi (Disederhanakan)
- **Persamaan dasar:** Aset = Liabilitas + Ekuitas (Kekayaan Bersih).
- Setiap transaksi = 1 **jurnal** dengan ≥ 2 baris (debit = kredit).
- Pengguna tidak melihat istilah debit/kredit di form; sistem membuat jurnal otomatis. Jurnal tetap dapat dilihat di menu Laporan (mode "Akuntan").
- Pos tabungan & investasi diperlakukan sebagai **akun aset** terpisah, sehingga uang yang "dialokasikan" tidak tercampur dengan kas operasional.

## 7. Requirement Non-Fungsional
| Aspek | Requirement |
|-------|-------------|
| Performa | LCP < 2.5 dtk; daftar transaksi paginasi 50/halaman |
| Keamanan | Supabase RLS per household; HTTPS; tidak menyimpan kredensial bank |
| Ketersediaan | Mengikuti SLA Vercel & Supabase |
| Responsif | Mobile 360px s/d desktop 1440px |
| Aksesibilitas | WCAG 2.1 AA (kontras, keyboard, label) |
| Lokalisasi | Bahasa Indonesia, format `Rp 1.250.000`, tanggal `28 Okt 2026` |
| Integritas data | Jurnal tidak seimbang ditolak di level database |

## 8. Metrik Keberhasilan
- DAU/MAU ≥ 40%.
- Rata-rata ≥ 20 transaksi/household/bulan.
- ≥ 60% pengguna membuat minimal 1 pos tabungan.

## 9. Asumsi & Risiko
| Risiko | Mitigasi |
|--------|----------|
| Pengguna bingung istilah akuntansi | Bahasa awam di UI, istilah akuntansi hanya di laporan |
| Malas input harian | Quick-add button, transaksi berulang, default rekening |
| Data sensitif | RLS, enkripsi at-rest Supabase, 2FA (fase 2) |

## 10. Roadmap Singkat
- **Fase 1 (MVP):** F-01 s/d F-14.
- **Fase 2:** Anggaran, transaksi berulang, ekspor, PWA, rekonsiliasi.
- **Fase 3:** Harga investasi otomatis, OCR struk, multi-currency, notifikasi.
