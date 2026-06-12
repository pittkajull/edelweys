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
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div style={styles.logoSection}>
          <div style={styles.logo}>
            <span style={styles.logoText}>E</span>
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
                  borderColor: focusedField === field.name ? "#ec4899" : "#e5e7eb",
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
    background: "linear-gradient(180deg, #fdf2f8 0%, #fce7f3 50%, #fdf2f8 100%)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #f3f4f6",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logo: {
    width: "64px",
    height: "64px",
    background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
  },
  logoText: {
    fontSize: "28px",
    fontWeight: "900",
    color: "white",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#1f2937",
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: "15px",
    color: "#6b7280",
    margin: 0,
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
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
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    fontSize: "15px",
    color: "#1f2937",
    outline: "none",
    transition: "border-color 0.2s",
  },
  button: {
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
    transition: "opacity 0.2s",
  },
  link: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "14px",
    color: "#6b7280",
  },
  linkBold: {
    color: "#ec4899",
    fontWeight: "600",
    textDecoration: "none",
  },
};
