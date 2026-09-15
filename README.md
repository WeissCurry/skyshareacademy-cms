# Skyshare Academy - Content Management System (CMS)

Aplikasi Web Content Management System (CMS) resmi untuk mengelola seluruh konten, program, media, artikel, dan analitik website **Skyshare Academy**.

---

## 🚀 Fitur Utama

- **📊 Website Analytics Dashboard**
  - Monitoring metrik performa web (Pageviews, Unique Visitors, Avg CLS, Avg FID).
  - Grafik time-series tren pengunjung harian & mingguan.
  - Statistik provinsi asal pengunjung & top referrer.
  - Export laporan analitik ke format PDF.

- **👥 Manajemen Akun Admin**
  - Pengelolaan data admin dengan kontrol hak akses bertingkat (*Super Admin* vs *Admin*).
  - Tambah, ubah data (*edit*), dan hapus akun admin secara aman.

- **🎓 Talents Academy Management**
  - Kelola file booklet panduan pendaftaran (PDF).
  - Upload dan kelola gambar Alur Pendaftaran & Timeline Program (via file upload atau Media Library).
  - Kelola data Sekolah & Grup binaan (tambah, edit, hapus, dan tinjau anggota grup).
  - Pengaturan link formulir pendaftaran (*CTA Join Program*).

- **💼 Mentor Academy Management**
  - Konfigurasi booklet, gambar alur acara, dan timeline kegiatan mentor.
  - Fitur Highlight Event: toggle status aktif, poster event, dan tautan pendaftaran event.
  - Manajemen Acara & Peserta: penambahan event, pendataan peserta, dan status kehadiran.

- **👨‍👩‍👧 Parents Academy Management**
  - Kelola materi booklet, alur pendaftaran, dan timeline program orang tua.
  - Pengaturan tautan aksi / CTA pendaftaran program.

- **📰 Manajemen Artikel (Articles)**
  - Pembuatan dan pengeditan artikel menggunakan **Rich Text Editor (TinyMCE & React Quill)**.
  - Upload thumbnail artikel, pengaturan kategori, dan status publikasi.
  - Fitur pencarian, filter, dan paginasi artikel.

- **🖼️ Media Library & Mini Window Picker**
  - Repositori aset gambar terpusat yang terintegrasi dengan API/Cloudinary.
  - Fitur salin URL gambar langsung ke clipboard.
  - **MediaLibraryMini**: Mini window collapsible yang terpasang di seluruh form upload gambar, memungkinkan admin memilih gambar dari pustaka media tanpa perlu bolak-balik halaman.

---

## 🛠️ Tech Stack

- **Framework & Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 8](https://vitejs.dev/)
- **Styling:** [Tailwind CSS 3](https://tailwindcss.com/) + `@tailwindcss/typography`
- **Routing:** [React Router DOM v7](https://reactrouter.com/)
- **HTTP Client:** [Axios](https://axios-http.com/) dengan interceptor token otentikasi
- **Rich Text Editor:** `@tinymce/tinymce-react` & `react-quill`
- **Export & Reporting:** `jspdf`, `jspdf-autotable`, `html2canvas`
- **Icons:** `react-icons` (FontAwesome, Feather)
- **Linting & Code Quality:** ESLint 9 + typescript-eslint

---

## 📁 Struktur Direktori

Arsitektur direktori mengadopsi prinsip modular berbasis fitur (*Feature-Sliced Design* terapan):

```text
src/
├── app/                  # Inisialisasi aplikasi, routing, layout utama & route guard
│   ├── layouts/          # CmsLayout (Navbar & Outlet)
│   └── providers/        # CmsPrivateRoute, CmsLoginRoute
├── assets/               # Aset statis global (gambar, ikon maskot, logo)
├── features/             # Modul fungsional independen yang reusable
│   └── media-library/    # Komponen MediaLibraryMini & utilitas media
├── pages/                # Tampilan halaman per domain/menu CMS
│   ├── account-management/ # Kelola Akun, Tambah Admin, Edit Admin
│   ├── article-management/ # Dashboard Artikel, Tambah & Edit Artikel
│   ├── dashboard/          # Dashboard Analitik
│   ├── login/              # Otentikasi Admin
│   ├── media-management/   # Halaman Galeri Media Library
│   ├── mentor-academy/     # Halaman & form kelola Mentor Academy
│   ├── parents-academy/    # Halaman & form kelola Parents Academy
│   └── talents-academy/    # Halaman & form kelola Talents Academy
├── shared/               # Komponen UI umum, API instance, assets, dan utilitas
│   ├── api/              # Konfigurasi skyshareApi (Axios instance)
│   └── ui/               # Modal dialog, loading spinner, editor, buttons
└── widgets/              # Komponen navigasi & structural block (Sidebar, Navbar)
```

---

## 💻 Memulai Proyek

### Prasyarat
- [Node.js](https://nodejs.org/) versi `>= 18`
- Package Manager [pnpm](https://pnpm.io/) (direkomendasikan) atau `npm`

### Langkah Instalasi

1. **Clone repository & masuk ke direktori:**
   ```bash
   git clone <repository-url>
   cd skyshareacademy-cms
   ```

2. **Pasang dependensi:**
   ```bash
   pnpm install
   ```

3. **Jalankan local development server:**
   ```bash
   pnpm run dev
   ```
   Aplikasi akan berjalan secara default di `http://localhost:5173`.

4. **Linting kode:**
   ```bash
   pnpm run lint
   ```

5. **Build untuk produksi:**
   ```bash
   pnpm run build
   ```
   Hasil kompilasi produksi siap di-deploy pada folder `dist/`.

---

## 🌐 Konfigurasi API

Konfigurasi baseURL API diatur pada file [`src/shared/api/skyshareApi.ts`](file:///Users/curry/Documents/IdeateCore/MSIM/skyshareacademy-cms/src/shared/api/skyshareApi.ts).

- **Production API:** `https://api.skyshareacademy.id`
- **Development API:** `http://localhost:3000` (dapat diubah sesuai kebutuhan pengujian backend)

Otentikasi dikelola secara otomatis melalui interceptor Axios dengan menyematkan header `Authorization: Bearer <token>` yang tersimpan di `localStorage`.

---

## 📝 Best Practices & Catatan Pengembangan

1. **Pencegahan Layout Overflow:**
   Pada kontainer konten yang bersandingan dengan `<Sidebar />`, selalu gunakan pola:
   ```tsx
   <div className="content-1 flex gap-4 w-full max-w-[1100px]">
     <div className="shrink-0"><Sidebar /></div>
     <div className="w-full min-w-0">
       {/* Konten halaman & card */}
     </div>
   </div>
   ```
   Kelas `min-w-0` penting untuk mencegah child flexbox (seperti tabel dan form panjang) meluap keluar dari batas viewport layar.

2. **Form State & Hooks:**
   Logika pemanggilan API, upload berkas, dan penanganan state form dipisahkan ke dalam folder `hooks/` di masing-masing modul fitur untuk menjaga komponen UI tetap bersih dan mudah diuji.
