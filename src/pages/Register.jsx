import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";
import logo from "../assets/edelweys-new-logo.png";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", username: "", full_name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.full_name, username: form.username },
        },
      });
      if (authError) throw authError;
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  const inputFields = [
    { name: "full_name", label: "Nama Lengkap", placeholder: "John Doe", type: "text" },
    { name: "username", label: "Username", placeholder: "johndoe", type: "text" },
    { name: "email", label: "Email", placeholder: "email@domain.com", type: "email" },
    { name: "password", label: "Password", placeholder: "Minimal 6 karakter", type: "password" },
  ];

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/chat` },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message || "Login Google gagal");
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
            <p className="text-[15px] mt-2 m-0 font-medium" style={{ color: "#5A6B57" }}>Buat akun baru</p>
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
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {inputFields.map((field, index) => (
              <motion.div key={field.name} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.1 }}>
                <label className="text-[13px] font-semibold mb-2 block" style={{ color: "#1E3319" }}>{field.label}</label>
                <input
                  name={field.name} type={field.type} placeholder={field.placeholder}
                  value={form[field.name]} onChange={handleChange}
                  onFocus={() => setFocusedField(field.name)}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-5 py-4 rounded-2xl text-[15px] outline-none transition-all duration-300"
                  style={{
                    background: focusedField === field.name ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)",
                    border: `2px solid ${focusedField === field.name ? "#6B9162" : "rgba(255,255,255,0.3)"}`,
                    color: "#1E3319",
                    boxShadow: focusedField === field.name ? "0 0 20px rgba(107,145,98,0.2)" : "none",
                  }}
                  required
                />
              </motion.div>
            ))}

            <motion.button
              type="submit"
              className="w-full py-4 rounded-2xl text-white text-[16px] font-bold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 mt-2"
              style={{ background: "linear-gradient(135deg, #6B9162 0%, #A8C5A0 100%)", boxShadow: "0 8px 30px rgba(107,145,98,0.35)" }}
              whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(107,145,98,0.5)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              disabled={loading}
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                </motion.div>
              ) : "Daftar"}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
            <span className="text-[13px] font-medium" style={{ color: "#7A8B76" }}>atau</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.3)" }} />
          </div>

          {/* Google Login Button */}
          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-4 rounded-2xl text-[15px] font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-3"
            style={{ background: "rgba(255,255,255,0.5)", border: "2px solid rgba(255,255,255,0.3)", color: "#1E3319" }}
            whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.7)" }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Daftar dengan Google
          </motion.button>

          <motion.div className="text-center mt-6 space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            <p className="text-[14px] m-0" style={{ color: "#5A6B57" }}>
              Sudah punya akun?{" "}
              <Link to="/login" className="font-bold no-underline hover:underline" style={{ color: "#6B9162" }}>Masuk di sini</Link>
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
