import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
      const res = await fetch("http://localhost:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login gagal");

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_id", data.user_id);
      navigate("/dashboard");
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
            <div style={styles.logoIcon}>E</div>
          </motion.div>
          <h1 style={styles.title}>Edelweys</h1>
          <p style={styles.subtitle}>Temen sehat kamu yang selalu ada!</p>
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
        <form onSubmit={handleLogin} style={styles.form}>
          {/* Email Input */}
          <motion.div
            style={styles.inputGroup}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <label style={styles.label}>Email</label>
            <div style={{
              ...styles.inputWrapper,
              borderColor: focusedField === "email" ? "#e91e8c" : "rgba(255,255,255,0.3)",
              boxShadow: focusedField === "email" ? "0 0 20px rgba(233, 30, 140, 0.3)" : "none",
            }}>
              <input
                type="email"
                placeholder="email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                style={styles.input}
                required
              />
            </div>
          </motion.div>

          {/* Password Input */}
          <motion.div
            style={styles.inputGroup}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <label style={styles.label}>Password</label>
            <div style={{
              ...styles.inputWrapper,
              borderColor: focusedField === "password" ? "#e91e8c" : "rgba(255,255,255,0.3)",
              boxShadow: focusedField === "password" ? "0 0 20px rgba(233, 30, 140, 0.3)" : "none",
            }}>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                style={styles.input}
                required
              />
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            style={styles.button}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(233, 30, 140, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
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
              "Masuk"
            )}
          </motion.button>
        </form>

        {/* Register Link */}
        <motion.p
          style={styles.link}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          Belum punya akun?{" "}
          <Link to="/register" style={styles.linkHighlight}>
            Daftar di sini
          </Link>
        </motion.p>
      </motion.div>

      {/* Footer */}
      <motion.p
        style={styles.footer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
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
    background: "rgba(255, 255, 255, 0.3)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "28px",
    padding: "40px 44px",
    width: "100%",
    maxWidth: "480px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    position: "relative",
    zIndex: 10,
  },
  header: {
    marginBottom: "28px",
  },
  logoContainer: {
    marginBottom: "12px",
    display: "inline-block",
  },
  logoIcon: {
    width: "70px",
    height: "70px",
    background: "linear-gradient(135deg, #e91e8c 0%, #f06292 100%)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    fontWeight: "900",
    color: "white",
    boxShadow: "0 8px 25px rgba(233, 30, 140, 0.4)",
  },
  title: {
    fontSize: "40px",
    fontWeight: "800",
    color: "#e91e8c",
    margin: "0 0 8px",
    letterSpacing: "-0.03em",
    textShadow: "0 4px 15px rgba(233, 30, 140, 0.4)",
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
    gap: "18px",
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
    background: "rgba(255, 255, 255, 0.25)",
    borderRadius: "16px",
    border: "2px solid rgba(255, 255, 255, 0.35)",
    padding: "4px 18px",
    transition: "all 0.3s ease",
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
    padding: "16px 32px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #e91e8c 0%, #f06292 100%)",
    color: "white",
    fontSize: "17px",
    fontWeight: "800",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 6px 25px rgba(233, 30, 140, 0.35)",
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
    marginTop: "24px",
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
