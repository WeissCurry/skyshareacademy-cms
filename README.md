# Skyshare Academy - Content Management System (CMS)

Aplikasi Web Content Management System (CMS) resmi untuk mengelola seluruh konten platform Company Profile, operasional program edukasi, verifikasi identitas mentor, serta pemantauan analitik **Skyshare Academy**.

---

## 1. Deskripsi Aplikasi & Hak Akses Pengguna

Aplikasi CMS ini dirancang khusus untuk tim internal administrator Skyshare Academy guna mengelola platform edukasi terpadu. Arsitektur sistem membagi hak akses ke dalam beberapa peran (*roles*):

- **Admin (melalui CMS):** Pengelola platform internal dengan otentikasi email dan kata sandi. Mengelola seluruh konten modul Company Profile, konfigurasi program kelas, materi, tugas, antrean verifikasi KYC & pembayaran manual QRIS, siaran absensi OTP, evaluasi kelulusan level, moderasi artikel kontributor, serta penyesuaian saldo poin insentif mentor.
- **Mentor (melalui Portal):** Calon maupun mentor aktif yang mendaftar atau terdaftar dalam program MAN (*Mentor Academy Network*) atau *TeachMe Series*. Memiliki akses ke materi kelas, penugasan, absensi sesi langsung, penulisan artikel kontributor, dan rekapitulasi evaluasi.
- **Talent (melalui Portal):** Siswa atau peserta program pembinaan *Talents Academy* untuk pengembangan bakat dan kompetensi siswa.
- **Parent (melalui Portal):** Orang tua atau wali peserta yang mengikuti modul pendampingan dan kelas edukasi *Parents Academy*.
- **Visitor / Verified Visitor:** Pengguna publik yang masuk ke portal menggunakan akun Google (*Google Sign-In*). Sebelum permohonan verifikasi identitas (KYC) disetujui oleh admin melalui CMS, pengguna berstatus *Visitor* dan memiliki batasan akses ke fitur internal mentor.

---

## 2. Tech Stack & Versi

Daftar pustaka dan perangkat lunak utama yang digunakan pada proyek CMS berdasarkan `package.json`:

- **Framework & Runtime UI:** [React 19](https://react.dev/) (`^19.2.4`) + [React DOM](https://react.dev/) (`^19.2.4`)
- **Bahasa Pemrograman:** [TypeScript](https://www.typescriptlang.org/) (`~6.0.2`)
- **Build Tool & Dev Server:** [Vite 8](https://vitejs.dev/) (`^8.0.4`)
- **Styling & Desain Antarmuka:** [Tailwind CSS 3](https://tailwindcss.com/) (`^3.4.19`) + Plugin `@tailwindcss/typography` (`^0.5.19`)
- **Routing:** [React Router DOM v7](https://reactrouter.com/) (`^7.14.1`)
- **HTTP Client:** [Axios](https://axios-http.com/) (`^1.15.0`) dengan *request/response interceptors*
- **Rich Text Editor:** `@tinymce/tinymce-react` (`^6.3.0`) & `react-quill` (`^2.0.0`)
- **Export & Pelaporan:** `jspdf` (`^4.2.1`), `jspdf-autotable` (`^5.0.8`), `html2canvas` (`^1.4.1`)
- **Ikon Antarmuka:** `react-icons` (`^5.6.0`) (Feather Icons, FontAwesome)
- **Animasi:** `framer-motion` (`^13.4.4`)
- **Code Linter & Quality:** ESLint 9 (`^9.39.4`) + `typescript-eslint` (`^8.58.0`)

---

## 3. Prasyarat Sistem

Sebelum menjalankan aplikasi di lingkungan lokal atau server pengembangan, pastikan perangkat telah memenuhi prasyarat berikut:

- **Node.js:** Versi `>= 18.0.0` (direkomendasikan Node.js LTS `v20.x` atau `v22.x`)
- **Package Manager:** `pnpm` versi `8.x` atau `9.x` (diinstal via `npm install -g pnpm` atau `corepack enable`)

---

## 4. Langkah Setup & Environment Variables

### Langkah Pemasangan:

1. Masuk ke direktori proyek CMS:
   ```bash
   cd skyshareacademy-cms
   ```

2. Salin berkas konfigurasi lingkungan dari template `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

3. Pasang seluruh dependensi proyek:
   ```bash
   pnpm install
   ```

### Tabel Environment Variables:

| Nama Variabel | Wajib | Contoh Nilai | Deskripsi |
|---|:---:|---|---|
| `VITE_API_BASE_URL` | Ya (Lokal) | `http://localhost:3002` | Alamat basis URL API server backend. Jika tidak diset, sistem secara default mengarah ke `https://api.skyshareacademy.id`. |
| `VITE_USE_FIXTURES` | Tidak | `false` | Menentukan apakah CMS berjalan menggunakan data mock statis lokal (`fixtures.ts`). Wajib bernilai `false` untuk pengujian integrasi riil dan *build* produksi. |

> **Perhatian:** Jangan pernah menyimpan kredensial produksi, kunci rahasia, atau URL basis data produksi ke dalam berkas environment lokal.

---

## 5. Menjalankan Aplikasi Secara Lokal

Jalankan perintah berikut untuk memulai *development server*:

```bash
pnpm run dev
```

Aplikasi CMS akan aktif secara default pada alamat:
```text
http://localhost:5173
```
*(atau port berikutnya seperti `http://localhost:5174` jika port 5173 sedang digunakan oleh proses lain).*

Pastikan server backend (`skyshareacademy-server`) telah berjalan secara lokal pada port `3002` agar komunikasi data berjalan lancar.

---

## 6. Daftar Perintah Script

| Perintah | Deskripsi |
|---|---|
| `pnpm run dev` | Menjalankan Vite development server dengan fitur Hot Module Replacement (HMR). |
| `pnpm run build` | Menjalankan pengecekan tipe statis TypeScript (`tsc -b`) dan mengompilasi bundel produksi ke folder `dist/`. |
| `pnpm run lint` | Menjalankan pemeriksaan kepatuhan kode dan aturan React Hooks dengan ESLint 9. |
| `pnpm run preview` | Menjalankan server lokal ringan untuk meninjau hasil kompilasi produksi dari folder `dist/`. |

---

## 7. Struktur Direktori Proyek

Proyek ini mengadopsi arsitektur berbasis fitur yang modular (*Pages - Features - Shared*):

```text
src/
├── app/                      # Inisialisasi utama aplikasi
│   ├── App.tsx               # Routing tabel aplikasi React Router DOM v7
│   ├── layouts/              # CmsLayout (Pembungkus Navbar dan Area Kerja)
│   └── providers/            # CmsPrivateRoute, CmsLoginRoute (Route Guards)
├── features/                 # Modul bisnis independen yang dapat digunakan ulang
│   ├── media-library/        # Komponen picker aset gambar Cloudinary (MediaLibraryMini)
│   └── mentor-access/        # Logika akses mentor (API adapter, tipe data TypeScript, fixtures)
├── pages/                    # Tampilan halaman antarmuka CMS
│   ├── account-management/   # Kelola Akun Admin, Tambah & Edit Akun
│   ├── article-management/   # Dashboard Artikel, Form Tambah & Edit Artikel
│   ├── dashboard/            # Dashboard Analitik Web & Metrik Kunjungan
│   ├── event-management/     # Manajemen Event Publik & Cohort Program
│   ├── login/                # Form Otentikasi Masuk Admin
│   ├── media-management/     # Galeri Pustaka Media Terpusat
│   ├── mentor-academy/       # Pengaturan Konten Landing Page Mentor Academy
│   ├── mentor-access/        # Fitur Operasional Portal Mentor:
│   │   ├── CmsReviewQueuePage.tsx        # Antrean Review KYC & Mutasi QRIS
│   │   ├── CmsProgramManagement.tsx      # Manajemen Program & Kurikulum
│   │   ├── CmsMaterialsManagement.tsx    # Manajemen Materi & File Modul
│   │   ├── CmsAssignmentsManagement.tsx  # Manajemen Tugas & Penilaian Mahasiswa
│   │   ├── CmsAttendanceOtpPage.tsx      # Siaran Absensi OTP Real-time
│   │   ├── CmsAssessmentsPage.tsx        # Evaluasi Kelulusan / Level Assessment
│   │   ├── CmsContributorsPage.tsx       # Pengaturan Mentor Kontributor
│   │   ├── CmsArticleReviewQueuePage.tsx # Antrean Moderasi Artikel Kontributor
│   │   ├── CmsQrisSettingsPage.tsx       # Pengaturan Master Gambar QRIS
│   │   └── CmsAccessAuditLogsPage.tsx    # Riwayat Log Audit Akses & Aksi Admin
│   ├── parents-academy/      # Pengaturan Konten Landing Page Parents Academy
│   ├── popup/                # Pengaturan Modal Pop-up Banner Promosi
│   └── talents-academy/      # Pengaturan Konten Landing Page Talents Academy
├── shared/                   # Modul utilitas, komponen dasar UI, dan API client
│   ├── api/                  # Konfigurasi Axios client instance (skyshareApi.ts)
│   ├── context/              # Context otentikasi admin (AdminContext.tsx)
│   ├── hooks/                # Custom React hooks (useModalA11y, useAcademyForm)
│   ├── ui/                   # Komponen primitif UI (Button, ConfirmModal, Skeleton, UserRoleBadge)
│   └── utils/                # Fungsi pembantu (konversi gambar WebP, URL sanitizer, logger)
└── widgets/                  # Komponen navigasi struktural (Sidebar.tsx, Navbar.tsx)
```

---

## 8. Fitur Utama & Alur Operasional

### 1. Antrean Verifikasi Terpadu (KYC & Pembayaran QRIS)
Calon mentor yang mendaftar program di portal mengunggah kartu identitas legal (KTP), data rekening bank, serta bukti transfer QRIS manual. Admin memvalidasi berkas melalui menu **Antrian Review** (`/cms/review-queue`). Tinjauan dapat dilakukan secara individual per dokumen atau secara terpadu (*unified action*), dengan pencatatan alasan penolakan jika berkas tidak sesuai.

### 2. Klasifikasi Program & Kurikulum
Pengelolaan kategori program mencakup:
- **MAN (*Mentor Academy Network*):** Memiliki tingkatan level berjenjang (`BASIC`, `INTERMEDIATE`, `ADVANCE`).
- **TeachMe Series:** Program tematik berbayar atau pendaftaran gratis (*free self-enrollment*).
- **Parents Academy:** Program pendampingan khusus orang tua peserta.
Admin dapat mengelola daftar silabus, file materi pembelajaran (PDF/dokumen), serta instrumen tugas untuk masing-masing program.

### 3. Presensi Digital Sesi Kelas (OTP Real-Time)
Pada menu **Absensi Sesi & OTP** (`/cms/attendance`), admin mengaktifkan kehadiran untuk sesi kelas tertentu. Sistem memproyeksikan kode 6 digit OTP berbasis algoritma TOTP yang berotasi otomatis setiap 180 detik. Pemantauan daftar hadir mahasiswa berjalan secara langsung (*live polling*), dengan mekanisme jeda otomatis saat tab browser tidak aktif untuk menghemat beban jaringan.

### 4. Evaluasi & Kenaikan Level Peserta (*Assessments*)
Admin meninjau rekapitulasi performa belajar peserta cohort pada menu **Evaluasi Kelulusan** (`/cms/assessments`). Sistem menyajikan persentase kehadiran sesi langsung (*live sessions*), jumlah tugas yang diselesaikan, dan rata-rata nilai tugas. Admin memberikan keputusan kelulusan (`PASSED` / `FAILED`) yang disertai catatan evaluasi resmi.

### 5. Pengelolaan Kontributor & Saldo Poin Mentor
Admin dapat mengaktifkan hak kontributor bagi mentor yang telah terverifikasi (`/cms/contributors`). Naskah artikel yang diajukan oleh mentor ditinjau melalui **Review Artikel Kontributor** (`/cms/article-review-queue`). Admin juga dapat melakukan penyesuaian (*adjustment*) saldo poin penghargaan mentor secara transparan.

### 6. Pengaturan Master Pembayaran QRIS
Pengelolaan gambar kode QRIS statis (`/cms/qris-settings`) yang digunakan sebagai acuan pembayaran manual bagi calon peserta yang melakukan pendaftaran program berbayar.

---

## 9. Keamanan & Proteksi Data

- **Penyimpanan Berkas Privat & Signed URL:** Dokumen foto KTP dan bukti pembayaran transfer tersimpan di direktori privat server (`storage/private/`) dan hanya dapat diakses melalui URL sementara yang ditandatangani secara kriptografis (*HMAC-signed URL*) dengan batas waktu kedaluwarsa.
- **Otentikasi Kredensial Admin:** Otentikasi CMS sepenuhnya menggunakan kredensial email dan kata sandi admin melalui endpoint `POST /admin/login`. Token JWT disimpan di `localStorage` dan disematkan secara otomatis pada setiap permintaan HTTP melalui *interceptor* Axios. CMS tidak menggunakan Google Sign-In.
- **Single-Flight 401 Interceptor:** Interceptor mendeteksi respon status `401 Unauthorized` akibat token yang kedaluwarsa, membersihkan sesi secara atomik, dan mengarahkan pengguna kembali ke halaman masuk (`/cms?expired=1`) tanpa menimbulkan pengulangan *redirect storm*.
- **Audit Log Akses:** Seluruh tindakan penting—seperti persetujuan KYC, konfirmasi transaksi pembayaran, penolakan berkas, penilaian evaluasi, dan penyesuaian poin—dicatat secara permanen pada log audit akses (`/cms/audit-logs`) lengkap dengan identitas admin, alamat IP, waktu, dan rincian alasan perubahan.

---

## 10. Panduan Deployment

### Tahapan Build Produksi:

1. Pastikan variabel environment pada server deployment telah terkonfigurasi dengan benar:
   ```env
   VITE_API_BASE_URL=https://api-dev.skyshareacademy.id
   VITE_USE_FIXTURES=false
   ```
2. Jalankan kompilasi aplikasi:
   ```bash
   pnpm run build
   ```
3. Berkas statis siap disajikan dari direktori:
   ```text
   dist/
   ```

### Konfigurasi Web Server (Nginx):

Karena aplikasi ini merupakan *Single Page Application* (SPA) dengan rute berbasis klien, web server harus dikonfigurasikan agar selalu mengarahkan permintaan berkas yang tidak ditemukan ke `index.html`:

```nginx
location /cms {
    alias /var/www/skyshareacademy-cms/dist;
    try_files $uri $uri/ /cms/index.html;
    index index.html;
}
```

Pastikan domain frontend CMS terdaftar di dalam konfigurasi CORS pada backend server (`skyshareacademy-server/src/app.js`).

---

## 11. Troubleshooting Kendala Umum

1. **`EADDRINUSE 3002` pada Server Backend:**
   Kendala ini muncul ketika port `3002` telah digunakan oleh instance server lain yang masih aktif.
   - Solusi: Temukan PID proses yang menggunakan port tersebut dengan perintah `lsof -i :3002`, kemudian hentikan proses dengan `kill -9 <PID>`.

2. **Galat `"500_FAILED"` atau `"Network Error"` Saat Masuk CMS:**
   Terjadi ketika aplikasi CMS tidak dapat menghubungi server backend.
   - Solusi: Pastikan backend server dalam kondisi menyala (`node index.js` atau proses `pm2`) dan alamat pada variabel `VITE_API_BASE_URL` mengarah ke host dan port backend yang tepat.

3. **CMS Mengakses API Produksi Saat Pengujian Lokal:**
   Terjadi apabila berkas konfigurasi `.env.local` belum dibuat, sehingga Axios secara otomatis menggunakan nilai fallback default (`https://api.skyshareacademy.id`).
   - Solusi: Buat berkas `.env.local` dan tentukan variabel `VITE_API_BASE_URL=http://localhost:3002`.

4. **Validasi Joi Menolak Domain Email `.test`:**
   Skema validasi backend menggunakan standar TLD resmi yang menolak akhiran domain fiktif `.test`.
   - Solusi: Gunakan format email standar untuk pengujian data, seperti `mentor@example.com` atau `admin@skyshareacademy.id`.

5. **Origin Google Identity Services (GIS):**
   Layanan Google OAuth hanya digunakan pada client portal peserta (`skyshareacademy-portal`). Pastikan origin JavaScript seperti `http://localhost:5173` atau `http://localhost:5175` telah ditambahkan pada Google Cloud Console OAuth Client jika melakukan pengujian alur Google Sign-In pada portal. CMS tidak memerlukan konfigurasi Google OAuth.
