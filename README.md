# SI-7KAIH AI

Jurnal Aktivitas Murid untuk Gerakan 7 Kebiasaan Anak Indonesia Hebat (7 KAIH) —
enam peran (Murid, Orang Tua, Guru Wali Kelas, Kepala Sekolah, Pengawas Pembina,
Admin Sekolah) dalam satu aplikasi Next.js siap deploy ke Vercel.

- **Database**: Google Drive (satu file JSON per data, di satu folder Drive)
- **AI**: Google Gemini (`gemini-2.5-flash` secara default), lewat SDK resmi `@google/genai`
- **Hosting**: Vercel (App Router, serverless functions)

---

## 1. Yang perlu disiapkan dulu

Anda memerlukan tiga hal sebelum aplikasi ini bisa berjalan:

1. Sebuah **Service Account** Google Cloud (untuk mengakses Google Drive)
2. Sebuah **folder Google Drive** yang dibagikan ke service account itu
3. Sebuah **API key Gemini** (gratis)

### 1.1 Membuat Service Account + mengaktifkan Drive API

1. Buka [Google Cloud Console](https://console.cloud.google.com/) dan buat project baru (atau pakai yang sudah ada).
2. Buka **APIs & Services → Library**, cari **Google Drive API**, klik **Enable**.
3. Buka **APIs & Services → Credentials → Create Credentials → Service Account**.
   - Beri nama bebas, misalnya `si7kaih-storage`.
   - Peran (role) tidak perlu diisi khusus — cukup lewati langkah itu.
4. Setelah service account dibuat, klik service account tadi → tab **Keys** → **Add Key → Create new key → JSON**.
   Sebuah file `.json` akan terunduh — **simpan file ini baik-baik, jangan dibagikan ke siapa pun.**
5. Buka file `.json` itu dengan text editor. Cari nilai `client_email` — bentuknya seperti
   `si7kaih-storage@nama-project.iam.gserviceaccount.com`. Salin alamat ini, akan dipakai di langkah berikut.

### 1.2 Menyiapkan folder Google Drive sebagai "database"

1. Buka [Google Drive](https://drive.google.com), buat folder baru, misalnya `SI-7KAIH-AI Data`.
2. Klik kanan folder itu → **Share** → tempel alamat `client_email` dari langkah 1.1 di atas →
   beri akses **Editor** → kirim.
3. Buka folder itu, salin ID-nya dari URL address bar:
   `https://drive.google.com/drive/folders/`**`ID_FOLDER_ADA_DI_SINI`**

### 1.3 Membuat API key Gemini

1. Buka [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Klik **Create API key**, salin key yang muncul.

---

## 2. Menjalankan di komputer sendiri (opsional, sebelum deploy)

```bash
npm install
cp .env.local.example .env.local
```

Buka `.env.local`, isi tiga baris berikut:

```
GOOGLE_SERVICE_ACCOUNT_KEY='<tempel seluruh isi file .json service account, jadi SATU BARIS>'
GOOGLE_DRIVE_FOLDER_ID=<ID folder Drive dari langkah 1.2>
GEMINI_API_KEY=<API key dari langkah 1.3>
```

> **Tips memasukkan `GOOGLE_SERVICE_ACCOUNT_KEY` sebagai satu baris**: buka file `.json` di editor
> teks apa pun, pilih semua (Ctrl+A), salin, lalu tempel di antara tanda kutip. Selama seluruh isi
> file ada di antara satu pasang kutip, itu sudah benar — Node akan membaca `\n` di dalam
> `private_key` apa adanya.

Lalu jalankan:

```bash
npm run dev
```

Buka `http://localhost:3000`.

---

## 3. Deploy ke Vercel

1. Push folder proyek ini ke sebuah repo GitHub/GitLab/Bitbucket.
2. Buka [vercel.com](https://vercel.com/new), impor repo tersebut.
3. Sebelum menekan **Deploy**, buka bagian **Environment Variables**, tambahkan tiga variabel
   yang sama seperti di `.env.local` di atas:
   - `GOOGLE_SERVICE_ACCOUNT_KEY`
   - `GOOGLE_DRIVE_FOLDER_ID`
   - `GEMINI_API_KEY`
4. Klik **Deploy**. Next.js dikenali otomatis oleh Vercel, tidak perlu konfigurasi tambahan.
5. Setelah selesai, buka domain yang diberikan Vercel — aplikasi langsung bisa dipakai.

Kalau nanti perlu mengganti key atau folder, ubah di **Project Settings → Environment Variables**
di Vercel, lalu **Redeploy**.

---

## 4. Struktur proyek

```
app/
  page.js              halaman utama: login lalu render dashboard sesuai peran
  layout.js, globals.css
  api/
    storage/route.js   GET/POST/DELETE key-value, diteruskan ke Google Drive
    ai/route.js        POST prompt, diteruskan ke Gemini
lib/
  driveStore.js        akses Google Drive (server-only, jangan diimpor dari client)
  gemini.js            akses Gemini (server-only, jangan diimpor dari client)
  clientStorage.js     helper fetch() ke /api/storage, dipakai komponen
  clientAi.js          helper fetch() ke /api/ai, dipakai komponen
  data.js              konstanta domain (HABITS, SCHOOLS, CLASSES, STUDENTS) + fungsi murni
components/
  LoginScreen.js
  MuridView.js / OrtuView.js / GuruView.js / KepsekView.js / PengawasView.js / AdminView.js
  HabitDailyRow.js, CalendarGrid.js, ReflectionPanel.js, ClassTable.js, Charts.js, ui.js
```

Setiap "key" data (jurnal harian, refleksi, catatan wali kelas, program sekolah, dll.) disimpan
sebagai satu file `.json` tersendiri di dalam folder Drive yang sudah disiapkan — bisa dibuka
langsung lewat Google Drive kalau ingin memeriksa data mentahnya.

---

## 5. Data contoh yang sudah tersedia

Dua sekolah, dua kelas, dua belas murid sudah didaftarkan langsung di `lib/data.js` (SCHOOLS,
CLASSES, STUDENTS) supaya aplikasi bisa langsung dicoba. Untuk pemakaian sungguhan:

- Tambah/ubah data sekolah, kelas, dan murid langsung di `lib/data.js`, **atau**
- Gunakan dashboard **Admin Sekolah** di dalam aplikasi untuk menambah siswa/kelas/guru baru
  secara dinamis (tersimpan di Drive, tidak perlu ubah kode).

---

## 6. Yang perlu diperhatikan sebelum dipakai dengan data murid sungguhan

Ini poin paling penting untuk dibaca:

- **Login belum berupa autentikasi sungguhan.** Kolom NISN/Username dan Password di layar login
  saat ini tidak diperiksa ke server mana pun — siapa pun yang membuka aplikasi bisa memilih peran
  dan (untuk Murid/Orang Tua) memilih nama dari dropdown, lalu langsung masuk. Ini cocok untuk uji
  coba internal, tapi **belum aman untuk dipakai dengan data murid sungguhan** tanpa lapisan login
  yang benar. Sebelum itu, pasang salah satu:
  - [NextAuth.js](https://authjs.dev/) dengan Google Workspace/akun sekolah, atau
  - Password per peran yang diperiksa lewat sebuah API route baru, atau
  - Middleware Next.js yang mewajibkan login lebih dulu sebelum halaman utama bisa diakses.
- **Google Drive dipakai sebagai database sederhana**, bukan database sungguhan. Untuk skala
  kecil (satu sekolah/beberapa sekolah binaan) ini cukup — tapi setiap baca/tulis butuh
  request ke Drive API (ada jeda, dan Drive API punya batas kuota harian). Kalau nanti dipakai
  untuk banyak sekolah sekaligus, pertimbangkan pindah ke database sungguhan (Postgres via
  Vercel Postgres/Supabase, misalnya) — struktur `lib/clientStorage.js` dan `/api/storage`
  sengaja dibuat sederhana (get/set/delete/list by key) supaya gampang diganti belakangan tanpa
  menyentuh kode komponen.
- **Model Gemini** diatur lewat env var `GEMINI_MODEL` (default `gemini-2.5-flash`). Google
  kadang mengganti nama model yang tersedia — kalau suatu saat muncul error dari `/api/ai`
  menyebut model tidak ditemukan, cek model yang aktif di https://ai.google.dev/gemini-api/docs/models
  dan perbarui env var itu tanpa perlu mengubah kode.
- **Ekspor PDF/Word** (di dashboard Guru) memakai mekanisme cetak browser dan file `.doc`
  berbasis HTML — cara ringan yang tidak butuh pustaka PDF/Word tambahan, dan bekerja di semua
  browser modern.
