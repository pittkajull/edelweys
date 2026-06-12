# 🌿 Edelweys

**AI-Powered Health Companion** — Teman sehatmu yang asik dan friendly!

Edelweys adalah chatbot kesehatan AI yang dibangun dengan React.js, FastAPI, dan Supabase. 
Edelweys hadir untuk membantu kamu mendapatkan informasi kesehatan, memantau data kesehatan harian, 
dan menerima pengingat serta tips kesehatan personal — semua dengan cara yang santai dan approachable.

> 💡 "Heeyy yoww! Kenalin, gue Edelweys — temen sehatmu yang siap bantu kapan aja! 🌸"

---

## ✨ Fitur Utama

### 🔐 Authentication
- Register & Login via Supabase
- Secure session management
- User profile management

### 💬 AI Chat (Edelweys Assistant)
- Chatbot kesehatan dengan personality friendly & casual
- Gaya bicara santai: "heyy yoww", bahasa Indonesia informal
- Mencakup semua topik kesehatan:
  - Gejala & penyakit
  - Nutrisi & diet
  - Kesehatan mental
  - Fitness & olahraga
- Selalu mengingatkan bahwa ini bukan pengganti dokter
- Untuk kasus kompleks: merekomendasikan Halodoc atau rumah sakit terdekat
- Contoh respons kasus kompleks:
  > "wah kalo itu terlalu rumit buat edelweys tanganin nich, better kamu konsul di halodoc ataupun ke rumah sakit terdekat dari rumah kamu yaw 😊"

### 📊 Health Dashboard
- Input & tracking data kesehatan harian:
  - Berat badan
  - Tinggi badan
  - BMI (Body Mass Index)
  - Tekanan darah
  - Kebiasaan (konsumsi kopi, olahraga, dll)
- Visualisasi data dalam bentuk grafik
- Monitoring perkembangan kesehatan

### ⏰ Reminders & Tips
- Pengingat berdasarkan kebiasaan yang diinput
- Tips kesehatan personal dari Edelweys
- Rekomendasi berdasarkan data user

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React.js 19 + Vite 8 |
| **Backend** | Python + FastAPI |
| **Database** | Supabase (PostgreSQL) |
| **AI Engine** | Claude API (claude-sonnet-4-6) |
| **Auth** | Supabase Auth |
| **HTTP Client** | Axios |

### Frontend Dependencies
- `react` ^19.2.6 — UI library
- `react-dom` ^19.2.6 — DOM renderer
- `react-router-dom` ^7.17.0 — Client-side routing
- `@supabase/supabase-js` ^2.108.1 — Supabase client
- `axios` ^1.17.0 — HTTP client untuk API calls

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
│   ├── pages/             # Page components (coming soon)
│   │   ├── Landing.jsx
│   │   ├── Chat.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── services/          # API calls (coming soon)
│   │   ├── supabase.js
│   │   └── api.js
│   ├── hooks/             # Custom hooks (coming soon)
│   ├── context/           # Global state (coming soon)
│   ├── App.jsx            # Main routing
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles + theme
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
- Anthropic API key (for Claude)

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
   # Create .env file and add:
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Access the app**
   Open [http://localhost:5173](http://localhost:5173)

---

## 🎨 Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page — introduction to Edelweys |
| `/login` | User login page |
| `/register` | User registration page |
| `/chat` | AI chatbot interface |
| `/dashboard` | Health data dashboard |

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
