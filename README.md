# 🌿 Edelweys

**AI-Powered Health Companion** — Teman sehatmu yang selalu ada! 🌸

Edelweys adalah chatbot kesehatan AI yang dibangun dengan React.js, FastAPI, dan Supabase. 
Edelweys hadir untuk membantu kamu mendapatkan informasi kesehatan, memantau data kesehatan harian, 
dan menerima pengingat serta tips kesehatan personal — semua dengan cara yang santai dan approachable.

> 💡 "Heeyy yoww! Kenalin, gue Edelweys — temen sehatmu yang siap bantu kapan aja! 🌸"

---

## ✨ Fitur Utama

### 🔐 Authentication
- ✅ Register & Login via Supabase
- ✅ Secure session management
- ✅ User profile management

### 💬 AI Chat (Edelweys Assistant)
- ✅ Chatbot kesehatan dengan personality friendly & casual
- ✅ Gaya bicara santai: "heyy yoww", bahasa Indonesia informal
- ✅ Mencakup semua topik kesehatan:
  - Gejala & penyakit
  - Nutrisi & diet
  - Kesehatan mental
  - Fitness & olahraga
- ✅ Selalu mengingatkan bahwa ini bukan pengganti dokter
- ✅ Untuk kasus kompleks: merekomendasikan Halodoc atau rumah sakit terdekat

### 📊 Health Dashboard
- ✅ Input & tracking data kesehatan harian:
  - Berat badan
  - Tinggi badan
  - BMI (Body Mass Index) — auto-hitung + kategori
  - Tekanan darah
  - Kebiasaan (konsumsi kopi, olahraga, air putih, tidur)
- ✅ Visualisasi data dalam bentuk grafik (Line chart & Bar chart)
- ✅ Habit rings animasi
- ✅ Monitoring perkembangan kesehatan (14 hari terakhir)
- ✅ Upsert data (update kalau tanggal sama, insert kalau baru)

### ⏰ Reminders & Tips
- ⏳ Pengingat berdasarkan kebiasaan yang diinput
- ⏳ Tips kesehatan personal dari Edelweys
- ⏳ Rekomendasi berdasarkan data user

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js 19 + Vite 8 |
| **Backend** | Python + FastAPI |
| **Database** | Supabase (PostgreSQL) |
| **AI Engine** | xiaomimimo API (Anthropic-compatible, model: mimo-v2.5-pro) |
| **Auth** | Supabase Auth |
| **HTTP Client** | Axios |

### Frontend Dependencies
- `react` ^19.2.6 — UI library
- `react-dom` ^19.2.6 — DOM renderer
- `react-router-dom` ^7.17.0 — Client-side routing
- `@supabase/supabase-js` ^2.108.1 — Supabase client
- `axios` ^1.17.0 — HTTP client untuk API calls
- `recharts` ^3.8.1 — Charts & visualization

### Dev Tools
- `vite` ^8.0.12 — Fast build tool
- `@vitejs/plugin-react` ^6.0.1 — React support for Vite
- `babel-plugin-react-compiler` — Automatic component memoization
- ESLint — Code linting

---

## 📁 Project Structure

```
edelweys/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   └── hero.png
│   ├── components/        # Reusable UI components (coming soon)
│   ├── pages/
│   │   ├── Login.jsx       ✅ selesai
│   │   ├── Register.jsx    ✅ selesai
│   │   ├── Chat.jsx        ✅ selesai
│   │   ├── Dashboard.jsx   ✅ selesai
│   │   └── Landing.jsx     ⏳ belum
│   ├── services/
│   │   └── supabase.js     ✅ sudah ada
│   ├── hooks/             # Custom hooks (coming soon)
│   ├── context/           # Global state (coming soon)
│   ├── App.jsx            # Main routing
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles + theme
├── edelweys-backend/
│   ├── main.py             ✅ selesai
│   ├── routers/
│   │   ├── __init__.py     ✅ selesai
│   │   ├── chat.py         ✅ selesai
│   │   ├── auth.py         ✅ selesai
│   │   └── health.py       ✅ selesai
│   ├── venv/
│   └── .env                ✅ semua key sudah diisi
├── .env                   # Environment variables
├── Claude.md              # Auto-commit rules
├── index.html             # Vite entry HTML
├── package.json
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Python 3.8+ (for backend)
- Supabase account
- xiaomimimo API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pittkajull/edelweys.git
   cd edelweys
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   # Frontend .env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Setup backend**
   ```bash
   cd edelweys-backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install fastapi uvicorn supabase anthropic python-dotenv
   ```

5. **Run backend**
   ```bash
   cd edelweys-backend
   venv\Scripts\activate
   uvicorn main:app --reload --port 8000
   ```

6. **Run frontend**
   ```bash
   npm run dev
   ```

7. **Access the app**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend: [http://localhost:8000](http://localhost:8000)
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🎨 Routes

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Landing page — introduction to Edelweys | ⏳ |
| `/login` | User login page | ✅ |
| `/register` | User registration page | ✅ |
| `/chat` | AI chatbot interface | ✅ |
| `/dashboard` | Health data dashboard | ✅ |

---

## 🎯 Edelweys Personality

Edelweys dirancang memiliki personality yang unik:

- **Friendly & Casual** — Bicara seperti teman, bukan dokter formal
- **Bahasa Indonesia Informal** — Gaya bicara santai, sering pakai "heyy yoww"
- **Empathic** — Peduli dan supportif terhadap user
- **Honest** — Selalu mengingatkan keterbatasannya sebagai AI
- **Helpful** — Berusaha membantu sebisa mungkin, tapi tahu kapan harus redirect ke profesional

### Contoh Interaksi

**User:** "Edelweys, aku sering pusing nih tiap pagi"

**Edelweys:** "heyy yoww! Pusing tiap pagi tuh bisa banyak penyebabnya nich — bisa kurang tidur, dehidrasi, atau kebanyakan screen time malem-malem. Coba cek pola tidurmu dulu ya, pastikan minum air yang cukup, dan jangan lupa sarapan! Tapi kalo udah berlangsung lama atau makin parah, better cek ke dokter ya biar lebih pasti 😊"

---

## 📊 Database Supabase

3 tabel dengan RLS enabled:

### profiles
- `id` — user ID (primary key)
- `username` — username
- `full_name` — nama lengkap
- `age` — usia
- `gender` — jenis kelamin

### health_logs
- `id` — log ID (primary key)
- `user_id` — user ID (foreign key)
- `date` — tanggal log
- `weight` — berat badan (kg)
- `height` — tinggi badan (cm)
- `bmi` — BMI (auto-hitung)
- `blood_pressure` — tekanan darah (sistolik/diastolik)
- `coffee_cups` — jumlah kopi
- `exercise_minutes` — menit olahraga
- `water_glasses` — gelas air putih
- `sleep_hours` — jam tidur

### chat_history
- `id` — chat ID (primary key)
- `user_id` — user ID (foreign key)
- `role` — user/assistant
- `message` — isi pesan

> ⚠️ Kolom `date` di `health_logs` harus punya unique constraint `(user_id, date)` supaya upsert bisa jalan:
> ```sql
> ALTER TABLE health_logs ADD CONSTRAINT health_logs_user_date_unique UNIQUE (user_id, date);
> ```

---

## 📝 Progress

### ✅ Selesai
- Setup React.js + struktur folder + routing
- Setup Supabase (tabel + RLS + koneksi React)
- Setup FastAPI + semua router (auth, chat, health)
- Konfigurasi xiaomimimo API di backend
- Halaman Login — berfungsi, redirect ke /dashboard
- Halaman Register — berfungsi, redirect ke /login
- Halaman Chat — berfungsi, Edelweys udah bisa diajak ngobrol
- Dashboard Kesehatan — selesai, fitur lengkap

### ⏳ Belum
- Saran Personal dari Edelweys (berdasarkan health log)
- Landing Page
- Polish UI/UX
- Deploy (frontend ke Vercel, backend ke Railway/Render)

---

## ⚠️ Disclaimer

Edelweys adalah AI assistant yang membantu memberikan informasi kesehatan umum. 
**Edelweys BUKAN pengganti konsultasi medis profesional.**

Untuk kondisi medis yang serius atau kompleks, selalu konsultasikan dengan:
- Dokter umum atau spesialis
- [Halodoc](https://www.halodoc.com) — konsultasi online
- Rumah sakit terdekat

---

## 📝 License

This project is proprietary software. All rights reserved.

---

<div align="center">

**Made with 💚 by pittkajull**

*"Heeyy yoww! Stay healthy, stay happy!"* 🌿

</div>
