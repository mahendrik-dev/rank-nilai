# ML Rank Leaderboard — Ranking Nilai Siswa

Website leaderboard nilai siswa kelas 9 dengan sistem rank **Mobile Legends** lengkap dengan logo rank buatan sendiri (SVG).

## Cara membuka

Cukup buka `index.html` di browser (double-click). Semua data sudah tertanam di `data.js`, jadi tidak perlu server atau koneksi internet.

Opsional, jalankan server lokal:

```bash
python -m http.server 8123
```

lalu buka `http://localhost:8123/index.html`.

## Sumber & aturan data

- Sumber: `Data Nilai Kelas 9.xlsx`
- Sheet yang dipakai: **9.1 fix** sampai **9.9 fix** (satu-satunya sheet yang memiliki tabel **Total**)
- **Score** = jumlah nilai numerik pada kolom **Total 1 s.d. Total 3** ( Presentasi Mading, Analisa Berita, Poster)
- Nilai bukan angka (misalnya `s`, `a`, `+`, atau kosong) dianggap belum ada nilai dan tidak dihitung
- Skor maksimal tetap **300** = `100 × 3 tugas`, dipakai sebagai patokan **100%**
- Persentase = `score ÷ 300 × 100%`
- Rank ditentukan dari persentase:

| Rank | Rentang |
| --- | --- |
| Mythical Immortal | 98% – 100% |
| Mythical Glory | 95% – 97% |
| Mythical Honor | 90% – 94% |
| Mythic | 85% – 89% |
| Legend | 75% – 84% |
| Epic | 65% – 74% |
| Grandmaster | 50% – 64% |
| Master | 35% – 49% |
| Elite | 15% – 34% |
| Warrior | 0% – 14% |

Fitur detail siswa menampilkan nilai dari **Total 1** (Presentasi Mading), **Total 2** (Analisa Berita), dan **Total 3** (Poster). Kolom Total 4 dan Total 5 tidak digunakan.

## Struktur file

```
ranking-siswa-ml/
├── index.html          # halaman utama
├── styles.css          # styling responsif
├── app.js              # logika ranking, filter, dan modal detail
├── data.js             # data siswa hasil export (282 siswa)
├── assets/
│   ├── logo.svg        # logo website (cadangan)
│   ├── favicon.svg     # favicon (cadangan)
│   ├── mlbb/           # 10 logo rank hasil crop (dipakai website)
│   └── source/         # file Mythical Immortal asli yang diupload user
└── tools/
    ├── export_data.py      # export ulang data dari Excel
    ├── extract_rank_logos.py # potong ulang logo dari atlas + upload
    └── logo-check.html     # halaman cek pemetaan logo
```

Logo rank berasal dari file `new_mlbb_rank_icons_4k_png_...png` (9 ikon pertama)
dan file `mythical-immortal.png` yang diupload terpisah. Urutan sudah dikonfirmasi:
`rank-1` = Warrior sampai `rank-9` = Mythical Glory, `rank-10` = Mythical Immortal.

## Export ulang data

Jika file Excel diperbarui:

```bash
pip install openpyxl
python tools/export_data.py "path/ke/Data Nilai Kelas 9.xlsx"
```

Script akan menimpa `data.js` dengan data terbaru.

## Ringkasan data saat ini

- 282 siswa dari 9 kelas (9.1 – 9.9)
- Skor maksimal: 300 (patokan 100%)
- Skor tertinggi aktual: 282 (ALYA VALERY CELINDA, 9.3) = 94,0% → Mythical Honor
