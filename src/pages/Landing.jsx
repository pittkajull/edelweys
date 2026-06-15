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
    <div className="font-sans" style={{ background: "#EEEEE9" }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/30"
        style={{ background: "rgba(238, 238, 233, 0.8)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="max-w-[1100px] mx-auto px-5 py-4 flex items-center justify-between">
          <img src={logo} alt="Edelweys" className="h-8" />
          <motion.button
            onClick={() => navigate("/register")}
            className="px-6 py-2.5 rounded-pill border-none bg-edelweys-forest text-white text-sm font-bold cursor-pointer shadow-green-sm"
            whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(30, 51, 25, 0.35)" }}
            whileTap={{ scale: 0.95 }}
          >
            Mulai Gratis
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-5 py-16 md:py-28 text-center relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(107,145,98,0.5) 0%, transparent 70%)", top: "10%", left: "5%" }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
          />
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full opacity-15"
            style={{ background: "radial-gradient(circle, rgba(212,165,116,0.5) 0%, transparent 70%)", bottom: "20%", right: "10%" }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="max-w-[700px] mx-auto relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-pill border border-white/50 mb-8"
            style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(10px)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="w-2 h-2 rounded-full bg-edelweys-sage animate-pulse" />
            <span className="text-xs font-semibold text-edelweys-text-secondary tracking-wide uppercase">AI Health Companion</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-extrabold text-edelweys-text leading-[1.05] m-0 mb-6 tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Kenalan sama <br />
            <span className="text-edelweys-sage">Edelweys</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-edelweys-text-secondary leading-relaxed m-0 mb-10 max-w-[500px] mx-auto"
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
              className="px-8 py-4 rounded-2xl border-none bg-gradient-to-r from-edelweys-deep to-edelweys-forest text-white text-lg font-bold cursor-pointer"
              style={{ boxShadow: "0 12px 40px rgba(30, 51, 25, 0.35)" }}
              whileHover={{ scale: 1.05, boxShadow: "0 16px 50px rgba(30, 51, 25, 0.45)" }}
              whileTap={{ scale: 0.95 }}
            >
              Mulai Chat
            </motion.button>
            <motion.button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-4 rounded-2xl border-2 border-edelweys-sage bg-white/60 text-edelweys-sage text-lg font-bold cursor-pointer"
              style={{ backdropFilter: "blur(10px)" }}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(107, 145, 98, 0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Dashboard
            </motion.button>
          </motion.div>
        </div>

        {/* Decorative Orbs */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 flex gap-6 pointer-events-none">
          <div className="w-[280px] h-[280px] rounded-full bg-[#B8C9B0]/40 blur-[50px]" />
          <div className="w-[200px] h-[200px] rounded-full bg-[#8EAB85]/50 blur-[40px]" />
          <div className="w-[140px] h-[140px] rounded-full bg-edelweys-sage/60 blur-[30px]" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-[1100px] mx-auto px-5">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-xs font-bold text-edelweys-sage tracking-[0.2em] uppercase mb-4">Fitur Unggulan</span>
            <h2 className="text-3xl md:text-5xl font-extrabold text-edelweys-text m-0 tracking-tight">Kenapa Pilih Edelweys?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="rounded-3xl p-8 border border-white/40 transition-all duration-300 hover:-translate-y-2"
                style={{
                  background: "rgba(255, 255, 255, 0.5)",
                  backdropFilter: "blur(20px)",
                  boxShadow: "0 8px 32px rgba(30, 51, 25, 0.06)",
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-edelweys-sage to-edelweys-light text-white flex items-center justify-center mb-6 shadow-green-sm">
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
      <section className="py-20 md:py-28 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1E3319 0%, #2D4A29 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-edelweys-sage/10 blur-[80px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] rounded-full bg-edelweys-light/10 blur-[60px]" />
        </div>
        <motion.h2
          className="text-3xl md:text-5xl font-extrabold text-white leading-tight max-w-[900px] mx-auto m-0 tracking-tight relative z-10 px-5"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          HEALTHY IS{" "}
          <span className="text-edelweys-light">EASY</span>{" "}
          WHEN YOU HAVE THE RIGHT COMPANION
        </motion.h2>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-edelweys-sage/10 blur-[100px]" />
        </div>
        <div className="relative z-10">
          <motion.h2
            className="text-3xl md:text-5xl font-extrabold text-edelweys-text m-0 mb-5 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Siap Mulai Perjalanan Sehatmu?
          </motion.h2>
          <motion.p
            className="text-base md:text-lg text-edelweys-text-secondary m-0 mb-10 max-w-[500px] mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Bergabung dengan ribuan pengguna yang sudah merasakan manfaatnya
          </motion.p>
          <motion.button
            onClick={() => navigate("/register")}
            className="px-10 py-5 rounded-2xl border-none bg-gradient-to-r from-edelweys-sage to-edelweys-light text-white text-lg font-bold cursor-pointer"
            style={{ boxShadow: "0 12px 40px rgba(107, 145, 98, 0.4)" }}
            whileHover={{ scale: 1.05, boxShadow: "0 16px 50px rgba(107, 145, 98, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Daftar Sekarang - Gratis!
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-5 text-center" style={{ background: "#1E3319" }}>
        <div className="max-w-[400px] mx-auto">
          <img src={logo} alt="Edelweys" className="h-8 mx-auto mb-4 opacity-90" />
          <p className="text-sm text-edelweys-light/70 m-0 mb-5">
            Health companion yang selalu ada untuk kamu.
          </p>
          <div className="flex justify-center gap-6 mb-5">
            <a onClick={() => navigate("/login")} className="text-sm text-edelweys-sage font-medium cursor-pointer no-underline hover:text-edelweys-light transition-colors">Login</a>
            <a onClick={() => navigate("/register")} className="text-sm text-edelweys-sage font-medium cursor-pointer no-underline hover:text-edelweys-light transition-colors">Daftar</a>
          </div>
          <p className="text-xs text-edelweys-text-tertiary/50 m-0">
            &copy; 2026 Edelweys. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
