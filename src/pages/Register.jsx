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

  // Floating shapes for background animation
  const shapes = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    size: Math.random() * 100 + 50,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 15,
  }));

  const inputFields = [
    { name: "full_name", label: "Nama Lengkap", icon: "👤", placeholder: "John Doe", type: "text" },
    { name: "username", label: "Username", icon: "✨", placeholder: "johndoe", type: "text" },
    { name: "email", label: "Email", icon: "📧", placeholder: "email@domain.com", type: "email" },
    { name: "password", label: "Password", icon: "🔒", placeholder: "••••••••", type: "password" },
  ];

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.bgContainer}>
        {shapes.map((shape) => (
          <motion.div
            key={shape.id}
            style={{
              ...styles.floatingShape,
              width: shape.size,
              height: shape.size,
              left: `${shape.x}%`,
              top: `${shape.y}%`,
            }}
            animate={{
              y: [0, -30, 0, 30, 0],
              x: [0, 20, 0, -20, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main Card */}
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo & Title */}
        <motion.div
          style={styles.header}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            style={styles.logoContainer}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🌸
          </motion.div>
          <h1 style={styles.title}>Edelweys</h1>
          <p style={styles.subtitle}>Daftar & mulai perjalanan sehatmu!</p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              style={styles.errorContainer}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p style={styles.error}>{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleRegister} style={styles.form}>
          {inputFields.map((field, index) => (
            <motion.div
              key={field.name}
              style={styles.inputGroup}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.4 }}
            >
              <label style={styles.label}>{field.label}</label>
              <div style={{
                ...styles.inputWrapper,
                borderColor: focusedField === field.name ? "#e91e8c" : "rgba(255,255,255,0.3)",
                boxShadow: focusedField === field.name ? "0 0 20px rgba(233, 30, 140, 0.3)" : "none",
              }}>
                <span style={styles.inputIcon}>{field.icon}</span>
                <input
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={form[field.name]}
                  onChange={handleChange}
                  onFocus={() => setFocusedField(field.name)}
                  onBlur={() => setFocusedField(null)}
                  style={styles.input}
                  required
                />
              </div>
            </motion.div>
          ))}

          {/* Submit Button */}
          <motion.button
            type="submit"
            style={styles.button}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(233, 30, 140, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            disabled={loading}
          >
            {loading ? (
              <motion.div
                style={styles.loadingContainer}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <div style={styles.spinner} />
              </motion.div>
            ) : (
              "Daftar Sekarang 🚀"
            )}
          </motion.button>
        </form>

        {/* Login Link */}
        <motion.p
          style={styles.link}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.4 }}
        >
          Udah punya akun?{" "}
          <Link to="/login" style={styles.linkHighlight}>
            Login di sini
          </Link>
        </motion.p>
      </motion.div>

      {/* Footer */}
      <motion.p
        style={styles.footer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
      >
        heyy yoww! Stay healthy, stay happy! 🌿
      </motion.p>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #fce4ec 0%, #f8bbd0 25%, #e1bee7 50%, #f8bbd0 75%, #fce4ec 100%)",
    backgroundSize: "400% 400%",
    animation: "gradientShift 15s ease infinite",
    padding: "20px",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    margin: 0,
  },
  bgContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  floatingShape: {
    position: "absolute",
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  card: {
    background: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "40px",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
    position: "relative",
    zIndex: 10,
  },
  header: {
    marginBottom: "24px",
  },
  logoContainer: {
    fontSize: "64px",
    marginBottom: "16px",
    display: "inline-block",
  },
  title: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#e91e8c",
    margin: "0 0 8px",
    letterSpacing: "-0.02em",
    textShadow: "0 2px 10px rgba(233, 30, 140, 0.3)",
  },
  subtitle: {
    fontSize: "16px",
    color: "rgba(255, 255, 255, 0.9)",
    margin: 0,
    fontWeight: "500",
  },
  errorContainer: {
    marginBottom: "16px",
    overflow: "hidden",
  },
  error: {
    background: "rgba(239, 68, 68, 0.9)",
    color: "white",
    padding: "12px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "600",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    textAlign: "left",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: "8px",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "16px",
    border: "2px solid rgba(255, 255, 255, 0.3)",
    padding: "4px 16px",
    transition: "all 0.3s ease",
  },
  inputIcon: {
    fontSize: "20px",
    marginRight: "12px",
  },
  input: {
    flex: 1,
    padding: "14px 0",
    border: "none",
    background: "transparent",
    fontSize: "16px",
    fontWeight: "600",
    color: "white",
    outline: "none",
  },
  button: {
    padding: "18px 32px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #e91e8c 0%, #f06292 100%)",
    color: "white",
    fontSize: "18px",
    fontWeight: "800",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 4px 20px rgba(233, 30, 140, 0.3)",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "24px",
    height: "24px",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
  },
  link: {
    marginTop: "20px",
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: "15px",
    fontWeight: "500",
  },
  linkHighlight: {
    color: "white",
    fontWeight: "700",
    textDecoration: "none",
    borderBottom: "2px solid white",
    paddingBottom: "2px",
  },
  footer: {
    marginTop: "32px",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "14px",
    fontWeight: "500",
    zIndex: 10,
  },
};

// Add keyframes animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;
document.head.appendChild(styleSheet);
