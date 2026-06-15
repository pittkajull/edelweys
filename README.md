# 🌿 Edelweys

**AI-Powered Health Companion** — Teman sehatmu yang selalu ada!

Edelweys adalah chatbot kesehatan AI yang dibangun dengan React.js, FastAPI, dan Supabase. 
Edelweys hadir untuk membantu kamu mendapatkan informasi kesehatan, memantau data kesehatan harian, 
dan menerima pengingat serta tips kesehatan personal — semua dengan cara yang santai dan approachable.

> "Heeyy yoww! Kenalin, gue Edelweys — temen sehatmu yang siap bantu kapan aja!"

---

## Fitur Utama

### Authentication
- Register & Login via Supabase
- Secure session management
- User profile management (edit profile)
- Guest access (chat tanpa login, tapi ada limit)

### AI Chat (Edelweys Assistant)
- Chatbot kesehatan dengan personality friendly & casual
- Gaya bicara santai: "heyy yoww", bahasa Indonesia informal
- Support markdown formatting (bold, tables)
- Sidebar dengan obrolan baru & riwayat chat
- Chat history tersimpan di Supabase (untuk user login)

### Health Dashboard
- Input & tracking data kesehatan harian:
  - Berat badan, tinggi badan, BMI (auto-hitung + kategori)
  - Tekanan darah (sistolik/diastolik)
  - Kebiasaan: air putih, kopi, olahraga, tidur
- Input mode: Angka atau Catatan (text bebas)
- Real-time clock di dashboard
- Line chart tren kesehatan (14 hari)
- Saran personal dari Edelweys

---

## Design System

### Color Palette
| Warna | Kode | Kegunaan |
|-------|------|----------|
| Background | `#EEEEE9` | Warm sage gray |
| Green Deep | `#1E3319` | Primary dark |
| Green Forest | `#2D4A29` | Sidebar |
| Green Sage | `#6B9162` | Accent, CTA |
| Green Light | `#A8C5A0` | Hover states |
| Border Soft | `#D5E0D2` | Soft borders |

### Typography
- Font: Plus Jakarta Sans
- Headings: font-weight 800, letter-spacing -0.02em
- Body: font-weight 400-500

### Style
- Glassmorphism cards dengan backdrop blur
- Border radius: 12-16px
- Shadows: rgba(30, 51, 25, 0.08)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js 19 + Vite 8 |
| Backend | Python + FastAPI |
| Database | Supabase (PostgreSQL) |
| AI | xiaomimimo API (model: mimo-v2.5-pro) |
| Auth | Supabase Auth |
| Styling | Inline styles + Framer Motion |

---

## Project Structure

```
edelweys/
├── public/
│   └── favicon.png           # Edelweys logo
├── src/
│   ├── assets/
│   │   └── logo.png          # Logo utama
│   ├── pages/
│   │   ├── Landing.jsx       ✅ Hero + features + CTA
│   │   ├── Login.jsx         ✅ Glassmorphism login
│   │   ├── Register.jsx      ✅ Glassmorphism register
│   │   ├── Chat.jsx          ✅ Sidebar + chat + table support
│   │   └── Dashboard.jsx     ✅ Glassmorphism + clock + input modes
│   ├── services/
│   │   └── supabase.js       ✅ Supabase client
│   ├── App.jsx               ✅ Routing
│   └── main.jsx
├── edelweys-backend/
│   ├── main.py               ✅ FastAPI app
│   ├── routers/
│   │   ├── auth.py           ✅ Supabase auth
│   │   ├── chat.py           ✅ xiaomimimo AI
│   │   └── health.py         ✅ Health logs
│   └── .env                  ✅ API keys
└── .env                      ✅ VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase account
- xiaomimimo API key

### Frontend
```bash
npm install
npm run dev
# Buka http://localhost:5173
```

### Backend
```bash
cd edelweys-backend
venv\Scripts\activate  # Windows
uvicorn main:app --reload --port 8000
# Buka http://localhost:8000/docs
```

---

## Routes

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Landing page | ✅ |
| `/login` | Login | ✅ |
| `/register` | Register | ✅ |
| `/chat` | AI Chat (sidebar + history) | ✅ |
| `/dashboard` | Health dashboard | ✅ |

---

## Guest Access

User bisa chat tanpa login dengan batasan:
- Chat berfungsi normal
- Riwayat TIDAK tersimpan
- Ada banner peringatan "Login untuk menyimpan riwayat"
- Bisa login dari sidebar atau banner

---

## Database Schema

### profiles
- `id`, `username`, `full_name`, `age`, `gender`

### health_logs
- `user_id`, `date`, `weight`, `height`, `bmi`, `blood_pressure`
- `coffee_cups`, `exercise_minutes`, `water_glasses`, `sleep_hours`
- Unique constraint: `(user_id, date)`

### chat_history
- `user_id`, `title`, `messages` (JSON), `created_at`

---

## Progress

### Selesai
- [x] Setup React.js + routing
- [x] Setup Supabase (tabel + RLS)
- [x] Setup FastAPI + xiaomimimo API
- [x] Auth (register + login + profile edit)
- [x] Landing page dengan CTA
- [x] Chat dengan sidebar, history, table support
- [x] Dashboard glassmorphism + real-time clock
- [x] Guest access (chat tanpa login)
- [x] Glassmorphism design system

### Belum
- [ ] Chat history sync (save/load dari Supabase)
- [ ] Reminder & saran personal berdasarkan data
- [ ] Deploy (Vercel + Railway/Render)
- [ ] Responsive mobile optimization

---

## Disclaimer

Edelweys adalah AI assistant untuk informasi kesehatan umum. 
**BUKAN pengganti konsultasi medis profesional.**

Untuk kondisi serius, konsultasikan ke dokter atau [Halodoc](https://www.halodoc.com).

---

<div align="center">

**Made with 💚 by pittkajull**

*"Heeyy yoww! Stay healthy, stay happy!"* 🌿

</div>
