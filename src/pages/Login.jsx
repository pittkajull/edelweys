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

  // Floating shapes
  const shapes = [
    { size: 350, x: -80, y: -100, opacity: 0.18 },
    { size: 280, x: "75%", y: "55%", opacity: 0.15 },
    { size: 200, x: "15%", y: "65%", opacity: 0.12 },
    { size: 150, x: "85%", y: "15%", opacity: 0.1 },
    { size: 180, x: "50%", y: "80%", opacity: 0.08 },
  ];

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={styles.bgContainer}>
        {shapes.map((shape, i) => (
          <motion.div
            key={i}
            style={{
              ...styles.floatingShape,
              width: shape.size,
              height: shape.size,
              left: typeof shape.x === "number" ? shape.x : shape.x,
              top: typeof shape.y === "number" ? shape.y : shape.y,
              opacity: shape.opacity,
            }}
            animate={{
              y: [0, -20, 0, 20, 0],
              x: [0, 15, 0, -15, 0],
            }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Main Card */}
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Logo */}
        <motion.div
          style={styles.logoSection}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div style={styles.logo}>
            <span style={styles.logoText}>E</span>
          </div>
          <h1 style={styles.title}>Edelweys</h1>
          <p style={styles.subtitle}>Health Companion</p>
        </motion.div>

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
        <form onSubmit={handleLogin} style={styles.form}>
          <motion.div
            style={styles.inputGroup}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label style={styles.label}>Email</label>
            <div style={{
              ...styles.inputWrapper,
              borderColor: focusedField === "email" ? "#D4A574" : "rgba(255,255,255,0.4)",
              boxShadow: focusedField === "email" ? "0 0 20px rgba(212, 165, 116, 0.3)" : "none",
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

          <motion.div
            style={styles.inputGroup}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label style={styles.label}>Password</label>
            <div style={{
              ...styles.inputWrapper,
              borderColor: focusedField === "password" ? "#D4A574" : "rgba(255,255,255,0.4)",
              boxShadow: focusedField === "password" ? "0 0 20px rgba(212, 165, 116, 0.3)" : "none",
            }}>
              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
                style={styles.input}
                required
              />
            </div>
          </motion.div>

          <motion.button
            type="submit"
            style={styles.button}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 40px rgba(212, 165, 116, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            disabled={loading}
          >
            {loading ? "Masuk..." : "Masuk"}
          </motion.button>
        </form>

        <motion.p
          style={styles.link}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Belum punya akun?{" "}
          <Link to="/register" style={styles.linkBold}>
            Daftar di sini
          </Link>
        </motion.p>
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
    background: "linear-gradient(135deg, #FFF8E7 0%, #FFFEF7 25%, #FFF5E1 50%, #FFFEF7 75%, #FFF8E7 100%)",
    backgroundSize: "400% 400%",
    animation: "gradientShift 15s ease infinite",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
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
    background: "radial-gradient(circle, rgba(212,165,116,0.5) 0%, rgba(245,230,163,0.3) 40%, transparent 70%)",
    filter: "blur(50px)",
  },
  card: {
    background: "rgba(255, 255, 255, 0.35)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "28px",
    padding: "48px 44px",
    width: "100%",
    maxWidth: "440px",
    textAlign: "center",
    boxShadow: "0 25px 50px -12px rgba(139, 119, 80, 0.15), 0 8px 20px rgba(212, 165, 116, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    position: "relative",
    zIndex: 10,
  },
  logoSection: {
    marginBottom: "32px",
  },
  logo: {
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, #F5E6A3 0%, #E8D48B 50%, #D4A574 100%)",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    boxShadow: "0 10px 30px rgba(212, 165, 116, 0.4), 0 4px 12px rgba(245, 230, 163, 0.3)",
  },
  logoText: {
    fontSize: "36px",
    fontWeight: "900",
    color: "white",
    textShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  title: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#5D4E37",
    margin: "0 0 8px",
    letterSpacing: "-0.03em",
    textShadow: "0 2px 10px rgba(93, 78, 55, 0.1)",
  },
  subtitle: {
    fontSize: "16px",
    color: "#9C8B7A",
    margin: 0,
    fontWeight: "500",
  },
  errorBox: {
    background: "rgba(254, 215, 215, 0.9)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(252, 165, 165, 0.5)",
    color: "#C53030",
    padding: "14px 18px",
    borderRadius: "14px",
    fontSize: "14px",
    fontWeight: "500",
    marginBottom: "20px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(197, 48, 48, 0.1)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    textAlign: "left",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "700",
    color: "#5D4E37",
    marginBottom: "8px",
  },
  inputWrapper: {
    background: "rgba(255, 255, 255, 0.5)",
    borderRadius: "14px",
    border: "2px solid rgba(212, 165, 116, 0.2)",
    padding: "4px 18px",
    transition: "all 0.3s ease",
    boxShadow: "inset 0 2px 4px rgba(139, 119, 80, 0.05)",
  },
  input: {
    width: "100%",
    padding: "14px 0",
    border: "none",
    background: "transparent",
    fontSize: "16px",
    fontWeight: "500",
    color: "#5D4E37",
    outline: "none",
  },
  button: {
    padding: "18px 32px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #D4A574 0%, #C49A6C 100%)",
    color: "white",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 8px 25px rgba(212, 165, 116, 0.4)",
    transition: "all 0.3s ease",
  },
  link: {
    marginTop: "28px",
    color: "#9C8B7A",
    fontSize: "15px",
    fontWeight: "500",
  },
  linkBold: {
    color: "#D4A574",
    fontWeight: "700",
    textDecoration: "none",
  },
};

// Add keyframes
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
`;
document.head.appendChild(styleSheet);
