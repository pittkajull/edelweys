import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";

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
    <div style={styles.container}>
      {/* Floating Elements */}
      <div style={styles.floatingElements}>
        <motion.div
          style={{ ...styles.floatingShape, background: "#FF6B6B" }}
          animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          style={{ ...styles.floatingShape, background: "#4ECDC4", width: 80, height: 80, top: "20%", left: "10%" }}
          animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          style={{ ...styles.floatingShape, background: "#FFE66D", width: 100, height: 100, bottom: "15%", right: "10%" }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 40, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        {/* Logo */}
        <div style={styles.logoSection}>
          <motion.div
            style={styles.logo}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            E
          </motion.div>
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
          <motion.div
            style={styles.inputGroup}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
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
                borderColor: focusedField === "email" ? "#FF6B6B" : "#E5E7EB",
              }}
              required
            />
          </motion.div>

          <motion.div
            style={styles.inputGroup}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
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
                borderColor: focusedField === "password" ? "#FF6B6B" : "#E5E7EB",
              }}
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            style={styles.button}
            whileHover={{ scale: 1.02, rotate: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            disabled={loading}
          >
            {loading ? "Masuk..." : "Masuk 🚀"}
          </motion.button>
        </form>

        <motion.p
          style={styles.link}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Belum punya akun?{" "}
          <Link to="/register" style={styles.linkBold}>
            Daftar di sini
          </Link>
        </motion.p>

        <motion.p
          style={styles.guestNote}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Atau{" "}
          <Link to="/chat" style={styles.guestLink}>
            coba chat tanpa login
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
    background: "linear-gradient(135deg, #FFF8E7 0%, #FFFEF7 50%, #FFF0F0 100%)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontFamily: "'DM Sans', system-ui, sans-serif",
    overflow: "hidden",
  },
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
  },
  floatingShape: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: "50%",
    opacity: 0.4,
    filter: "blur(50px)",
    top: "10%",
    right: "15%",
  },
  card: {
    background: "white",
    borderRadius: "28px",
    padding: "48px 44px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.15)",
    position: "relative",
    zIndex: 10,
    border: "3px solid #FFE66D",
  },
  logoSection: {
    textAlign: "center",
    marginBottom: "32px",
  },
  logo: {
    width: "80px",
    height: "80px",
    background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
    borderRadius: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
    fontSize: "36px",
    fontWeight: "900",
    color: "white",
    boxShadow: "0 10px 30px rgba(255, 107, 107, 0.4)",
  },
  title: {
    fontSize: "32px",
    fontWeight: "900",
    color: "#1A1A1A",
    margin: "0 0 8px",
  },
  subtitle: {
    fontSize: "16px",
    color: "#6B7280",
    margin: 0,
  },
  errorBox: {
    background: "#FFF0F0",
    border: "2px solid #FF6B6B",
    color: "#FF6B6B",
    padding: "14px 18px",
    borderRadius: "14px",
    fontSize: "14px",
    fontWeight: "600",
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
    fontWeight: "700",
    color: "#374151",
  },
  input: {
    padding: "16px 18px",
    borderRadius: "14px",
    border: "3px solid #E5E7EB",
    background: "#FAFAF8",
    fontSize: "16px",
    color: "#1A1A1A",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  button: {
    padding: "18px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
    color: "white",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 8px 25px rgba(255, 107, 107, 0.4)",
    fontFamily: "inherit",
  },
  link: {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "15px",
    color: "#6B7280",
  },
  linkBold: {
    color: "#FF6B6B",
    fontWeight: "700",
    textDecoration: "none",
  },
  guestNote: {
    textAlign: "center",
    marginTop: "16px",
    fontSize: "14px",
    color: "#9CA3AF",
  },
  guestLink: {
    color: "#4ECDC4",
    fontWeight: "600",
    textDecoration: "none",
  },
};
