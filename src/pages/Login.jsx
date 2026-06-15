import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";
import logo from "../assets/edelweys.png";

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
    <div className="h-screen w-screen flex items-center justify-center bg-edelweys-bg font-sans relative overflow-hidden">
      {/* Floating shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[300px] h-[300px] rounded-full bg-edelweys-sage/15 blur-[60px] -top-[100px] -left-[100px]" />
        <div className="absolute w-[200px] h-[200px] rounded-full bg-edelweys-light/20 blur-[60px] -bottom-[50px] -right-[50px]" />
      </div>

      <motion.div
        className="relative z-10 bg-white/70 backdrop-blur-glass rounded-glass p-10 w-full max-w-[420px] shadow-glass border border-white/50"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="text-center mb-7">
          <img src={logo} alt="Edelweys" className="h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-edelweys-text m-0 tracking-tight">Edelweys</h1>
          <p className="text-sm text-edelweys-text-tertiary m-0">Health Companion</p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm font-medium mb-4 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-edelweys-text">Email</label>
            <input
              type="email"
              placeholder="email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              className={`px-4 py-3.5 rounded-xl border-2 bg-white/50 text-sm text-edelweys-text outline-none transition-colors font-sans ${
                focusedField === "email" ? "border-edelweys-sage" : "border-edelweys-border-light"
              }`}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-edelweys-text">Password</label>
            <input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              className={`px-4 py-3.5 rounded-xl border-2 bg-white/50 text-sm text-edelweys-text outline-none transition-colors font-sans ${
                focusedField === "password" ? "border-edelweys-sage" : "border-edelweys-border-light"
              }`}
              required
            />
          </div>

          <button
            type="submit"
            className="py-3.5 rounded-xl border-none bg-edelweys-forest text-white text-[15px] font-semibold cursor-pointer mt-2 shadow-green-sm transition-all hover:shadow-green"
            disabled={loading}
          >
            {loading ? "Masuk..." : "Masuk ✦"}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-edelweys-text-secondary">
          Belum punya akun?{" "}
          <Link to="/register" className="text-edelweys-sage font-semibold no-underline">
            Daftar di sini
          </Link>
        </p>

        <p className="text-center mt-3 text-xs text-edelweys-text-tertiary">
          Atau <Link to="/chat" className="text-edelweys-sage font-medium no-underline">coba chat tanpa login</Link>
        </p>
      </motion.div>
    </div>
  );
}
