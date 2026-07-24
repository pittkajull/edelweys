import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/edelweys-new-logo.png";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    { title: "Chat Kesehatan", desc: "Tanya apa aja soal kesehatan, Edelweys jawab dengan friendly!", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
    { title: "Dashboard Harian", desc: "Pantau berat badan, tekanan darah, dan kebiasaan sehari-hari.", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 20V10M12 20V4M6 20v-6" /></svg> },
    { title: "Tips Personal", desc: "Dapatkan saran kesehatan yang disesuaikan dengan data kamu.", icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
  ];

  return (
    <div className="font-sans" style={{ background: "#E8EDE5" }}>
      {/* Navbar */}
      <motion.nav
        className="sticky top-0 z-50 border-b"
        style={{ background: "rgba(232,237,229,0.8)", backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)", borderColor: "rgba(255,255,255,0.3)" }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <img src={logo} alt="Edelweys" className="h-10" />
          <motion.button
            onClick={() => navigate("/register")}
            className="px-6 py-2.5 rounded-full text-white text-[14px] font-semibold cursor-pointer"
            style={{ background: "linear-gradient(135deg, #2D4A29 0%, #6B9162 100%)", boxShadow: "0 4px 15px rgba(45,74,41,0.3)" }}
            whileHover={{ scale: 1.05, boxShadow: "0 6px 20px rgba(45,74,41,0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            Mulai Gratis
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="px-6 py-20 md:py-32 text-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${300 + i * 100}px`,
                height: `${300 + i * 100}px`,
                left: `${20 + i * 20}%`,
                top: `${10 + i * 15}%`,
                background: `radial-gradient(circle, rgba(107,145,98,${0.12 - i * 0.03}) 0%, transparent 70%)`,
              }}
              animate={{ x: [0, 20, 0], y: [0, -15, 0], scale: [1, 1.05, 1] }}
              transition={{ duration: 12 + i * 4, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>

        <div className="max-w-[800px] mx-auto relative z-10">
          <motion.div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full mb-8"
            style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.4)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div className="w-2 h-2 rounded-full" style={{ background: "#6B9162" }} animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span className="text-[12px] font-semibold tracking-wider uppercase" style={{ color: "#5A6B57" }}>AI Health Companion</span>
          </motion.div>

          <motion.h1
            className="text-[48px] md:text-[72px] font-extrabold leading-[1.05] m-0 mb-6 tracking-tight"
            style={{ color: "#1E3319" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            Kenalan sama <br />
            <span style={{ color: "#6B9162" }}>Edelweys</span>
          </motion.h1>

          <motion.p
            className="text-[18px] md:text-[20px] leading-relaxed m-0 mb-12 max-w-[550px] mx-auto"
            style={{ color: "#5A6B57" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Teman sehat kamu yang selalu ada, siap bantu kapan aja!
          </motion.p>

          <motion.div
            className="flex gap-4 justify-center flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={() => navigate("/chat")}
              className="px-10 py-4 rounded-full text-white text-[17px] font-bold cursor-pointer"
              style={{ background: "linear-gradient(135deg, #1E3319 0%, #2D4A29 100%)", boxShadow: "0 12px 40px rgba(30,51,25,0.4)" }}
              whileHover={{ scale: 1.05, boxShadow: "0 16px 50px rgba(30,51,25,0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              Mulai Chat
            </motion.button>
            <motion.button
              onClick={() => navigate("/dashboard")}
              className="px-10 py-4 rounded-full text-[17px] font-bold cursor-pointer"
              style={{ border: "2px solid #6B9162", background: "rgba(255,255,255,0.4)", backdropFilter: "blur(10px)", color: "#6B9162" }}
              whileHover={{ scale: 1.05, background: "rgba(107,145,98,0.1)" }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Dashboard
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="max-w-[1100px] mx-auto px-6">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase mb-4" style={{ color: "#6B9162" }}>Fitur Unggulan</span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold m-0 tracking-tight" style={{ color: "#1E3319" }}>Kenapa Pilih Edelweys?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="rounded-[24px] p-8 transition-all duration-500"
                style={{ background: "rgba(255,255,255,0.4)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 8px 32px rgba(30,51,25,0.06)" }}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, boxShadow: "0 20px 50px rgba(30,51,25,0.12)" }}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg, #6B9162 0%, #A8C5A0 100%)", color: "white", boxShadow: "0 8px 20px rgba(107,145,98,0.3)" }}>
                  {f.icon}
                </div>
                <h3 className="text-[20px] font-bold m-0 mb-3" style={{ color: "#1E3319" }}>{f.title}</h3>
                <p className="text-[15px] leading-relaxed m-0" style={{ color: "#5A6B57" }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(107,145,98,0.15) 0%, transparent 70%)" }} />
        </div>
        <div className="relative z-10">
          <motion.h2 className="text-[36px] md:text-[48px] font-extrabold m-0 mb-5 tracking-tight" style={{ color: "#1E3319" }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            Siap Mulai Perjalanan Sehatmu?
          </motion.h2>
          <motion.p className="text-[17px] m-0 mb-10 max-w-[500px] mx-auto" style={{ color: "#5A6B57" }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            Bergabung dengan ribuan pengguna yang sudah merasakan manfaatnya
          </motion.p>
          <motion.button
            onClick={() => navigate("/register")}
            className="px-12 py-5 rounded-full text-white text-[18px] font-bold cursor-pointer"
            style={{ background: "linear-gradient(135deg, #6B9162 0%, #A8C5A0 100%)", boxShadow: "0 12px 40px rgba(107,145,98,0.4)" }}
            whileHover={{ scale: 1.05, boxShadow: "0 16px 50px rgba(107,145,98,0.5)" }}
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
      <footer className="py-12 px-6 text-center" style={{ background: "#1E3319" }}>
        <div className="max-w-[400px] mx-auto">
          <img src={logo} alt="Edelweys" className="h-10 mx-auto mb-4 opacity-90" />
          <p className="text-[14px] m-0 mb-5" style={{ color: "rgba(168,197,160,0.7)" }}>Health companion yang selalu ada untuk kamu.</p>
          <div className="flex justify-center gap-6 mb-5">
            <a onClick={() => navigate("/login")} className="text-[14px] font-medium cursor-pointer no-underline hover:opacity-80 transition-opacity" style={{ color: "#6B9162" }}>Login</a>
            <a onClick={() => navigate("/register")} className="text-[14px] font-medium cursor-pointer no-underline hover:opacity-80 transition-opacity" style={{ color: "#6B9162" }}>Daftar</a>
          </div>
          <p className="text-[12px] m-0" style={{ color: "rgba(122,139,118,0.5)" }}>&copy; 2026 Edelweys. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
