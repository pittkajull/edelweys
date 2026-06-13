import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Chat Kesehatan",
      desc: "Tanya apa aja soal kesehatan, Edelweys jawab dengan friendly!",
      icon: "💬",
    },
    {
      title: "Dashboard Harian",
      desc: "Pantau berat badan, tekanan darah, dan kebiasaan sehari-hari.",
      icon: "📊",
    },
    {
      title: "Tips Personal",
      desc: "Dapatkan saran kesehatan yang disesuaikan dengan data kamu.",
      icon: "✨",
    },
  ];

  const testimonials = [
    {
      name: "Rina S.",
      text: "Suka banget sama Edelweys! Jawabannya friendly dan gampang dipahami.",
      stars: 5,
    },
    {
      name: "Budi K.",
      text: "Dashboard-nya membantu banget buat track pola makan dan olahraga.",
      stars: 5,
    },
    {
      name: "Maya L.",
      text: "Akhirnya ada chatbot kesehatan yang nggak kaku dan judgemental!",
      stars: 5,
    },
  ];

  return (
    <div style={styles.container}>
      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p style={styles.heroTag}>HEALTH COMPANION</p>
            <h1 style={styles.heroTitle}>
              Kenalan sama <span style={styles.heroHighlight}>Edelweys</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Teman sehat kamu yang selalu ada, siap bantu kapan aja!
            </p>
            <div style={styles.heroButtons}>
              <button
                onClick={() => navigate("/register")}
                style={styles.heroCta}
              >
                Mulai Gratis
              </button>
              <button
                onClick={() => navigate("/login")}
                style={styles.heroSecondary}
              >
                Sudah punya akun?
              </button>
            </div>
          </motion.div>

          <motion.div
            style={styles.heroVisual}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div style={styles.chatPreview}>
              <div style={styles.previewHeader}>
                <div style={styles.previewAvatar}>E</div>
                <div>
                  <p style={styles.previewName}>Edelweys</p>
                  <p style={styles.previewStatus}>Online</p>
                </div>
              </div>
              <div style={styles.previewMessages}>
                <div style={styles.previewBotMsg}>
                  Heyy yoww! Ada yang bisa aku bantu hari ini?
                </div>
                <div style={styles.previewUserMsg}>
                  Tips hidup sehat dong!
                </div>
                <div style={styles.previewBotMsg}>
                  Pasti! Mulai dari tidur yang cukup, minum air 8 gelas sehari, dan olahraga rutin ya!
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <p style={styles.sectionTag}>FITUR UNGGULAN</p>
        <h2 style={styles.sectionTitle}>Kenapa Pilih Edelweys?</h2>
        <div style={styles.featuresGrid}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              style={styles.featureCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div style={styles.featureIcon}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Big Text Section */}
      <section style={styles.bigText}>
        <h2 style={styles.bigTextTitle}>
          HEALTHY IS <span style={styles.bigTextHighlight}>EASY</span> WHEN YOU HAVE THE RIGHT COMPANION
        </h2>
      </section>

      {/* Testimonials Section */}
      <section style={styles.testimonials}>
        <p style={styles.sectionTag}>APA KATA MEREKA</p>
        <h2 style={styles.sectionTitle}>Testimoni Pengguna</h2>
        <div style={styles.testimonialsGrid}>
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              style={styles.testimonialCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div style={styles.testimonialStars}>
                {"★".repeat(t.stars)}
              </div>
              <p style={styles.testimonialText}>"{t.text}"</p>
              <p style={styles.testimonialName}>{t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Siap Mulai Perjalanan Sehatmu?</h2>
        <p style={styles.ctaSubtitle}>
          Bergabung dengan ribuan pengguna yang sudah merasakan manfaatnya
        </p>
        <button
          onClick={() => navigate("/register")}
          style={styles.ctaButton}
        >
          Daftar Sekarang - Gratis!
        </button>
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
            <a onClick={() => navigate("/login")} style={styles.footerLink}>Login</a>
            <a onClick={() => navigate("/register")} style={styles.footerLink}>Daftar</a>
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
  },

  // Hero
  hero: {
    padding: "60px 24px 80px",
    background: "linear-gradient(180deg, #FFF8E7 0%, #FFFEF7 100%)",
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
    fontSize: "12px",
    fontWeight: "600",
    color: "#D4A574",
    letterSpacing: "0.1em",
    marginBottom: "16px",
  },
  heroTitle: {
    fontSize: "48px",
    fontWeight: "800",
    color: "#1A1A1A",
    lineHeight: "1.1",
    margin: "0 0 20px",
  },
  heroHighlight: {
    color: "#D4A574",
  },
  heroSubtitle: {
    fontSize: "18px",
    color: "#6B7280",
    lineHeight: "1.6",
    margin: "0 0 32px",
    maxWidth: "400px",
  },
  heroButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  heroCta: {
    padding: "16px 32px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #D4A574 0%, #C49A6C 100%)",
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 8px 25px rgba(212, 165, 116, 0.4)",
    fontFamily: "inherit",
  },
  heroSecondary: {
    padding: "16px 32px",
    borderRadius: "12px",
    border: "2px solid #D4A574",
    background: "transparent",
    color: "#D4A574",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  // Chat Preview
  heroVisual: {
    flex: "1 1 300px",
    display: "flex",
    justifyContent: "center",
  },
  chatPreview: {
    width: "100%",
    maxWidth: "340px",
    background: "white",
    borderRadius: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
    overflow: "hidden",
    border: "1px solid #F3F4F6",
  },
  previewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 20px",
    background: "#FAFAF8",
    borderBottom: "1px solid #F3F4F6",
  },
  previewAvatar: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #F5E6A3 0%, #D4A574 100%)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "800",
    color: "white",
  },
  previewName: {
    margin: 0,
    fontWeight: "600",
    color: "#1A1A1A",
    fontSize: "14px",
  },
  previewStatus: {
    margin: 0,
    fontSize: "11px",
    color: "#68D391",
  },
  previewMessages: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  previewBotMsg: {
    background: "#F9FAFB",
    padding: "12px 16px",
    borderRadius: "16px 16px 16px 4px",
    fontSize: "13px",
    color: "#374151",
    maxWidth: "85%",
    border: "1px solid #F3F4F6",
  },
  previewUserMsg: {
    background: "linear-gradient(135deg, #D4A574 0%, #C49A6C 100%)",
    padding: "12px 16px",
    borderRadius: "16px 16px 4px 16px",
    fontSize: "13px",
    color: "white",
    maxWidth: "85%",
    marginLeft: "auto",
  },

  // Features
  features: {
    padding: "80px 24px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  sectionTag: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#D4A574",
    letterSpacing: "0.1em",
    textAlign: "center",
    marginBottom: "12px",
  },
  sectionTitle: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    margin: "0 0 48px",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
  },
  featureCard: {
    background: "white",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
    border: "1px solid #F3F4F6",
  },
  featureIcon: {
    fontSize: "40px",
    marginBottom: "16px",
  },
  featureTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1A1A1A",
    margin: "0 0 12px",
  },
  featureDesc: {
    fontSize: "15px",
    color: "#6B7280",
    lineHeight: "1.6",
    margin: 0,
  },

  // Big Text
  bigText: {
    padding: "80px 24px",
    background: "linear-gradient(135deg, #D4A574 0%, #C49A6C 100%)",
    textAlign: "center",
  },
  bigTextTitle: {
    fontSize: "40px",
    fontWeight: "800",
    color: "white",
    lineHeight: "1.2",
    margin: 0,
    maxWidth: "800px",
    margin: "0 auto",
  },
  bigTextHighlight: {
    color: "#FFF8E7",
  },

  // Testimonials
  testimonials: {
    padding: "80px 24px",
    background: "#FAFAF8",
  },
  testimonialsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "24px",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  testimonialCard: {
    background: "white",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
    border: "1px solid #F3F4F6",
  },
  testimonialStars: {
    fontSize: "20px",
    color: "#F59E0B",
    marginBottom: "16px",
  },
  testimonialText: {
    fontSize: "15px",
    color: "#374151",
    lineHeight: "1.6",
    margin: "0 0 16px",
    fontStyle: "italic",
  },
  testimonialName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1A1A1A",
    margin: 0,
  },

  // CTA
  ctaSection: {
    padding: "80px 24px",
    textAlign: "center",
    background: "linear-gradient(180deg, #FFFEF7 0%, #FFF8E7 100%)",
  },
  ctaTitle: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#1A1A1A",
    margin: "0 0 16px",
  },
  ctaSubtitle: {
    fontSize: "18px",
    color: "#6B7280",
    margin: "0 0 32px",
  },
  ctaButton: {
    padding: "18px 40px",
    borderRadius: "12px",
    border: "none",
    background: "linear-gradient(135deg, #D4A574 0%, #C49A6C 100%)",
    color: "white",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 8px 30px rgba(212, 165, 116, 0.4)",
    fontFamily: "inherit",
  },

  // Footer
  footer: {
    padding: "48px 24px",
    background: "#1A1A1A",
    textAlign: "center",
  },
  footerContent: {
    maxWidth: "400px",
    margin: "0 auto",
  },
  footerLogo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  footerLogoIcon: {
    width: "36px",
    height: "36px",
    background: "linear-gradient(135deg, #F5E6A3 0%, #D4A574 100%)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "800",
    color: "white",
  },
  footerLogoText: {
    fontSize: "18px",
    fontWeight: "700",
    color: "white",
  },
  footerText: {
    fontSize: "14px",
    color: "#9CA3AF",
    margin: "0 0 20px",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "24px",
    marginBottom: "24px",
  },
  footerLink: {
    fontSize: "14px",
    color: "#D4A574",
    cursor: "pointer",
    textDecoration: "none",
  },
  footerCopyright: {
    fontSize: "12px",
    color: "#6B7280",
    margin: 0,
  },
};
