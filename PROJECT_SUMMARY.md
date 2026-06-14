# 🌸 Rangkuman Project Edelweys — Update Terbaru (v2)

## Identitas Project
- **Nama:** Edelweys — Health Companion
- **Tagline:** *"Temen sehat kamu yang selalu ada!"*
- **Tipe:** Website + AI Chatbot (Real Project, akan di-deploy)

---

## Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React.js 19 + Vite 8 |
| Backend | Python + FastAPI |
| Database | Supabase (PostgreSQL) |
| AI | xiaomimimo API (Anthropic-compatible, model: mimo-v2.5-pro) |
| Deploy | Vercel (frontend) + Railway/Render (backend) |

---

## Konfigurasi xiaomimimo
- **Base URL:** `https://api.xiaomimimo.com/anthropic`
- **Format header:** `api-key: YOUR_MIMO_KEY`
- **Model:** `mimo-v2.5-pro`
- Di backend pakai library `anthropic` Python dengan `base_url` di-override ke xiaomimimo

---

## Struktur Folder Frontend
```
edelweys/
├── src/
│   ├── components/
│   ├── pages/
│   │   ├── Landing.jsx     ✅ selesai (playful design)
│   │   ├── Login.jsx       ✅ selesai (playful design)
│   │   ├── Register.jsx    ✅ selesai (playful design)
│   │   ├── Chat.jsx        ✅ selesai (dengan sidebar)
│   │   └── Dashboard.jsx   ✅ selesai
│   ├── services/
│   │   └── supabase.js     ✅ sudah ada
│   ├── hooks/
│   ├── context/
│   ├── App.jsx             ✅ routing sudah terhubung
│   └── main.jsx
├── .env                    ✅ VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
└── .gitignore              ✅ sudah lengkap
```

---

## Struktur Folder Backend
```
edelweys-backend/
├── main.py                 ✅ selesai
├── routers/
│   ├── __init__.py         ✅ selesai
│   ├── chat.py             ✅ selesai (xiaomimimo API)
│   ├── auth.py             ✅ selesai (Supabase Auth)
│   └── health.py           ✅ selesai
├── .env.example            ✅ template untuk backend
├── venv/                   ✅ virtual environment
└── .env                    ✅ semua key sudah diisi
```

---

## Database Supabase (sudah dibuat)
3 tabel dengan RLS enabled:
- `profiles` — data profil user (id, username, full_name, age, gender)
- `health_logs` — log kesehatan harian (weight, height, bmi, blood_pressure, coffee_cups, exercise_minutes, water_glasses, sleep_hours, date)
- `chat_history` — riwayat chat (user_id, role, message)

> ⚠️ Kolom `date` di `health_logs` harus punya **unique constraint** `(user_id, date)` supaya upsert bisa jalan. Kalau belum ada, jalanin query ini di Supabase SQL editor:
> ```sql
> ALTER TABLE health_logs ADD CONSTRAINT health_logs_user_date_unique UNIQUE (user_id, date);
> ```

---

## Kepribadian Edelweys (System Prompt)
- Sapa dengan **"heyy yoww"** di awal percakapan
- Bahasa santai, gaul, informatif soal kesehatan
- Kalau kasus rumit: *"wah kalo itu terlalu rumit buat edelweys tanganin nich, better kamu konsul di halodoc ataupun ke rumah sakit terdekat dari rumah kamu yaw 🏥"*
- Topik: nutrisi, olahraga, tidur, kesehatan mental, BMI, tekanan darah, dll

---

## Progress Saat Ini

### ✅ Sudah Selesai
- [x] Setup React.js + struktur folder + routing
- [x] Setup Supabase (tabel + RLS + koneksi React)
- [x] Setup FastAPI + semua router (auth, chat, health)
- [x] Konfigurasi xiaomimimo API di backend
- [x] **Auth** — Register & Login via Supabase ( langsung dari frontend, bukan backend )
- [x] **Landing Page** — Playful design dengan:
  - Hero section + chat preview
  - Features section
  - Testimonials
  - CTA buttons → langsung ke /chat atau /dashboard
  - Guest access (tanpa login)
- [x] **Login Page** — Playful design dengan:
  - Floating animated shapes
  - Gradient border card
  - Link "coba chat tanpa login"
- [x] **Register Page** — Playful design dengan:
  - Warna teal (#4ECDC4)
  - Link "coba chat tanpa login"
- [x] **Chat Page** — Dengan sidebar:
  - Sidebar toggle (buka/tutup)
  - Obrolan baru (simpan chat lama ke riwayat)
  - Riwayat percakapan
  - Profile section (klik untuk edit)
  - Logout
  - Bot response text left-aligned (bukan center)
  - Chat bisa diakses tanpa login (guest mode)
- [x] **Dashboard Kesehatan** — Fitur lengkap:
  - 3 tab: Overview, Input Data, Riwayat
  - Metric cards (berat, tinggi, BMI auto-hitung + kategori, tekanan darah)
  - Habit rings animasi (air putih, olahraga, tidur, kopi)
  - Line chart tren berat badan & bar chart kebiasaan harian (14 hari)
  - Form input dengan BMI preview real-time
  - Upsert ke Supabase (update kalau tanggal sama, insert kalau baru)
  - Auth guard (redirect ke /login kalau session habis)
  - Toast notifikasi sukses/error
- [x] **Color Palette Playful** — Warna cerah:
  - Pink: #FF6B6B
  - Teal: #4ECDC4
  - Kuning: #FFE66D
  - Background: #FFFEF7

### ⏳ Belum / Perlu Diperbaiki
- [ ] **Guest Chat Limit** — User tanpa login bisa chat tapi ada limit (misal 5 pesan)
- [ ] **Chat History** — Simpan riwayat chat ke Supabase (chat_history table)
- [ ] **Saran Personal dari Edelweys** — Di Dashboard, Edelweys kasih saran dinamis berdasarkan data health log terbaru (panggil backend/AI)
- [ ] **Reminder System** — Pengingat berdasarkan kebiasaan user
- [ ] **Polish UI/UX** — Masih ada beberapa bagian yang bisa diperbaiki
- [ ] **Deploy** — Frontend ke Vercel, backend ke Railway/Render

---

## Fitur Guest Access (Work in Progress)
User bisa akses fitur tanpa login:
- **Chat** → Bisa chat dengan Edelweys (tapi ada limit nanti)
- **Dashboard** → Redirect ke /login (harus login)

Logic guest:
- Landing page ada tombol "Mulai Chat!" → langsung ke /chat
- Login/Register ada link "coba chat tanpa login"
- Chat page cek session Supabase, kalau tidak ada session → tetap bisa chat (guest mode)
- Nanti ditambahkan limit untuk guest (misal max 5 pesan)

---

## Urutan Pengerjaan Selanjutnya
1. **Guest Chat Limit** — Batasi jumlah pesan untuk user tanpa login
2. **Chat History** — Simpan percakapan ke Supabase
3. **Saran Personal dari Edelweys** — Di Dashboard, Edelweys kasih saran dinamis berdasarkan data health log terbaru
4. **Reminder System** — Pengingat berdasarkan kebiasaan
5. **Polish UI/UX** — Perbaiki design yang masih kurang
6. **Deploy** — Frontend ke Vercel, backend ke Railway/Render

---

## Design Style
- **Playful/Fun** — Warna cerah, animasi quirky, elemen interaktif
- **Warna:** Pink (#FF6B6B), Teal (#4ECDC4), Kuning (#FFE66D)
- **Typography:** DM Sans (body), Playfair Display (display)
- **Animasi:** Framer Motion untuk semua transisi

---

## Cara Run Project

### Frontend
```bash
cd edelweys
npm install
npm run dev
# Buka http://localhost:5173
```

### Backend
```bash
cd edelweys-backend
venv\Scripts\activate  # Windows
uvicorn main:app --reload --port 8000
# Buka http://localhost:8000/docs (Swagger)
```

---

## Catatan Penting
- Auth menggunakan **Supabase client langsung** (bukan FastAPI backend)
- Dashboard & Chat menggunakan **supabase.auth.getSession()** untuk cek auth
- Login/Register menggunakan **supabase.auth.signInWithPassword()** langsung
- Backend hanya untuk **chat AI** (memanggil xiaomimimo API)
- Waktu: 13 Juni 2026

---

Copy paste rangkuman ini ke AI yang kamu tuju ya! Semangat terus Edelweys-nya! 🌸🚀
