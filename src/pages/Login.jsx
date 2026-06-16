import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";
import logo from "../assets/logo.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate("/chat");
    } catch (err) {
      setError(err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-sans relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #E8EDE5 0%, #D4E2D0 50%, #C5D9BF 100%)" }}>

      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${200 + i * 80}px`,
              height: `${200 + i * 80}px`,
              left: `${10 + i * 15}%`,
              top: `${5 + i * 10}%`,
              background: `radial-gradient(circle, rgba(107,145,98,${0.15 - i * 0.02}) 0%, transparent 70%)`,
            }}
            animate={{
              x: [0, 30 * (i % 2 === 0 ? 1 : -1), 0],
              y: [0, 20 * (i % 2 === 0 ? -1 : 1), 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 15 + i * 3, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-[460px] mx-4"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="rounded-[28px] p-10 shadow-2xl border border-white/30"
          style={{ background: "rgba(255,255,255,0.45)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}>

          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <motion.img
              src={logo}
              alt="Edelweys"
              className="h-24 mx-auto mb-6 drop-shadow-lg"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <h1 className="text-[32px] font-extrabold tracking-tight m-0" style={{ color: "#1E3319" }}>Edelweys</h1>
            <p className="text-[15px] mt-2 m-0 font-medium" style={{ color: "#5A6B57" }}>Health Companion</p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-5 p-4 rounded-2xl text-sm font-medium flex items-center gap-3"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#DC2626" }}
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <label className="text-[13px] font-semibold mb-2 block" style={{ color: "#1E3319" }}>Email</label>
              <div className="relative">
                <input
                  type="email" placeholder="email@domain.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-5 py-4 rounded-2xl text-[15px] outline-none transition-all duration-300"
                  style={{
                    background: focusedField === "email" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)",
                    border: `2px solid ${focusedField === "email" ? "#6B9162" : "rgba(255,255,255,0.3)"}`,
                    color: "#1E3319",
                    boxShadow: focusedField === "email" ? "0 0 20px rgba(107,145,98,0.2)" : "none",
                  }}
                  required
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <label className="text-[13px] font-semibold mb-2 block" style={{ color: "#1E3319" }}>Password</label>
              <div className="relative">
                <input
                  type="password" placeholder="Masukkan password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-5 py-4 rounded-2xl text-[15px] outline-none transition-all duration-300"
                  style={{
                    background: focusedField === "password" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)",
                    border: `2px solid ${focusedField === "password" ? "#6B9162" : "rgba(255,255,255,0.3)"}`,
                    color: "#1E3319",
                    boxShadow: focusedField === "password" ? "0 0 20px rgba(107,145,98,0.2)" : "none",
                  }}
                  required
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              className="w-full py-4 rounded-2xl text-white text-[16px] font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #2D4A29 0%, #6B9162 100%)", boxShadow: "0 8px 30px rgba(45,74,41,0.35)" }}
              whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(45,74,41,0.5)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              disabled={loading}
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                </motion.div>
              ) : "Masuk"}
            </motion.button>
          </form>

          <motion.div className="text-center mt-6 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <p className="text-[14px] m-0" style={{ color: "#5A6B57" }}>
              Belum punya akun?{" "}
              <Link to="/register" className="font-bold no-underline hover:underline" style={{ color: "#6B9162" }}>Daftar di sini</Link>
            </p>
            <p className="text-[13px] m-0" style={{ color: "#7A8B76" }}>
              Atau <Link to="/chat" className="font-semibold no-underline hover:underline" style={{ color: "#6B9162" }}>coba chat tanpa login</Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
