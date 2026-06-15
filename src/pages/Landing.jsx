import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../assets/edelweys.png";

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

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Chat Kesehatan",
      desc: "Tanya apa aja soal kesehatan, Edelweys jawab dengan friendly!",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      title: "Dashboard Harian",
      desc: "Pantau berat badan, tekanan darah, dan kebiasaan sehari-hari.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
      ),
    },
    {
      title: "Tips Personal",
      desc: "Dapatkan saran kesehatan yang disesuaikan dengan data kamu.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
    },
  ];

  return (
    <div style={styles.page}>
      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.navLogo}>
            <img src={logo} alt="Edelweys" style={{ height: "28px" }} />
          </div>
          <motion.button
            onClick={() => navigate("/register")}
            style={styles.navCta}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Mulai Gratis
          </motion.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <motion.div
            style={styles.heroBadge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Baru | AI Health Companion kamu
          </motion.div>

          <motion.h1
            style={styles.heroTitle}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Kenalan sama <br />
            <span style={styles.heroHighlight}>Edelweys 🌿</span>
          </motion.h1>

          <motion.p
            style={styles.heroSubtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Teman sehat kamu yang selalu ada, siap bantu kapan aja!
          </motion.p>

          <motion.div
            style={styles.heroButtons}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.button
              onClick={() => navigate("/chat")}
              style={styles.heroCta}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Mulai Chat ✦
            </motion.button>
            <motion.button
              onClick={() => navigate("/dashboard")}
              style={styles.heroSecondary}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Lihat Dashboard
            </motion.button>
          </motion.div>
        </div>

        {/* Floating Icon Cards */}
        <div style={styles.floatingIcons}>
          <motion.div
            style={{ ...styles.iconCard, background: "linear-gradient(135deg, #A8C5A0, #6B9162)", top: "15%", left: "8%" }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </motion.div>
          <motion.div
            style={{ ...styles.iconCard, background: "linear-gradient(135deg, #D4C5A9, #B5A07A)", top: "20%", right: "10%" }}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3" />
            </svg>
          </motion.div>
          <motion.div
            style={{ ...styles.iconCard, background: "linear-gradient(135deg, #C5D5C2, #8EAB85)", bottom: "25%", left: "12%" }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="5" r="3" />
              <path d="M6.5 8a2 2 0 0 0-1.94 1.5L4 22h16l-1.5-12.5A2 2 0 0 0 16.58 8H6.5z" />
            </svg>
          </motion.div>
          <motion.div
            style={{ ...styles.iconCard, background: "linear-gradient(135deg, #E8D5C4, #C4956A)", bottom: "30%", right: "8%" }}
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 5.5, repeat: Infinity }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </motion.div>
        </div>

        {/* Decorative Orbs */}
        <div style={styles.orbsContainer}>
          <div style={{ ...styles.orb, width: 280, height: 280, background: "#B8C9B0", opacity: 0.55 }} />
          <div style={{ ...styles.orb, width: 200, height: 200, background: "#8EAB85", opacity: 0.60 }} />
          <div style={{ ...styles.orb, width: 140, height: 140, background: "#6B9162", opacity: 0.70 }} />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.features}>
        <div style={styles.featuresContent}>
          <motion.p
            style={styles.sectionTag}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            FITUR UNGGULAN
          </motion.p>
          <motion.h2
            style={styles.sectionTitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            Kenapa Pilih Edelweys?
          </motion.h2>
          <div style={styles.featuresGrid}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                style={styles.featureCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div style={styles.featureIcon}>{f.icon}</div>
                <h3 style={styles.featureTitle}>{f.title}</h3>
                <p style={styles.featureDesc}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Big Text Section */}
      <section style={styles.bigText}>
        <motion.h2
          style={styles.bigTextTitle}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          HEALTHY IS{" "}
          <span style={styles.bigTextHighlight}>EASY</span>{" "}
          WHEN YOU HAVE THE RIGHT COMPANION
        </motion.h2>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <motion.h2
          style={styles.ctaTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          Siap Mulai Perjalanan Sehatmu?
        </motion.h2>
        <motion.p
          style={styles.ctaSubtitle}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Bergabung dengan ribuan pengguna yang sudah merasakan manfaatnya
        </motion.p>
        <motion.button
          onClick={() => navigate("/register")}
          style={styles.ctaButton}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Daftar Sekarang - Gratis! ✦
        </motion.button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <img src={logo} alt="Edelweys" style={{ height: "32px", marginBottom: "12px" }} />
          <p style={styles.footerText}>
            Health companion yang selalu ada untuk kamu.
          </p>
          <div style={styles.footerLinks}>
            <a onClick={() => navigate("/login")} style={styles.footerLink}>Login</a>
            <a onClick={() => navigate("/register")} style={styles.footerLink}>Daftar</a>
          </div>
          <p style={styles.footerCopyright}>
            © 2026 Edelweys. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    background: COLORS.bgMain,
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },

  // Navbar
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(238, 238, 233, 0.9)",
    backdropFilter: "blur(10px)",
    borderBottom: `1px solid ${COLORS.borderSoft}`,
  },
  navContent: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navLogo: {
    fontSize: "18px",
    fontWeight: "700",
    color: COLORS.greenForest,
  },
  navLinks: {
    display: "flex",
    gap: "32px",
  },
  navLink: {
    fontSize: "14px",
    fontWeight: "500",
    color: COLORS.textSecondary,
    textDecoration: "none",
    cursor: "pointer",
  },
  navCta: {
    padding: "10px 20px",
    borderRadius: "99px",
    border: "none",
    background: COLORS.greenForest,
    color: COLORS.white,
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  // Hero
  hero: {
    padding: "60px 20px 100px",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
  },
  heroContent: {
    maxWidth: "700px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  heroBadge: {
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: "99px",
    border: `1px solid ${COLORS.borderLight}`,
    background: COLORS.white,
    fontSize: "12px",
    fontWeight: "500",
    color: COLORS.textSecondary,
    marginBottom: "20px",
  },
  heroTitle: {
    fontSize: "clamp(36px, 8vw, 64px)",
    fontWeight: "800",
    color: COLORS.textPrimary,
    lineHeight: "1.05",
    margin: "0 0 20px",
    letterSpacing: "-0.03em",
  },
  heroHighlight: {
    color: COLORS.greenSage,
  },
  heroSubtitle: {
    fontSize: "clamp(16px, 3vw, 20px)",
    color: COLORS.textSecondary,
    lineHeight: "1.6",
    margin: "0 0 32px",
  },
  heroButtons: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  heroCta: {
    padding: "14px 28px",
    borderRadius: "99px",
    border: "none",
    background: COLORS.greenDeep,
    color: COLORS.white,
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(30, 51, 25, 0.25)",
  },
  heroSecondary: {
    padding: "14px 28px",
    borderRadius: "99px",
    border: `2px solid ${COLORS.greenSage}`,
    background: COLORS.white,
    color: COLORS.greenSage,
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
  },

  // Floating Icons
  floatingIcons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    display: "none",
  },
  iconCard: {
    position: "absolute",
    width: "58px",
    height: "58px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(107, 145, 98, 0.25)",
  },

  // Orbs
  orbsContainer: {
    position: "absolute",
    bottom: "-60px",
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    gap: "16px",
    pointerEvents: "none",
  },
  orb: {
    borderRadius: "50%",
    filter: "blur(40px)",
  },

  // Features
  features: {
    padding: "60px 20px",
    background: COLORS.white,
  },
  featuresContent: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  sectionTag: {
    fontSize: "11px",
    fontWeight: "600",
    color: COLORS.greenSage,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: "12px",
  },
  sectionTitle: {
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: "800",
    color: COLORS.textPrimary,
    textAlign: "center",
    margin: "0 0 40px",
    letterSpacing: "-0.02em",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },
  featureCard: {
    background: COLORS.bgMain,
    borderRadius: "12px",
    padding: "36px 32px",
    transition: "all 0.3s ease",
  },
  featureIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "16px",
    background: COLORS.greenSage,
    color: COLORS.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  featureTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: COLORS.textPrimary,
    margin: "0 0 12px",
  },
  featureDesc: {
    fontSize: "15px",
    color: COLORS.textSecondary,
    lineHeight: "1.6",
    margin: 0,
  },

  // Big Text
  bigText: {
    padding: "60px 20px",
    background: COLORS.greenDeep,
    textAlign: "center",
  },
  bigTextTitle: {
    fontSize: "clamp(24px, 5vw, 48px)",
    fontWeight: "800",
    color: COLORS.white,
    lineHeight: "1.2",
    maxWidth: "900px",
    margin: "0 auto",
    letterSpacing: "-0.02em",
  },
  bigTextHighlight: {
    color: COLORS.greenLight,
  },

  // CTA
  ctaSection: {
    padding: "60px 20px",
    textAlign: "center",
    background: COLORS.bgMain,
  },
  ctaTitle: {
    fontSize: "clamp(28px, 5vw, 42px)",
    fontWeight: "800",
    color: COLORS.textPrimary,
    margin: "0 0 16px",
    letterSpacing: "-0.02em",
  },
  ctaSubtitle: {
    fontSize: "16px",
    color: COLORS.textSecondary,
    margin: "0 0 28px",
  },
  ctaButton: {
    padding: "16px 32px",
    borderRadius: "99px",
    border: "none",
    background: COLORS.greenSage,
    color: COLORS.white,
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 8px 24px rgba(107, 145, 98, 0.35)",
  },

  // Footer
  footer: {
    padding: "40px 20px",
    background: COLORS.greenDeep,
    textAlign: "center",
  },
  footerContent: {
    maxWidth: "400px",
    margin: "0 auto",
  },
  footerLogo: {
    fontSize: "18px",
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: "12px",
  },
  footerText: {
    fontSize: "14px",
    color: COLORS.greenLight,
    margin: "0 0 16px",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    marginBottom: "20px",
  },
  footerLink: {
    fontSize: "14px",
    color: COLORS.greenSage,
    cursor: "pointer",
    textDecoration: "none",
    fontWeight: "500",
  },
  footerCopyright: {
    fontSize: "12px",
    color: COLORS.textTertiary,
    margin: 0,
  },
};
