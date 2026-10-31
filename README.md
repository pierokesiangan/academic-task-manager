# Besok Aja.Task — Academic Task Manager
Aplikasi web manajemen perkuliahan dan tugas akademik mahasiswa berkecepatan tinggi dengan antarmuka bergaya **Linear** dan tema visual **"Ice & Butter"** (Deep Navy, Soft Cobalt, Ice Blue, Butter Yellow).

Dibuat khusus untuk kebutuhan perkuliahan Semester 3 Allan: memantau silabus 16 pertemuan, hitung mundur deadline tugas mendesak (*panic prevention*), dan terhubung langsung ke **Google Calendar di ponsel**.

---

## 🌟 Fitur Utama

1. **Executive Academic Dashboard (`/`):**
   * **4 Kartu Metrik Ringkas:** Tugas Aktif, Due Hari Ini, Overdue, dan % Selesai.
   * **Fokus Hari Ini:** Hitung mundur waktu nyata (*Live Countdown Timer*) jam, menit, detik untuk tugas paling mendesak.
   * **Workload Bar Chart:** Visualisasi horizontal peringkat beban tugas per mata kuliah.
   * **Jadwal Kuliah Mingguan:** Menampilkan jadwal kelas Senin–Jumat dengan deteksi otomatis hari aktif.

2. **Manajemen Mata Kuliah & Silabus 16 Minggu (`/courses` & `/courses/[id]`):**
   * Galeri mata kuliah aktif dengan total beban SKS semester 3.
   * **Accordion 16 Pertemuan Perkuliahan (Week 1–16)** dengan penanda otomatis **UTS di Week 8** dan **UAS di Week 16**.
   * Catatan materi dosen dan tautan tugas per minggu kuliah.

3. **Task Engine & Multi-View Hub (`/tasks`):**
   * **Quick Add (< 3 detik):** Buka modal cepat kapan saja dengan menekan tombol keyboard **`C`**.
   * **Multi-View Toggle:** Beralih instan antara **List View** (harian) dan **Kanban Board** (status: *Belum Dikerjakan*, *Sedang Dikerjakan*, *Selesai*).
   * **Task Drawer Detail (Linear-Style):** Panel geser dari sisi kanan layar memuat instruksi Markdown, checklist sub-tugas berprogres bar %, dan link materi (Google Drive/LMS).
   * **Micro-Celebration:** Efek *confetti* lembut saat tugas berhasil diselesaikan.

4. **Sinkronisasi Google Calendar Ponsel (Private iCal Feed):**
   * Endpoint RFC 5545 `.ics` privat di `/api/calendar/feed/[token]`.
   * Seluruh deadline tugas dan jadwal kuliah otomatis tersinkronisasi ke Google Calendar di smartphone lengkap dengan alarm pengingat H-1 dan H-3 jam.

5. **Keamanan Master PIN & PWA Standalone:**
   * Akses terlindungi menggunakan keypad Master PIN (Default awal: **`1234`**, dapat diubah di menu Settings).
   * Dapat di-install (*Add to Home Screen*) di ponsel Android & iPhone layaknya aplikasi native tanpa bar browser.

---

## 🛠️ Tech Stack

* **Framework:** Next.js 15 (App Router, Server Actions, TypeScript)
* **Styling & Icons:** Tailwind CSS, Radix UI Primitives, Lucide Icons, Canvas Confetti
* **ORM & Database:** Prisma ORM v6 + Supabase Cloud PostgreSQL (Active 24/7)
* **Calendar Engine:** `ical-generator` (RFC 5545 Specification)
* **Auth & Security:** Bcryptjs (PIN Hash) + Jose (HTTP-only Session JWT)

---

## 🚀 Cara Menjalankan di Komputer Lokal

1. Buka terminal di folder proyek (`Study`).
2. Jalankan server development:
   ```bash
   npm run dev
   ```
3. Buka browser di [http://localhost:3000](http://localhost:3000).
4. Masukkan Master PIN: **`1234`** untuk membuka dashboard.

---

## 🌐 Panduan Step-by-Step Deploy ke Vercel (Gratis 24/7)

Agar aplikasi ini dapat kamu akses dari smartphone saat berada di kampus kapan saja:

### Langkah 1: Push Kode ke GitHub
1. Buat repository baru di [github.com](https://github.com) (beri nama misal: `academic-task-manager`, pilih **Private**).
2. Di terminal komputermu, jalankan:
   ```bash
   git init
   git add .
   git commit -m "feat: complete academic task manager with Ice & Butter theme"
   git branch -M main
   git remote add origin https://github.com/USERNAME_KAMU/academic-task-manager.git
   git push -u origin main
   ```

### Langkah 2: Import ke Vercel
1. Buka [vercel.com](https://vercel.com) dan login menggunakan akun GitHub.
2. Klik **"Add New"** → **"Project"**.
3. Pilih repository `academic-task-manager` yang baru saja kamu push, lalu klik **"Import"**.

### Langkah 3: Tambahkan Environment Variables di Vercel
Sebelum menekan tombol Deploy, buka bagian **"Environment Variables"** dan masukkan:

| Key | Value (Sesuai file `.env` kamu) |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.abiqugfqnkoemydkkhnc:academic-task-manager@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://postgres.abiqugfqnkoemydkkhnc:academic-task-manager@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres` |
| `SESSION_SECRET` | `academic-task-manager-ice-and-butter-secret-2026` |

### Langkah 4: Klik "Deploy"
1. Klik tombol **"Deploy"** dan tunggu sekitar 1–2 menit.
2. Selesai! Web app milikmu kini live 24/7 di domain Vercel (contoh: `https://academic-allan.vercel.app`).

---

## 📱 Cara Install PWA di Layar Utama Ponsel

1. Buka URL Vercel-mu di browser ponsel (Chrome di Android atau Safari di iPhone).
2. **Android:** Klik menu titik tiga di kanan atas → Pilih **"Add to Home screen"** (Tambahkan ke Layar Utama) / **"Install App"**.
3. **iPhone:** Klik tombol Share di tengah bawah Safari → Pilih **"Add to Home Screen"** (Tambah ke Layar Utama).
4. Aplikasi akan muncul dengan icon resmi "Ice & Butter" dan dapat dibuka layar penuh (*fullscreen*) tanpa address bar browser!
