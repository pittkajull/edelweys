import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
      const res = await fetch("http://localhost:8000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registrasi gagal");

      navigate("/login");
    } catch (err) {
      setError(err.message);
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
      {/* Edelweiss flower motif */}
      <div style={styles.flowerMotif}>
        <svg viewBox="0 0 200 200" style={styles.flowerSvg}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <ellipse
              key={i}
              cx="100"
              cy="100"
              rx="25"
              ry="60"
              fill="rgba(255,255,255,0.15)"
              transform={`rotate(${angle} 100 100)`}
            />
          ))}
          <circle cx="100" cy="100" r="20" fill="rgba(232,197,71,0.2)" />
        </svg>
      </div>

      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div style={styles.logoSection}>
          <div style={styles.logo}>
            <svg viewBox="0 0 40 40" style={styles.logoSvg}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <ellipse
                  key={i}
                  cx="20"
                  cy="20"
                  rx="4"
                  ry="10"
                  fill="white"
                  transform={`rotate(${angle} 20 20)`}
                />
              ))}
              <circle cx="20" cy="20" r="5" fill="#E8C547" />
            </svg>
          </div>
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
                  borderColor: focusedField === field.name ? "#8FBC8F" : "#E8E4DF",
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
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <p style={styles.link}>
          Sudah punya akun?{" "}
          <Link to="/login" style={styles.linkBold}>
            Masuk di sini
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
    background: "#F8F6F3",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    overflow: "hidden",
  },
  flowerMotif: {
    position: "absolute",
    bottom: "-15%",
    left: "-8%",
    width: "500px",
    height: "500px",
    opacity: 0.5,
    pointerEvents: "none",
  },
  flowerSvg: {
    width: "100%",
    height: "100%",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "44px 40px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
    position: "relative",
    zIndex: 10,
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logo: {
    width: "56px",
    height: "56px",
    background: "#2D5A3D",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  logoSvg: {
    width: "32px",
    height: "32px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#1A1A1A",
    margin: "0 0 6px",
    fontFamily: "'Playfair Display', Georgia, serif",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
    margin: 0,
    fontWeight: "400",
  },
  errorBox: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#DC2626",
    padding: "12px 16px",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "20px",
    overflow: "hidden",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#374151",
    letterSpacing: "0.02em",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1.5px solid #E8E4DF",
    background: "#FAFAF8",
    fontSize: "15px",
    color: "#1A1A1A",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  button: {
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#2D5A3D",
    color: "white",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "8px",
    transition: "background 0.2s",
    fontFamily: "inherit",
  },
  link: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "14px",
    color: "#6B7280",
  },
  linkBold: {
    color: "#2D5A3D",
    fontWeight: "500",
    textDecoration: "none",
  },
};
