import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";

const COLORS = {
  bgMain: "#EEEEE9",
  greenDeep: "#1E3319",
  greenForest: "#2D4A29",
  greenSage: "#6B9162",
  greenLight: "#A8C5A0",
  borderSoft: "#D5E0D2",
  borderLight: "#C5D5C2",
  textPrimary: "#1E3319",
  textSecondary: "#5A6B57",
  textTertiary: "#7A8B76",
  white: "#FFFFFF",
};

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
    <div style={styles.container}>
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div style={styles.logoSection}>
          <div style={styles.logo}>E</div>
          <h1 style={styles.title}>Edelweys</h1>
          <p style={styles.subtitle}>Buat akun baru</p>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              style={styles.errorBox}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleRegister} style={styles.form}>
          {inputFields.map((field) => (
            <div key={field.name} style={styles.inputGroup}>
              <label style={styles.label}>{field.label}</label>
              <input
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={handleChange}
                onFocus={() => setFocusedField(field.name)}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...styles.input,
                  borderColor: focusedField === field.name ? COLORS.greenSage : COLORS.borderLight,
                }}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Mendaftar..." : "Daftar 🌿"}
          </button>
        </form>

        <p style={styles.link}>
          Sudah punya akun?{" "}
          <Link to="/login" style={styles.linkBold}>
            Masuk di sini
          </Link>
        </p>

        <p style={styles.guestNote}>
          Atau{" "}
          <Link to="/chat" style={styles.guestLink}>
            coba chat tanpa login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: COLORS.bgMain,
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  card: {
    background: COLORS.white,
    borderRadius: "16px",
    padding: "32px",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 8px 32px rgba(30, 51, 25, 0.10)",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "28px",
  },
  logo: {
    width: "48px",
    height: "48px",
    background: "linear-gradient(135deg, #C5D5C2, #8EAB85)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    fontSize: "22px",
    fontWeight: "800",
    color: COLORS.white,
  },
  title: {
    fontSize: "24px",
    fontWeight: "800",
    color: COLORS.textPrimary,
    margin: "0 0 6px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "14px",
    color: COLORS.textTertiary,
    margin: 0,
  },
  errorBox: {
    background: "#FEE2E2",
    border: "1px solid #FECACA",
    color: "#DC2626",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "16px",
    overflow: "hidden",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  input: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.borderLight}`,
    background: COLORS.white,
    fontSize: "14px",
    color: COLORS.textPrimary,
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: COLORS.greenSage,
    color: COLORS.white,
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
    fontFamily: "inherit",
  },
  link: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "14px",
    color: COLORS.textSecondary,
  },
  linkBold: {
    color: COLORS.greenSage,
    fontWeight: "600",
    textDecoration: "none",
  },
  guestNote: {
    textAlign: "center",
    marginTop: "12px",
    fontSize: "13px",
    color: COLORS.textTertiary,
  },
  guestLink: {
    color: COLORS.greenSage,
    fontWeight: "500",
    textDecoration: "none",
  },
};
