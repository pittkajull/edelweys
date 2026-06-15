import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/edelweys.png";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Chat Kesehatan",
      desc: "Tanya apa aja soal kesehatan, Edelweys jawab dengan friendly!",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      title: "Dashboard Harian",
      desc: "Pantau berat badan, tekanan darah, dan kebiasaan sehari-hari.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
      ),
    },
    {
      title: "Tips Personal",
      desc: "Dapatkan saran kesehatan yang disesuaikan dengan data kamu.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-edelweys-bg font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-[100] bg-edelweys-bg/90 backdrop-blur-[10px] border-b border-edelweys-border">
        <div className="max-w-[1100px] mx-auto px-5 py-4 flex items-center justify-between">
          <img src={logo} alt="Edelweys" className="h-7" />
          <motion.button
            onClick={() => navigate("/register")}
            className="px-5 py-2.5 rounded-pill border-none bg-edelweys-forest text-white text-sm font-semibold cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Mulai Gratis
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-5 py-16 md:py-24 text-center relative overflow-hidden">
        <div className="max-w-[700px] mx-auto relative z-[2]">
          <motion.div
            className="inline-block px-4 py-2 rounded-pill border border-edelweys-border-light bg-white text-xs font-medium text-edelweys-text-secondary mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Baru | AI Health Companion kamu
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-extrabold text-edelweys-text leading-[1.05] m-0 mb-5 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Kenalan sama <br />
            <span className="text-edelweys-sage">Edelweys 🌿</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-edelweys-text-secondary leading-relaxed m-0 mb-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Teman sehat kamu yang selalu ada, siap bantu kapan aja!
          </motion.p>

          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={() => navigate("/chat")}
              className="px-8 py-4 rounded-pill border-none bg-edelweys-deep text-white text-lg font-semibold cursor-pointer shadow-green"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Mulai Chat ✦
            </motion.button>
            <motion.button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 rounded-pill border-2 border-edelweys-sage bg-white text-edelweys-sage text-lg font-semibold cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Dashboard
            </motion.button>
          </motion.div>
        </div>

        {/* Decorative Orbs */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex gap-5 pointer-events-none">
          <div className="w-[280px] h-[280px] rounded-full bg-[#B8C9B0]/55 blur-[40px]" />
          <div className="w-[200px] h-[200px] rounded-full bg-[#8EAB85]/60 blur-[40px]" />
          <div className="w-[140px] h-[140px] rounded-full bg-edelweys-sage/70 blur-[40px]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-[1100px] mx-auto px-5">
          <motion.p
            className="text-xs font-semibold text-edelweys-sage tracking-widest uppercase text-center mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            FITUR UNGGULAN
          </motion.p>
          <motion.h2
            className="text-3xl md:text-[42px] font-extrabold text-edelweys-text text-center m-0 mb-12 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            Kenapa Pilih Edelweys?
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="bg-edelweys-bg rounded-xl p-9 transition-all hover:-translate-y-1"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-edelweys-sage text-white flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-edelweys-text m-0 mb-3">{f.title}</h3>
                <p className="text-[15px] text-edelweys-text-secondary leading-relaxed m-0">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Big Text Section */}
      <section className="py-16 md:py-24 bg-edelweys-deep text-center">
        <motion.h2
          className="text-3xl md:text-5xl font-extrabold text-white leading-tight max-w-[900px] mx-auto m-0 tracking-tight"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          HEALTHY IS{" "}
          <span className="text-edelweys-light">EASY</span>{" "}
          WHEN YOU HAVE THE RIGHT COMPANION
        </motion.h2>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 text-center bg-edelweys-bg">
        <motion.h2
          className="text-3xl md:text-[42px] font-extrabold text-edelweys-text m-0 mb-4 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          Siap Mulai Perjalanan Sehatmu?
        </motion.h2>
        <motion.p
          className="text-base text-edelweys-text-secondary m-0 mb-9"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Bergabung dengan ribuan pengguna yang sudah merasakan manfaatnya
        </motion.p>
        <motion.button
          onClick={() => navigate("/register")}
          className="px-10 py-5 rounded-pill border-none bg-edelweys-sage text-white text-lg font-bold cursor-pointer shadow-green"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Daftar Sekarang - Gratis! ✦
        </motion.button>
      </section>

      {/* Footer */}
      <footer className="py-12 px-5 bg-edelweys-deep text-center">
        <div className="max-w-[400px] mx-auto">
          <img src={logo} alt="Edelweys" className="h-8 mx-auto mb-3" />
          <p className="text-sm text-edelweys-light m-0 mb-5">
            Health companion yang selalu ada untuk kamu.
          </p>
          <div className="flex justify-center gap-6 mb-5">
            <a onClick={() => navigate("/login")} className="text-sm text-edelweys-sage font-medium cursor-pointer no-underline">Login</a>
            <a onClick={() => navigate("/register")} className="text-sm text-edelweys-sage font-medium cursor-pointer no-underline">Daftar</a>
          </div>
          <p className="text-xs text-edelweys-text-tertiary m-0">
            &copy; 2026 Edelweys. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
