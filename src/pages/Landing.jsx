import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Chat Kesehatan",
      desc: "Tanya apa aja soal kesehatan, Edelweys jawab dengan friendly!",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      title: "Dashboard Harian",
      desc: "Pantau berat badan, tekanan darah, dan kebiasaan sehari-hari.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
      ),
    },
    {
      title: "Tips Personal",
      desc: "Dapatkan saran kesehatan yang disesuaikan dengan data kamu.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="font-sans" style={{ background: "linear-gradient(180deg, #FAF5EE 0%, #F5EDE3 100%)" }}>
      {/* Navbar */}
      <motion.nav
        className="sticky top-0 z-50 border-b border-edelweys-border-light"
        style={{ background: "rgba(250, 245, 238, 0.85)", backdropFilter: "blur(20px)" }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-5 flex items-center justify-between">
          <img src={logo} alt="Edelweys" className="h-10" />
          <motion.button
            onClick={() => navigate("/register")}
            className="px-6 py-2.5 rounded-pill text-white text-sm font-semibold cursor-pointer shadow-sage-sm"
            style={{ background: "linear-gradient(135deg, #4A5D4A 0%, #7D9B76 100%)" }}
            whileHover={{ scale: 1.05, boxShadow: "0 8px 30px rgba(125, 155, 118, 0.35)" }}
            whileTap={{ scale: 0.95 }}
          >
            Mulai Gratis
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="px-6 py-24 md:py-36 text-center relative overflow-hidden">
        {/* Organic background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute -top-20 -right-20 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(196, 149, 106, 0.12) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -bottom-32 -left-32 w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(125, 155, 118, 0.1) 0%, transparent 70%)" }}
            animate={{ scale: [1, 1.08, 1], rotate: [0, -3, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="max-w-[700px] mx-auto relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill mb-8"
            style={{ background: "rgba(255, 252, 248, 0.6)", border: "1px solid rgba(232, 222, 212, 0.6)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-edelweys-sage"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs font-semibold tracking-wider uppercase text-edelweys-text-secondary">AI Health Companion</span>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-display leading-[1.1] m-0 mb-6 tracking-tight"
            style={{ color: "#2D2A26" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Kenalan sama <br />
            <span className="text-edelweys-sage">Edelweys</span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl leading-relaxed m-0 mb-12 max-w-[500px] mx-auto text-edelweys-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Teman sehat kamu yang selalu ada, siap bantu kapan aja.
          </motion.p>

          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={() => navigate("/chat")}
              className="px-10 py-4 rounded-pill text-white text-lg font-semibold cursor-pointer shadow-sage"
              style={{ background: "linear-gradient(135deg, #4A5D4A 0%, #7D9B76 100%)" }}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(125, 155, 118, 0.4)" }}
              whileTap={{ scale: 0.95 }}
            >
              Mulai Chat
            </motion.button>
            <motion.button
              onClick={() => navigate("/dashboard")}
              className="px-10 py-4 rounded-pill text-lg font-semibold cursor-pointer border-2 border-edelweys-sage text-edelweys-sage"
              style={{ background: "rgba(255, 252, 248, 0.5)" }}
              whileHover={{ scale: 1.05, background: "rgba(125, 155, 118, 0.08)" }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Dashboard
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1100px] mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase mb-4 text-edelweys-warm">Fitur Unggulan</span>
            <h2 className="text-4xl md:text-5xl font-display m-0 tracking-tight text-edelweys-text">Kenapa Pilih Edelweys?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="rounded-soft p-8 bg-edelweys-surface/60 border border-edelweys-border-light shadow-soft transition-all duration-500"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, boxShadow: "0 20px 50px rgba(45, 42, 38, 0.1)" }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-warm-sm"
                  style={{ background: "linear-gradient(135deg, #C4956A 0%, #D4A574 100%)", color: "white" }}
                >
                  {f.icon}
                </div>
                <h3 className="text-xl font-display m-0 mb-3 text-edelweys-text">{f.title}</h3>
                <p className="text-sm leading-relaxed m-0 text-edelweys-text-secondary">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(196, 149, 106, 0.12) 0%, transparent 70%)" }}
          />
        </div>
        <div className="relative z-10">
          <motion.h2
            className="text-4xl md:text-5xl font-display m-0 mb-5 tracking-tight text-edelweys-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Siap Mulai Perjalanan Sehatmu?
          </motion.h2>
          <motion.p
            className="text-lg m-0 mb-10 max-w-[500px] mx-auto text-edelweys-text-secondary"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Bergabung dengan ribuan pengguna yang sudah merasakan manfaatnya
          </motion.p>
          <motion.button
            onClick={() => navigate("/register")}
            className="px-12 py-5 rounded-pill text-white text-lg font-semibold cursor-pointer shadow-warm"
            style={{ background: "linear-gradient(135deg, #C4956A 0%, #D4A574 100%)" }}
            whileHover={{ scale: 1.05, boxShadow: "0 20px 50px rgba(196, 149, 106, 0.4)" }}
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
      <footer className="py-14 px-6 text-center" style={{ background: "#2D2A26" }}>
        <div className="max-w-[400px] mx-auto">
          <img src={logo} alt="Edelweys" className="h-10 mx-auto mb-4 opacity-90" />
          <p className="text-sm m-0 mb-5" style={{ color: "rgba(168, 196, 160, 0.7)" }}>Health companion yang selalu ada untuk kamu.</p>
          <div className="flex justify-center gap-6 mb-5">
            <a onClick={() => navigate("/login")} className="text-sm font-medium cursor-pointer no-underline hover:opacity-80 transition-opacity text-edelweys-sage">Login</a>
            <a onClick={() => navigate("/register")} className="text-sm font-medium cursor-pointer no-underline hover:opacity-80 transition-opacity text-edelweys-sage">Daftar</a>
          </div>
          <p className="text-xs m-0" style={{ color: "rgba(138, 130, 121, 0.5)" }}>&copy; 2026 Edelweys. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
