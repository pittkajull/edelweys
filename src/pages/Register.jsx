import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";
import logo from "../assets/logo.png";

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
    <div
      className="min-h-screen w-full flex items-center justify-center font-sans relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #FAF5EE 0%, #F5EDE3 50%, #EDE4D8 100%)" }}
    >
      {/* Organic background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(125, 155, 118, 0.1) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(196, 149, 106, 0.08) 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.05, 1], rotate: [0, 3, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-[440px] mx-4 my-8"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="rounded-soft p-10 shadow-soft-lg border border-edelweys-border-light"
          style={{ background: "rgba(255, 252, 248, 0.8)", backdropFilter: "blur(24px)" }}
        >
          {/* Logo */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <motion.img
              src={logo}
              alt="Edelweys"
              className="h-20 mx-auto mb-5"
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <h1 className="text-3xl font-display m-0 text-edelweys-text">Edelweys</h1>
            <p className="text-sm mt-2 m-0 text-edelweys-text-secondary">Buat akun baru</p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="mb-5 p-4 rounded-2xl text-sm font-medium flex items-center gap-3"
                style={{ background: "rgba(220, 120, 100, 0.1)", border: "1px solid rgba(220, 120, 100, 0.2)", color: "#B85A4A" }}
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            {inputFields.map((field, index) => (
              <motion.div key={field.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + index * 0.1 }}>
                <label className="text-xs font-semibold mb-2 block text-edelweys-text">{field.label}</label>
                <input
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={handleChange}
                  onFocus={() => setFocusedField(field.name)}
                  onBlur={() => setFocusedField(null)}
                  className="w-full px-5 py-4 rounded-2xl text-sm outline-none transition-all duration-300 border-2"
                  style={{
                    background: "rgba(255, 252, 248, 0.6)",
                    borderColor: focusedField === field.name ? "#7D9B76" : "#E8DED4",
                    color: "#2D2A26",
                    boxShadow: focusedField === field.name ? "0 0 0 4px rgba(125, 155, 118, 0.1)" : "none",
                  }}
                  required
                />
              </motion.div>
            ))}

            <motion.button
              type="submit"
              className="w-full py-4 rounded-2xl text-white text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 mt-2 shadow-sage"
              style={{ background: "linear-gradient(135deg, #C4956A 0%, #D4A574 100%)" }}
              whileHover={{ scale: 1.02, boxShadow: "0 12px 40px rgba(196, 149, 106, 0.35)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              disabled={loading}
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </motion.div>
              ) : (
                "Daftar"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-edelweys-border" />
            <span className="text-xs font-medium text-edelweys-text-tertiary">atau</span>
            <div className="flex-1 h-px bg-edelweys-border" />
          </div>

          {/* Google Login Button */}
          <motion.button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-4 rounded-2xl text-sm font-semibold cursor-pointer transition-all duration-300 flex items-center justify-center gap-3 border-2 border-edelweys-border text-edelweys-text"
            style={{ background: "rgba(255, 252, 248, 0.5)" }}
            whileHover={{ scale: 1.02, background: "rgba(255, 252, 248, 0.8)" }}
            whileTap={{ scale: 0.98 }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Daftar dengan Google
          </motion.button>

          <motion.div
            className="text-center mt-6 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <p className="text-sm m-0 text-edelweys-text-secondary">
              Sudah punya akun?{" "}
              <Link to="/login" className="font-bold no-underline hover:underline text-edelweys-sage">
                Masuk di sini
              </Link>
            </p>
            <p className="text-xs m-0 text-edelweys-text-tertiary">
              Atau{" "}
              <Link to="/chat" className="font-semibold no-underline hover:underline text-edelweys-sage">
                coba chat tanpa login
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
