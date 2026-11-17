# Devfy Design System

Dokumen ini mendefinisikan pedoman identitas visual, spesifikasi token warna, komponen antarmuka, dan tipografi untuk platform Devfy.

## 1. Filosofi Desain

Devfy mengusung estetika **Modern Dark Cybernetic & Clean Developer Workspace**. Tampilan visual memadukan kedalaman kanvas gelap malam dengan aksen koral yang bersemangat, memberikan kesan profesional, futuristik, dan fokus bagi para pengembang perangkat lunak.

## 2. Palet Warna Utama

### Kanvas dan Permukaan (Surfaces)
- **Deep Midnight Navy (Canvas Utama)**: `#0A0F29` (`rgb(10, 15, 41)`)
  - Digunakan sebagai warna latar belakang utama di seluruh halaman aplikasi.
- **Deep Navy Surface (Kartu & Panel)**: `#10173D`
  - Digunakan untuk latar belakang container kartu proyek, modal, dan formulir.
- **Navy Elevated Surface (Input & Sidebar)**: `#151E4B`
  - Digunakan pada elemen interaktif bertingkat seperti input text, dropdown select, dan panel sidebar navigasi.
- **Navy Raised Border & Hover**: `#1C2762`
  - Digunakan pada status hover kartu dan panel sorotan.

### Aksen dan Brand
- **Vibrant Coral (Brand Accent Utama)**: `#FF6B6B` (`rgb(255, 107, 107)`)
  - Digunakan pada tombol aksi primer (Call to Action), badge teknologi aktif, dan highlight tipografi.
- **Coral Light Hover**: `#FF8585`
  - Digunakan untuk status hover tombol primer.
- **Coral Subtle Glow**: `rgba(255, 107, 107, 0.14)`
  - Digunakan untuk latar belakang lembut tombol sekunder dan badge skill.
- **Coral Border Outline**: `rgba(255, 107, 107, 0.18)`
  - Digunakan untuk garis batas kartu dan input form dengan aksen tipis elegan.

### Tipografi dan Teks
- **Crisp Off-White (Teks Utama & Heading)**: `#F7F8FD`
  - Menghasilkan tingkat keterbacaan tinggi di atas latar belakang gelap (rasio kontras > 12:1).
- **Lavender Slate (Teks Sekunder & Muted)**: `#9AA5CE`
  - Digunakan pada label formulir, keterangan tanggal, dan teks deskripsi pendukung.

### Status Indikator
- **Published / Success**: `#4ADE80` (Emerald Green) dengan background `rgba(74, 222, 128, 0.12)`.
- **Draft / Inactive**: `#FACC15` (Amber Yellow) dengan background `rgba(250, 204, 21, 0.12)`.
- **Delete / Danger / Error**: `#FCA5A5` (Soft Red) dengan background `rgba(239, 68, 68, 0.12)`.

## 3. Komponen Antarmuka Kunci

### Tombol Primer (Primary Button)
- Background: `#FF6B6B`
- Teks: `#0A0F29` (Deep Navy tebal untuk kontras maksimal)
- Border Radius: `8px` hingga `10px`
- Hover: Background `#FF8585` dengan bayangan `box-shadow: 0 8px 25px rgba(255, 107, 107, 0.35)`

### Tombol Sekunder (Secondary Button)
- Background: `rgba(255, 107, 107, 0.08)`
- Teks: `#F7F8FD`
- Border: `1px solid rgba(255, 107, 107, 0.22)`
- Hover: Border `#FF6B6B`, Teks `#FF6B6B`, Background `rgba(255, 107, 107, 0.16)`

### Form Controls (Input & Textarea)
- Background: `#151E4B`
- Teks: `#F7F8FD`
- Border: `1px solid rgba(255, 107, 107, 0.22)`
- Focus Ring: `0 0 0 3px rgba(255, 107, 107, 0.25)` dengan border color `#FF6B6B`
