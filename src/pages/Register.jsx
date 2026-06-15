import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";
import logo from "../assets/edelweys.png";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    username: "",
    full_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });

      if (authError) throw authError;

      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          username: form.username,
          full_name: form.full_name,
        });

      if (profileError) throw profileError;
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

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-edelweys-bg font-sans relative overflow-hidden">
      {/* Floating shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[300px] h-[300px] rounded-full bg-edelweys-sage/15 blur-[60px] -top-[100px] -right-[100px]" />
        <div className="absolute w-[200px] h-[200px] rounded-full bg-edelweys-light/20 blur-[60px] -bottom-[50px] -left-[50px]" />
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
          <p className="text-sm text-edelweys-text-tertiary m-0">Buat akun baru</p>
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
        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          {inputFields.map((field) => (
            <div key={field.name} className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-edelweys-text">{field.label}</label>
              <input
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={handleChange}
                onFocus={() => setFocusedField(field.name)}
                onBlur={() => setFocusedField(null)}
                className={`px-4 py-3 rounded-xl border-2 bg-white/50 text-sm text-edelweys-text outline-none transition-colors font-sans ${
                  focusedField === field.name ? "border-edelweys-sage" : "border-edelweys-border-light"
                }`}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            className="py-3.5 rounded-xl border-none bg-edelweys-sage text-white text-[15px] font-semibold cursor-pointer mt-2 shadow-green-sm transition-all hover:shadow-green"
            disabled={loading}
          >
            {loading ? "Mendaftar..." : "Daftar 🌿"}
          </button>
        </form>

        <p className="text-center mt-5 text-sm text-edelweys-text-secondary">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-edelweys-sage font-semibold no-underline">
            Masuk di sini
          </Link>
        </p>

        <p className="text-center mt-3 text-xs text-edelweys-text-tertiary">
          Atau <Link to="/chat" className="text-edelweys-sage font-medium no-underline">coba chat tanpa login</Link>
        </p>
      </motion.div>
    </div>
  );
}
