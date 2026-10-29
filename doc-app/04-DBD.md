# DBD — Design Brief Documentation
**Produk:** RumahBahagia — Catatan Keuangan Keluarga | **Versi:** 1.0

---

## 1. Konsep Visual
**Tema: "Tropical Heat"** — hangat, optimis, ramah keluarga, tetap rapi seperti dokumen keuangan. Kesan: *ceria tapi terpercaya*.
Kata kunci: Hangat · Bersih · Jelas · Bersahabat.

## 2. Palet Warna

### 2.1 Warna Utama (dari referensi)
| Token | Hex | Nama | Penggunaan |
|-------|-----|------|-----------|
| `--teal` | `#00CEC8` | Tropical Teal | Primary action, pemasukan, saldo positif, progres tabungan |
| `--cream` | `#FCEFC3` | Sand Cream | Background section, kartu highlight, sidebar |
| `--peach` | `#FF9C5F` | Mango Peach | Secondary/aksen, investasi, hover, chart |
| `--flame` | `#EB4203` | Flame Orange | Pengeluaran, peringatan, destructive, saldo negatif |

### 2.2 Warna Turunan & Netral
| Token | Hex | Penggunaan |
|-------|-----|-----------|
| `--teal-700` | `#00908C` | Teks/ikon teal di atas putih (kontras AA), hover primary |
| `--teal-50` | `#E6FAF9` | Background badge pemasukan |
| `--cream-50` | `#FFFBEF` | Background halaman |
| `--peach-100` | `#FFE6D6` | Badge investasi |
| `--flame-700` | `#B83302` | Teks merah kontras tinggi |
| `--flame-50` | `#FDECE5` | Background badge pengeluaran |
| `--ink` | `#1F1A17` | Teks utama |
| `--ink-muted` | `#6B625C` | Teks sekunder |
| `--line` | `#EADFC4` | Border |
| `--white` | `#FFFFFF` | Kartu |

> [!IMPORTANT]
> `#00CEC8` dan `#FF9C5F` memiliki kontras rendah terhadap putih. Untuk **teks** gunakan `--teal-700` / `--flame-700` / `--ink`. Tombol teal memakai teks `--ink` (bukan putih).

### 2.3 Makna Semantik
| Makna | Warna |
|-------|-------|
| Pemasukan / Naik | Teal |
| Pengeluaran / Turun | Flame |
| Tabungan | Teal + Cream |
| Investasi | Peach |
| Aset | Ink / Cream |
| Utang | Flame-700 |
| Info netral | Ink-muted |

### 2.4 Palet Chart (urutan)
`#00CEC8`, `#FF9C5F`, `#EB4203`, `#00908C`, `#F5C860`, `#6B625C`

### 2.5 Dark Mode (fase 2)
Background `#1A1714`, surface `#26211D`, teks `#FCEFC3`, aksen tetap teal/peach.

## 3. Tipografi
| Peran | Font | Bobot | Penggunaan |
|-------|------|-------|-----------|
| Display / Heading | **Archivo Narrow** | 600–700 | Judul halaman, angka saldo besar, header tabel |
| Subheading / UI | **Comfortaa** | 400–700 | Subjudul, menu navigasi, label tombol, badge |
| Body | **Maitree** | 300–400 | Paragraf, deskripsi, catatan, form helper |
| Angka tabel (opsional) | Archivo Narrow + `font-variant-numeric: tabular-nums` | 500 | Kolom nominal agar rata |

Load via `next/font/google`: `Archivo_Narrow`, `Comfortaa`, `Maitree`.

### Skala Tipografi
| Token | Size / Line height | Font |
|-------|--------------------|------|
| `display` | 40 / 44 | Archivo Narrow 700 |
| `h1` | 32 / 38 | Archivo Narrow 700 |
| `h2` | 24 / 30 | Archivo Narrow 600 |
| `h3` | 20 / 28 | Comfortaa 700 |
| `subtitle` | 18 / 26 | Comfortaa 400 |
| `body` | 16 / 26 | Maitree 400 |
| `small` | 14 / 22 | Maitree 400 |
| `caption` | 12 / 16 | Comfortaa 600 |
| `money-xl` | 36 / 40 | Archivo Narrow 700 tabular |

## 4. Layout & Grid
- Grid 12 kolom desktop (max 1280px), 4 kolom mobile, gutter 16/24px.
- Spacing scale 4px: 4, 8, 12, 16, 24, 32, 48, 64.
- Sidebar 248px (background `--cream`), konten background `--cream-50`.
- Radius: kartu 16px, input/tombol 12px, badge pill 999px.
- Shadow: `0 1px 2px rgba(31,26,23,.06), 0 4px 16px rgba(31,26,23,.06)`.

## 5. Komponen
| Komponen | Spesifikasi |
|----------|-------------|
| **Button Primary** | bg teal, teks ink, Comfortaa 700, hover teal-700 + teks putih |
| **Button Secondary** | border ink, bg transparan |
| **Button Danger** | bg flame, teks putih |
| **Card Saldo** | putih, radius 16, label Comfortaa caption, nominal money-xl |
| **Card Hero (Net Worth)** | gradient `#00CEC8 → #FF9C5F`, teks ink |
| **Badge Tipe** | pill: Pemasukan (teal-50/teal-700), Pengeluaran (flame-50/flame-700), Transfer (cream/ink) |
| **Progress Tabungan** | track cream, fill teal; ≥100% fill peach + ikon 🎉 |
| **Input** | tinggi 44px, border line, focus ring teal 2px |
| **Input Nominal** | prefix "Rp", auto format ribuan, keyboard numeric |
| **Tabel** | header Archivo Narrow uppercase 13px, zebra cream-50, nominal rata kanan |
| **FAB** | 56px, bg flame, ikon plus putih |
| **Toast** | sukses teal, error flame |
| **Empty State** | ilustrasi line-art dua warna (teal + peach) |

## 6. Ikonografi
lucide-react, stroke 1.75, ukuran 20/24. Contoh: Wallet (rekening), Banknote (cash), PiggyBank (tabungan), TrendingUp (investasi), Home (aset), Landmark (bank), Smartphone (e-wallet), CreditCard (kartu kredit), HandCoins (utang).

## 7. Format Data
- Mata uang: `Rp 1.250.000` ; negatif `−Rp 250.000` berwarna flame.
- Singkatan di kartu kecil: `Rp 1,2 jt`, `Rp 3,4 M`.
- Tanggal: `28 Okt 2026`; grup daftar transaksi per hari ("Hari ini", "Kemarin").

## 8. Tone of Voice
Bahasa Indonesia santai-sopan. Contoh: "Pemasukan tersimpan 👍", "Dana Darurat sudah 75%, sedikit lagi!". Hindari jargon; istilah akuntansi hanya di menu Laporan dengan tooltip penjelasan.

## 9. Aksesibilitas
- Kontras teks ≥ 4.5:1.
- Warna tidak jadi satu-satunya penanda (tambahkan ikon ↑/↓ dan tanda +/−).
- Focus visible, target sentuh ≥ 44px, `prefers-reduced-motion` dihormati.

## 10. Design Tokens (Tailwind v4)
```css
@theme {
  --color-teal: #00CEC8;
  --color-teal-700: #00908C;
  --color-teal-50: #E6FAF9;
  --color-cream: #FCEFC3;
  --color-cream-50: #FFFBEF;
  --color-peach: #FF9C5F;
  --color-peach-100: #FFE6D6;
  --color-flame: #EB4203;
  --color-flame-700: #B83302;
  --color-flame-50: #FDECE5;
  --color-ink: #1F1A17;
  --color-ink-muted: #6B625C;
  --color-line: #EADFC4;

  --font-display: var(--font-archivo-narrow), sans-serif;
  --font-ui: var(--font-comfortaa), sans-serif;
  --font-body: var(--font-maitree), serif;

  --radius-card: 16px;
  --radius-control: 12px;
}
```
