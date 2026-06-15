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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-sans relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #EEEEE9 0%, #E8EDE5 50%, #E0E8DC 100%)" }}>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(107,145,98,0.4) 0%, transparent 70%)", top: "-15%", left: "-10%" }}
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(168,197,160,0.5) 0%, transparent 70%)", bottom: "-10%", right: "-5%" }}
          animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-[300px] h-[300px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(212,165,116,0.4) 0%, transparent 70%)", top: "40%", right: "20%" }}
          animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Main Card */}
      <motion.div
        className="relative z-10 w-full max-w-[440px] mx-4"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="rounded-3xl p-10 shadow-glass-xl border border-white/40"
          style={{
            background: "rgba(255, 255, 255, 0.55)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}>

          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.img
              src={logo}
              alt="Edelweys"
              className="h-28 mx-auto mb-5"
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <h1 className="text-3xl font-extrabold text-edelweys-text m-0 tracking-tight">Edelweys</h1>
            <p className="text-sm text-edelweys-text-tertiary m-0 mt-1 font-medium">Health Companion</p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="bg-red-50/80 backdrop-blur-sm border border-red-200/60 text-red-600 p-4 rounded-2xl text-sm font-medium mb-5 overflow-hidden"
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <motion.div
              className="flex flex-col gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <label className="text-sm font-semibold text-edelweys-text">Email</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-edelweys-text-tertiary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 text-sm text-edelweys-text outline-none transition-all duration-300 font-sans ${
                    focusedField === "email"
                      ? "border-edelweys-sage bg-white/60 shadow-green-sm"
                      : "border-white/40 bg-white/30"
                  }`}
                  required
                />
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
            >
              <label className="text-sm font-semibold text-edelweys-text">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-edelweys-text-tertiary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 text-sm text-edelweys-text outline-none transition-all duration-300 font-sans ${
                    focusedField === "password"
                      ? "border-edelweys-sage bg-white/60 shadow-green-sm"
                      : "border-white/40 bg-white/30"
                  }`}
                  required
                />
              </div>
            </motion.div>

            <motion.button
              type="submit"
              className="py-4 rounded-2xl border-none bg-gradient-to-r from-edelweys-forest to-edelweys-sage text-white text-[15px] font-bold cursor-pointer mt-2 shadow-green transition-all duration-300"
              whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(107, 145, 98, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memproses...
                </span>
              ) : "Masuk"}
            </motion.button>
          </form>

          <motion.div
            className="text-center mt-6 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-sm text-edelweys-text-secondary m-0">
              Belum punya akun?{" "}
              <Link to="/register" className="text-edelweys-sage font-bold no-underline hover:underline">
                Daftar di sini
              </Link>
            </p>
            <p className="text-xs text-edelweys-text-tertiary m-0">
              Atau{" "}
              <Link to="/chat" className="text-edelweys-sage font-semibold no-underline hover:underline">
                coba chat tanpa login
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
