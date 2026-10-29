# Daftar Pengerjaan — RumahBahagia
Acuan: [06-IPD.md](./06-IPD.md) · Status: `[ ]` belum · `[/]` dikerjakan · `[x]` selesai
Package manager: **npm**

---

## 0. Persiapan (oleh Anda)
- [x] Install **Node.js LTS** (v20/v22) → cek `node -v` & `npm -v`
- [x] Install **Git** & buat akun **GitHub** (`https://github.com/agirahmawandi/RumahBahagia.git`)
- [/] Buat akun **Supabase** → buat project `rumahbahagia` (region Singapore), simpan *Project URL*, *anon key*, *service role key*, password DB
- [ ] Buat akun **Vercel** (login pakai GitHub)
- [x] (Opsional) Install **Docker Desktop** untuk Supabase lokal

## 1. F0 — Setup Proyek
- [x] Inisialisasi Next.js 15 + TypeScript + Tailwind v4 + ESLint
- [x] Install shadcn/ui, lucide-react, zod, react-hook-form, date-fns, recharts, @supabase/ssr
- [x] Font: Archivo Narrow, Comfortaa, Maitree (`next/font/google`)
- [x] Design tokens warna Tropical Heat di `globals.css`
- [x] Helper `formatRupiah`, `formatTanggal`
- [x] Supabase client (browser, server, middleware) + `.env.local`
- [x] Layout: sidebar desktop, topbar, bottom-nav + FAB mobile
- [x] Halaman kosong semua menu
- [/] Push ke GitHub & hubungkan ke Vercel (preview deploy)

## 2. F1 — Auth & Household
- [ ] Migrasi: enum, `profiles`, `households`, `household_members`, `household_invitations`
- [ ] Trigger buat profil saat user daftar
- [ ] Fungsi `is_member`, `can_edit` + RLS
- [ ] Halaman Login, Register, Lupa Password, Google OAuth
- [ ] Middleware proteksi halaman
- [ ] Onboarding wizard (Pribadi/Keluarga, nama buku)
- [ ] Ganti household (switcher)
- [ ] Undang anggota + terima undangan

## 3. F2 — Mesin Akuntansi
- [ ] Migrasi `ledger_accounts`, `journal_entries`, `journal_lines`
- [ ] Trigger cek debit = kredit
- [ ] RPC `create_household` + seed COA & kategori default
- [ ] RPC `create_transaction`, `update_transaction`, `void_transaction`
- [ ] View `v_account_balances`
- [ ] Test: jurnal tidak seimbang ditolak, data antar household terisolasi
- [ ] Generate tipe TypeScript

## 4. F3 — Rekening & Transaksi Harian
- [ ] Migrasi `accounts`, `categories`, `attachments` + bucket `receipts`
- [ ] Rekening: daftar per jenis (Cash/Bank/E-Wallet/Kartu Kredit), tambah dengan saldo awal, edit, arsip
- [ ] Detail rekening + mutasi + rekonsiliasi
- [ ] Pemasukan: daftar + filter + form
- [ ] Pengeluaran: daftar + filter + form + upload struk
- [ ] Transfer antar rekening (+ biaya admin)
- [ ] Quick-add FAB
- [ ] Pengaturan kategori

## 5. F4 — Tabungan, Investasi, Aset, Utang
- [ ] Tabungan: buat pos manual, target, setor/tarik, progres, riwayat
- [ ] Investasi: instrumen, beli/jual/dividen, update nilai pasar, untung/rugi, pie alokasi
- [ ] Aset: tambah, revaluasi, jual/lepas
- [ ] Utang: tambah, bayar cicilan (pokok + bunga), progres pelunasan

## 6. F5 — Dashboard & Laporan
- [ ] Dashboard: kekayaan bersih, total kas, pemasukan vs pengeluaran, top kategori, progres tabungan, transaksi terakhir
- [ ] Laporan Neraca
- [ ] Laporan Surplus/Defisit
- [ ] Laporan Arus Kas
- [ ] Buku Besar & Jurnal Umum (+ jurnal manual owner)
- [ ] Ekspor CSV & PDF
- [ ] Anggaran bulanan + peringatan 80%

## 7. F6 — QA & Launch
- [ ] Unit test (Vitest) & E2E (Playwright)
- [ ] Audit aksesibilitas & Lighthouse ≥ 90
- [ ] Empty state, skeleton, halaman error 404/403
- [ ] Audit log
- [ ] Review keamanan RLS (Supabase Advisor)
- [ ] Deploy production + domain + SMTP email

## 8. F7 — Fase 2 (setelah rilis)
- [ ] Transaksi berulang (Vercel Cron)
- [ ] Penyusutan aset otomatis
- [ ] PWA (bisa di-install di HP)
- [ ] Dark mode & notifikasi
