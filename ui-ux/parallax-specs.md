# Spesifikasi Interaksi 3D Parallax Devfy

Sistem interaktivitas 3D Parallax pada Devfy dirancang untuk memberikan kedalaman visual spasial tanpa mengorbankan performa komputasi atau kenyamanan aksesibilitas.

## 1. Arsitektur Komponen Parallax

Komponen parallax diimplementasikan pada direktori `frontend/src/components/parallax/`:
- `ParallaxContainer`: Wrapper penangkap event koordinat mouse atau orientasi sensor perangkat.
- `ParallaxLayer`: Lapisan elemen dengan faktor kedalaman (depth multiplier) yang berbeda.
- `TiltCard`: Komponen kartu 3D dengan respons rotasi dinamis (`rotateX`, `rotateY`) dan lapisan pantulan cahaya (glare overlay).
- `ParallaxBackdrop`: Latar belakang ambient orbs dengan filter blur tinggi yang mengambang lembut.

## 2. Parameter Fisika dan Koordinat

### Normalisasi Posisi Pointer
Koordinat kursor dinormalisasi terhadap titik tengah viewport:
- Rentang sumbu X ($N_x$): Dari `-1.0` (ujung kiri) hingga `+1.0` (ujung kanan).
- Rentang sumbu Y ($N_y$): Dari `-1.0` (ujung atas) hingga `+1.0` (ujung bawah).

### Perhitungan Rotasi Kartu 3D (Tilt Effect)
Rotasi pada kartu dihitung dengan rumus:
$$\text{rotateX} = -N_y \times \text{maxAngle}$$
$$\text{rotateY} = N_x \times \text{maxAngle}$$

Di mana:
- `maxAngle` default adalah `8°` hingga `12°` untuk pergerakan halus yang tidak mengganggu keterbacaan teks.
- Efek transisi diperhalus menggunakan easing cubic bezier (`cubic-bezier(0.2, 0.7, 0.2, 1)`).

### Lapisan Ambient Orbs
Dua bola cahaya besar ditempatkan pada background dengan properti CSS:
1. **Orb Primer (Coral)**:
   - Posisi: Top-left (`top: -8%`, `left: 12%`)
   - Dimensi: `620px` x `620px`
   - Gradient: Radial gradient `rgba(255, 107, 107, 0.24)` ke transparan
   - Filter: `blur(85px)`
2. **Orb Sekunder (Indigo Navy)**:
   - Posisi: Center-right (`top: 40%`, `right: -6%`)
   - Dimensi: `720px` x `720px`
   - Gradient: Radial gradient `rgba(78, 101, 255, 0.22)` ke transparan
   - Filter: `blur(95px)`

## 3. Aksesibilitas dan Performa

1. **Hardware Acceleration**: Menggunakan CSS `transform: translate3d()` dan `will-change: transform` untuk memastikan rendering diproses langsung oleh GPU (60+ FPS).
2. **Sensor Adaptif**: Pada perangkat seluler layar sentuh, sistem mendeteksi input `DeviceOrientationEvent` (gyroscope) dengan graceful fallback statis jika izin sensor dinonaktifkan.
3. **Prefers Reduced Motion**: Sistem mendeteksi preferensi pengguna `(prefers-reduced-motion: reduce)`. Jika aktif, seluruh translasi gerak, tilt, dan animasi rotasi otomatis dinonaktifkan (`transform: none`).
