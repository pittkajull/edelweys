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

  return (
    <div style={styles.container}>
      {/* Background decoration */}
      <div style={styles.bgDecoration}>
        <div style={styles.circle1} />
        <div style={styles.circle2} />
        <div style={styles.circle3} />
      </div>

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
          <p style={styles.subtitle}>Health Companion</p>
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
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.input,
                borderColor: focusedField === "email" ? "#D4A574" : "#E8DFD5",
                background: focusedField === "email" ? "#FFFEF7" : "#FAF8F5",
              }}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              style={{
                ...styles.input,
                borderColor: focusedField === "password" ? "#D4A574" : "#E8DFD5",
                background: focusedField === "password" ? "#FFFEF7" : "#FAF8F5",
              }}
              required
            />
          </div>

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <p style={styles.link}>
          Belum punya akun?{" "}
          <Link to="/register" style={styles.linkBold}>
            Daftar di sini
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
    background: "linear-gradient(135deg, #FFFEF7 0%, #FFF8E7 50%, #FFFEF7 100%)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    overflow: "hidden",
  },
  bgDecoration: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
    pointerEvents: "none",
  },
  circle1: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,215,0,0.08) 0%, transparent 70%)",
    top: "-100px",
    right: "-100px",
  },
  circle2: {
    position: "absolute",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 70%)",
    bottom: "-50px",
    left: "-50px",
  },
  circle3: {
    position: "absolute",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(212,165,116,0.08) 0%, transparent 70%)",
    top: "50%",
    left: "10%",
  },
  card: {
    background: "white",
    borderRadius: "24px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 4px 24px rgba(139, 119, 80, 0.08)",
    border: "1px solid #F0EBE3",
    position: "relative",
    zIndex: 10,
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "36px",
  },
  logo: {
    width: "72px",
    height: "72px",
    background: "linear-gradient(135deg, #F5E6A3 0%, #E8D48B 50%, #D4A574 100%)",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    boxShadow: "0 4px 16px rgba(212, 165, 116, 0.3)",
  },
  logoText: {
    fontSize: "32px",
    fontWeight: "800",
    color: "white",
    textShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#5D4E37",
    margin: "0 0 8px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "15px",
    color: "#9C8B7A",
    margin: 0,
    fontWeight: "500",
  },
  errorBox: {
    background: "#FFF5F5",
    border: "1px solid #FED7D7",
    color: "#C53030",
    padding: "12px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    marginBottom: "20px",
    overflow: "hidden",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#5D4E37",
  },
  input: {
    padding: "14px 18px",
    borderRadius: "12px",
    border: "1.5px solid #E8DFD5",
    background: "#FAF8F5",
    fontSize: "15px",
    color: "#5D4E37",
    outline: "none",
    transition: "all 0.2s",
  },
  button: {
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #D4A574 0%, #C49A6C 100%)",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 4px 12px rgba(212, 165, 116, 0.3)",
    transition: "all 0.2s",
  },
  link: {
    textAlign: "center",
    marginTop: "28px",
    fontSize: "14px",
    color: "#9C8B7A",
  },
  linkBold: {
    color: "#D4A574",
    fontWeight: "600",
    textDecoration: "none",
  },
};
