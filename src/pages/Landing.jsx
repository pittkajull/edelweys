import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useRef } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const containerRef = useRef(null);

  const features = [
    {
      title: "Chat Kesehatan",
      desc: "Tanya apa aja soal kesehatan,Edelweys jawab dengan friendly!",
      color: "#FF6B6B",
      emoji: "💬",
    },
    {
      title: "Dashboard Harian",
      desc: "Pantau berat badan, tekanan darah, dan kebiasaan sehari-hari.",
      color: "#4ECDC4",
      emoji: "📊",
    },
    {
      title: "Tips Personal",
      desc: "Dapatkan saran kesehatan yang disesuaikan dengan data kamu.",
      color: "#FFE66D",
      emoji: "✨",
    },
  ];

  const testimonials = [
    { name: "Rina S.", text: "Suka banget sama Edelweys! Jawabannya friendly dan gampang dipahami.", stars: 5 },
    { name: "Budi K.", text: "Dashboard-nya membantu banget buat track pola makan dan olahraga.", stars: 5 },
    { name: "Maya L.", text: "Akhirnya ada chatbot kesehatan yang nggak kaku dan judgemental!", stars: 5 },
  ];

  return (
    <div style={styles.container} ref={containerRef}>
      {/* Floating Elements */}
      <div style={styles.floatingElements}>
        <motion.div
          style={{ ...styles.floatingCircle, background: "#FF6B6B" }}
          animate={{ y: [0, -30, 0], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{ ...styles.floatingCircle, background: "#4ECDC4", width: 60, height: 60, top: "20%", left: "10%" }}
          animate={{ y: [0, 20, 0], x: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{ ...styles.floatingCircle, background: "#FFE66D", width: 80, height: 80, top: "60%", right: "5%" }}
          animate={{ y: [0, -25, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{ ...styles.floatingCircle, background: "#95E1D3", width: 50, height: 50, top: "70%", left: "15%" }}
          animate={{ y: [0, 15, 0], rotate: [0, -20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <motion.p
              style={styles.heroTag}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              HEYY YOWW! 👋
            </motion.p>
            <h1 style={styles.heroTitle}>
              Kenalan sama <br />
              <motion.span
                style={styles.heroHighlight}
                animate={{ color: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#FF6B6B"] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                Edelweys
              </motion.span>
            </h1>
            <p style={styles.heroSubtitle}>
              Teman sehat kamu yang selalu ada, siap bantu kapan aja!
            </p>
            <div style={styles.heroButtons}>
              <motion.button
                onClick={() => navigate("/chat")}
                style={styles.heroCta}
                whileHover={{ scale: 1.05, rotate: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Mulai Chat! 🚀
              </motion.button>
              <motion.button
                onClick={() => navigate("/dashboard")}
                style={styles.heroSecondary}
                whileHover={{ scale: 1.05, rotate: 2 }}
                whileTap={{ scale: 0.95 }}
              >
                Lihat Dashboard 📊
              </motion.button>
            </div>
            <p style={styles.heroNote}>
              ✨ Gratis tanpa login untuk mencoba!
            </p>
          </motion.div>

          <motion.div
            style={styles.heroVisual}
            initial={{ opacity: 0, x: 50, rotate: 5 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
          >
            <div style={styles.chatPreview}>
              <div style={styles.previewHeader}>
                <motion.div
                  style={styles.previewAvatar}
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  E
                </motion.div>
                <div>
                  <p style={styles.previewName}>Edelweys</p>
                  <p style={styles.previewStatus}>● Online</p>
                </div>
              </div>
              <div style={styles.previewMessages}>
                <motion.div
                  style={styles.previewBotMsg}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Heyy yoww! Ada yang bisa aku bantu? 🌸
                </motion.div>
                <motion.div
                  style={styles.previewUserMsg}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  Tips hidup sehat dong!
                </motion.div>
                <motion.div
                  style={styles.previewBotMsg}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  Pasti! Mulai dari tidur cukup, minum air 8 gelas, dan olahraga rutin! 💪
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <motion.p
          style={styles.sectionTag}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          FITUR KECE
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
              style={{
                ...styles.featureCard,
                borderColor: hoveredFeature === i ? f.color : "transparent",
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -10, scale: 1.02 }}
              onHoverStart={() => setHoveredFeature(i)}
              onHoverEnd={() => setHoveredFeature(null)}
            >
              <motion.div
                style={{ ...styles.featureIcon, background: f.color }}
                animate={hoveredFeature === i ? { rotate: [0, -10, 10, 0], scale: 1.2 } : {}}
              >
                {f.emoji}
              </motion.div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Big Text Section */}
      <section style={styles.bigText}>
        <motion.h2
          style={styles.bigTextTitle}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          HEALTHY IS{" "}
          <motion.span
            style={styles.bigTextHighlight}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            EASY
          </motion.span>{" "}
          WHEN YOU HAVE THE RIGHT COMPANION
        </motion.h2>
      </section>

      {/* Testimonials Section */}
      <section style={styles.testimonials}>
        <motion.p
          style={styles.sectionTag}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        >
          APA KATA MEREKA
        </motion.p>
        <motion.h2
          style={styles.sectionTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          Testimoni Pengguna
        </motion.h2>
        <div style={styles.testimonialsGrid}>
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              style={styles.testimonialCard}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -5, rotate: i % 2 === 0 ? 2 : -2 }}
            >
              <div style={styles.testimonialStars}>
                {"⭐".repeat(t.stars)}
              </div>
              <p style={styles.testimonialText}>"{t.text}"</p>
              <p style={styles.testimonialName}>{t.name}</p>
            </motion.div>
          ))}
        </div>
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
          whileHover={{ scale: 1.05, rotate: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          Daftar Sekarang - Gratis! 🎉
        </motion.button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLogo}>
            <div style={styles.footerLogoIcon}>E</div>
            <span style={styles.footerLogoText}>Edelweys</span>
          </div>
          <p style={styles.footerText}>
            Health companion yang selalu ada untuk kamu.
          </p>
          <div style={styles.footerLinks}>
            <motion.a
              onClick={() => navigate("/login")}
              style={styles.footerLink}
              whileHover={{ scale: 1.1 }}
            >
              Login
            </motion.a>
            <motion.a
              onClick={() => navigate("/register")}
              style={styles.footerLink}
              whileHover={{ scale: 1.1 }}
            >
              Daftar
            </motion.a>
          </div>
          <p style={styles.footerCopyright}>
            &copy; 2026 Edelweys. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#FFFEF7",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    overflowX: "hidden",
    position: "relative",
  },
  floatingElements: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: "none",
    zIndex: 0,
  },
  floatingCircle: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: "50%",
    opacity: 0.3,
    filter: "blur(40px)",
    top: "10%",
    right: "20%",
  },

  // Hero
  hero: {
    padding: "80px 24px 100px",
    background: "linear-gradient(180deg, #FFF8E7 0%, #FFFEF7 100%)",
    position: "relative",
    zIndex: 1,
  },
  heroContent: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "60px",
    flexWrap: "wrap",
  },
  heroTag: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#FF6B6B",
    letterSpacing: "0.1em",
    marginBottom: "16px",
  },
  heroTitle: {
    fontSize: "56px",
    fontWeight: "900",
    color: "#1A1A1A",
    lineHeight: "1.1",
    margin: "0 0 20px",
  },
  heroHighlight: {
    color: "#FF6B6B",
    display: "inline-block",
  },
  heroSubtitle: {
    fontSize: "20px",
    color: "#6B7280",
    lineHeight: "1.6",
    margin: "0 0 32px",
    maxWidth: "450px",
  },
  heroButtons: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },
  heroCta: {
    padding: "18px 36px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
    color: "white",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 8px 30px rgba(255, 107, 107, 0.4)",
    fontFamily: "inherit",
  },
  heroSecondary: {
    padding: "18px 36px",
    borderRadius: "16px",
    border: "3px solid #4ECDC4",
    background: "transparent",
    color: "#4ECDC4",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  heroNote: {
    fontSize: "14px",
    color: "#9CA3AF",
    marginTop: "16px",
  },

  // Chat Preview
  heroVisual: {
    flex: "1 1 320px",
    display: "flex",
    justifyContent: "center",
  },
  chatPreview: {
    width: "100%",
    maxWidth: "360px",
    background: "white",
    borderRadius: "28px",
    boxShadow: "0 30px 60px -15px rgba(0, 0, 0, 0.2)",
    overflow: "hidden",
    border: "3px solid #FFE66D",
    transform: "rotate(2deg)",
  },
  previewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "18px 22px",
    background: "linear-gradient(135deg, #FFE66D 0%, #FFF8E7 100%)",
    borderBottom: "2px solid #FFE66D",
  },
  previewAvatar: {
    width: "44px",
    height: "44px",
    background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "900",
    color: "white",
  },
  previewName: {
    margin: 0,
    fontWeight: "700",
    color: "#1A1A1A",
    fontSize: "16px",
  },
  previewStatus: {
    margin: 0,
    fontSize: "12px",
    color: "#4ECDC4",
  },
  previewMessages: {
    padding: "22px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  previewBotMsg: {
    background: "#F9FAFB",
    padding: "14px 18px",
    borderRadius: "18px 18px 18px 6px",
    fontSize: "14px",
    color: "#374151",
    maxWidth: "85%",
    border: "2px solid #F3F4F6",
  },
  previewUserMsg: {
    background: "linear-gradient(135deg, #4ECDC4 0%, #44B09E 100%)",
    padding: "14px 18px",
    borderRadius: "18px 18px 6px 18px",
    fontSize: "14px",
    color: "white",
    maxWidth: "85%",
    marginLeft: "auto",
  },

  // Features
  features: {
    padding: "100px 24px",
    maxWidth: "1100px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  sectionTag: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#FF6B6B",
    letterSpacing: "0.1em",
    textAlign: "center",
    marginBottom: "12px",
  },
  sectionTitle: {
    fontSize: "42px",
    fontWeight: "900",
    color: "#1A1A1A",
    textAlign: "center",
    margin: "0 0 50px",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "28px",
  },
  featureCard: {
    background: "white",
    borderRadius: "24px",
    padding: "36px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
    border: "3px solid transparent",
    transition: "all 0.3s ease",
  },
  featureIcon: {
    width: "70px",
    height: "70px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "32px",
    marginBottom: "20px",
  },
  featureTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#1A1A1A",
    margin: "0 0 12px",
  },
  featureDesc: {
    fontSize: "16px",
    color: "#6B7280",
    lineHeight: "1.6",
    margin: 0,
  },

  // Big Text
  bigText: {
    padding: "100px 24px",
    background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 50%, #FFE66D 100%)",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  bigTextTitle: {
    fontSize: "48px",
    fontWeight: "900",
    color: "white",
    lineHeight: "1.2",
    maxWidth: "900px",
    margin: "0 auto",
    textShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
  },
  bigTextHighlight: {
    color: "#FFE66D",
    display: "inline-block",
  },

  // Testimonials
  testimonials: {
    padding: "100px 24px",
    background: "#FAFAF8",
    position: "relative",
    zIndex: 1,
  },
  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "28px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  testimonialCard: {
    background: "white",
    borderRadius: "24px",
    padding: "36px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
    border: "3px solid #F3F4F6",
  },
  testimonialStars: {
    fontSize: "24px",
    marginBottom: "16px",
  },
  testimonialText: {
    fontSize: "16px",
    color: "#374151",
    lineHeight: "1.7",
    margin: "0 0 20px",
    fontStyle: "italic",
  },
  testimonialName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1A1A1A",
    margin: 0,
  },

  // CTA
  ctaSection: {
    padding: "100px 24px",
    textAlign: "center",
    background: "linear-gradient(180deg, #FFFEF7 0%, #FFF8E7 100%)",
    position: "relative",
    zIndex: 1,
  },
  ctaTitle: {
    fontSize: "42px",
    fontWeight: "900",
    color: "#1A1A1A",
    margin: "0 0 16px",
  },
  ctaSubtitle: {
    fontSize: "20px",
    color: "#6B7280",
    margin: "0 0 36px",
  },
  ctaButton: {
    padding: "20px 48px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #4ECDC4 0%, #44B09E 100%)",
    color: "white",
    fontSize: "20px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 10px 40px rgba(78, 205, 196, 0.4)",
    fontFamily: "inherit",
  },

  // Footer
  footer: {
    padding: "60px 24px",
    background: "#1A1A1A",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  footerContent: {
    maxWidth: "400px",
    margin: "0 auto",
  },
  footerLogo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "20px",
  },
  footerLogoIcon: {
    width: "44px",
    height: "44px",
    background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "900",
    color: "white",
  },
  footerLogoText: {
    fontSize: "22px",
    fontWeight: "800",
    color: "white",
  },
  footerText: {
    fontSize: "16px",
    color: "#9CA3AF",
    margin: "0 0 24px",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "32px",
    marginBottom: "28px",
  },
  footerLink: {
    fontSize: "16px",
    color: "#FF6B6B",
    cursor: "pointer",
    textDecoration: "none",
    fontWeight: "600",
  },
  footerCopyright: {
    fontSize: "14px",
    color: "#6B7280",
    margin: 0,
  },
};
