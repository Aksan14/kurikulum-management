# Panduan Membuat Template RPS dengan Placeholder

## Format Placeholder

Template menggunakan format placeholder `{{NAMA_VARIABEL}}` untuk data tunggal dan `{{#array}}...{{/array}}` untuk loop/pengulangan.

## Daftar Placeholder yang Tersedia

### 1. Informasi Dasar
| Placeholder | Deskripsi |
|-------------|-----------|
| `{{PERGURUAN_TINGGI}}` | Nama perguruan tinggi |
| `{{FAKULTAS}}` | Nama fakultas |
| `{{PROGRAM_STUDI}}` | Nama program studi |
| `{{NAMA_MK}}` | Nama mata kuliah |
| `{{KODE_MK}}` | Kode mata kuliah |
| `{{RUMPUN_MK}}` | Rumpun mata kuliah |
| `{{SKS_TEORI}}` | Jumlah SKS teori |
| `{{SKS_PRAKTIKUM}}` | Jumlah SKS praktikum |
| `{{SEMESTER}}` | Semester (contoh: "Ganjil 2024/2025") |
| `{{TGL_PENYUSUNAN}}` | Tanggal penyusunan RPS |

### 2. Informasi Penyusun
| Placeholder | Deskripsi |
|-------------|-----------|
| `{{PENYUSUN_NAMA}}` | Nama penyusun RPS |
| `{{PENYUSUN_NIDN}}` | NIDN penyusun |
| `{{KOORDINATOR_NAMA}}` | Nama koordinator RMK |
| `{{KOORDINATOR_NIDN}}` | NIDN koordinator |
| `{{KAPRODI_NAMA}}` | Nama ketua prodi |
| `{{KAPRODI_NIDN}}` | NIDN ketua prodi |

### 3. Deskripsi Mata Kuliah
| Placeholder | Deskripsi |
|-------------|-----------|
| `{{DESKRIPSI_MK}}` | Deskripsi mata kuliah |
| `{{CAPAIAN_PEMBELAJARAN}}` | Capaian pembelajaran umum |
| `{{DOSEN_NAMA}}` | Nama dosen pengampu |
| `{{MK_PRASYARAT}}` | Mata kuliah prasyarat |
| `{{METODE_PEMBELAJARAN}}` | Daftar metode pembelajaran |
| `{{MEDIA_PEMBELAJARAN}}` | Daftar media pembelajaran |

### 4. CPL (Capaian Pembelajaran Lulusan) - Loop
```
{{#cpl_list}}
  {{kode}} - {{deskripsi}}
{{/cpl_list}}
```

### 5. CPMK (Capaian Pembelajaran Mata Kuliah) - Loop
```
{{#cpmk_list}}
  {{kode}} - {{deskripsi}} (CPL: {{cpl_codes}})
{{/cpmk_list}}
```

### 6. Sub-CPMK - Loop
```
{{#sub_cpmk_list}}
  {{kode}} - {{deskripsi}} (CPMK: {{cpmk_kode}})
{{/sub_cpmk_list}}
```

### 7. Topik/Bahan Kajian - Loop
```
{{#topik_list}}
  {{nomor}}. {{topik}}
{{/topik_list}}
```

### 8. Referensi/Pustaka - Loop
```
{{#referensi_list}}
  {{nomor}}. {{referensi}} {{#is_wajib}}(Wajib){{/is_wajib}}
{{/referensi_list}}
```

### 9. Rencana Pembelajaran - Loop (untuk tabel)
```
{{#rencana_pembelajaran}}
| {{minggu}} | {{sub_cpmk}} | {{indikator}} | {{topik_materi}} | {{metode_pembelajaran}} | {{waktu}} | {{teknik_kriteria}} | {{bobot}}% |
{{/rencana_pembelajaran}}
```

### 10. Rencana Tugas - Loop
```
{{#rencana_tugas}}
Tugas {{nomor}}: {{judul}}
- Sub-CPMK: {{sub_cpmk}}
- Indikator: {{indikator}}
- Batas Waktu: {{batas_waktu}}
- Petunjuk: {{petunjuk}}
- Luaran: {{luaran}}
- Kriteria: {{kriteria}}
- Teknik Penilaian: {{teknik_penilaian}}
- Bobot: {{bobot}}%
- Rujukan: {{daftar_rujukan}}
{{/rencana_tugas}}
```

## Contoh Penggunaan di Template Word

### Bagian Header Dokumen:
```
RENCANA PEMBELAJARAN SEMESTER
{{PERGURUAN_TINGGI}}
{{FAKULTAS}}
{{PROGRAM_STUDI}}

MATA KULIAH: {{NAMA_MK}}
```

### Bagian Tabel Informasi:
```
| NAMA MATA KULIAH | {{NAMA_MK}} |
| KODE MK | {{KODE_MK}} |
| RUMPUN MK | {{RUMPUN_MK}} |
| BOBOT (SKS) | T={{SKS_TEORI}} P={{SKS_PRAKTIKUM}} |
| SEMESTER | {{SEMESTER}} |
| TGL PENYUSUNAN | {{TGL_PENYUSUNAN}} |
```

### Bagian CPL:
```
CAPAIAN PEMBELAJARAN LULUSAN YANG DIBEBANKAN PADA MK (CPL)
{{#cpl_list}}
{{kode}}: {{deskripsi}}
{{/cpl_list}}
```

### Bagian CPMK:
```
CAPAIAN PEMBELAJARAN MATA KULIAH (CPMK)
{{#cpmk_list}}
{{kode}}: {{deskripsi}}
(Mendukung CPL: {{cpl_codes}})
{{/cpmk_list}}
```

## Tips Membuat Template

1. **Gunakan Microsoft Word** untuk membuat template
2. **Placeholder harus dalam satu text run** - jangan format sebagian placeholder (misal: **{{NAMA**_MK}})
3. **Untuk tabel dengan loop**, letakkan placeholder di dalam baris tabel
4. **Test template** dengan data sample sebelum digunakan

## Langkah-langkah:

1. Buka template DOCX yang ada
2. Ganti teks statis dengan placeholder sesuai daftar di atas
3. Simpan sebagai file baru (contoh: `Template_RPS_Placeholder.docx`)
4. Upload ke folder `public/templates/`
