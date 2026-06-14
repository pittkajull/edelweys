import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/edelweys.png";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

const calcBMI = (weight, height) => {
  if (!weight || !height || height === 0) return null;
  return (weight / ((height / 100) ** 2)).toFixed(1);
};

const bmiCategory = (bmi) => {
  if (!bmi) return { label: "-", color: COLORS.textTertiary, bg: "#F3F4F6" };
  const b = parseFloat(bmi);
  if (b < 18.5) return { label: "Kurang", color: "#3B82F6", bg: "#EFF6FF" };
  if (b < 25) return { label: "Normal", color: COLORS.greenSage, bg: "#F0FDF4" };
  if (b < 30) return { label: "Berlebih", color: "#F59E0B", bg: "#FFFBEB" };
  return { label: "Obesitas", color: "#EF4444", bg: "#FEF2F2" };
};

const fmt = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

const MetricCard = ({ label, value, unit, sub, color = COLORS.greenSage, bg = "#F0FDF4" }) => (
  <div style={metricStyles.card}>
    <p style={metricStyles.label}>{label}</p>
    <div style={metricStyles.valueRow}>
      <span style={metricStyles.value}>{value ?? "-"}</span>
      {unit && <span style={metricStyles.unit}>{unit}</span>}
    </div>
    {sub && (
      <span style={{ ...metricStyles.badge, color, background: bg }}>
        {sub}
      </span>
    )}
  </div>
);

const metricStyles = {
  card: {
    background: COLORS.white,
    borderRadius: "12px",
    padding: "20px",
    border: `1px solid ${COLORS.borderSoft}`,
  },
  label: {
    fontSize: "11px",
    fontWeight: "600",
    color: COLORS.textTertiary,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    margin: "0 0 8px",
  },
  valueRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "4px",
  },
  value: {
    fontSize: "28px",
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: "-0.02em",
  },
  unit: {
    fontSize: "14px",
    color: COLORS.textTertiary,
    fontWeight: "500",
  },
  badge: {
    display: "inline-block",
    marginTop: "8px",
    padding: "3px 10px",
    borderRadius: "99px",
    fontSize: "11px",
    fontWeight: "600",
  },
};

const InputField = ({ label, name, value, onChange, type = "number", placeholder, min, max, step = "0.1" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={{ fontSize: "12px", fontWeight: "600", color: COLORS.textPrimary }}>{label}</label>
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} min={min} max={max} step={step}
      style={{
        border: `1px solid ${COLORS.borderLight}`, borderRadius: "10px", padding: "10px 14px",
        fontSize: "14px", fontWeight: "500", color: COLORS.textPrimary,
        outline: "none", background: COLORS.white, width: "100%", boxSizing: "border-box",
        fontFamily: "inherit",
      }}
    />
  </div>
);

const Chip = ({ label, color = COLORS.greenSage, bg = "#F0FDF4" }) => (
  <span style={{
    background: bg, color, borderRadius: "99px",
    padding: "4px 10px", fontSize: "12px", fontWeight: "500",
  }}>{label}</span>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState(null);

  const today = new Date().toISOString().split("T")[0];
  const emptyForm = {
    date: today, weight: "", height: "",
    systolic: "", diastolic: "",
    coffee_cups: "", exercise_minutes: "",
    water_glasses: "", sleep_hours: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }
      setUser(session.user);

      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      setProfile(prof);

      const { data: hlogs } = await supabase
        .from("health_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .order("date", { ascending: false })
        .limit(30);
      setLogs(hlogs || []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.weight && !form.height) {
      showToast("Isi minimal berat atau tinggi badan!", "error");
      return;
    }
    setSaving(true);

    const bmi = calcBMI(form.weight, form.height);
    const blood_pressure = form.systolic && form.diastolic
      ? `${form.systolic}/${form.diastolic}` : null;

    const payload = {
      user_id: user.id,
      date: form.date,
      weight: form.weight ? parseFloat(form.weight) : null,
      height: form.height ? parseFloat(form.height) : null,
      bmi: bmi ? parseFloat(bmi) : null,
      blood_pressure,
      coffee_cups: form.coffee_cups ? parseInt(form.coffee_cups) : null,
      exercise_minutes: form.exercise_minutes ? parseInt(form.exercise_minutes) : null,
      water_glasses: form.water_glasses ? parseInt(form.water_glasses) : null,
      sleep_hours: form.sleep_hours ? parseFloat(form.sleep_hours) : null,
    };

    const { error } = await supabase
      .from("health_logs")
      .upsert(payload, { onConflict: "user_id,date" });

    if (error) {
      showToast("Gagal simpan, coba lagi!", "error");
    } else {
      showToast("Data kesehatan berhasil disimpan!");
      const { data: hlogs } = await supabase
        .from("health_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false })
        .limit(30);
      setLogs(hlogs || []);
      setActiveTab("overview");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const latest = logs[0] || null;
  const latestBMI = latest?.bmi ?? (latest ? calcBMI(latest.weight, latest.height) : null);
  const bmiInfo = bmiCategory(latestBMI);

  const chartData = [...logs]
    .reverse()
    .slice(-14)
    .map(l => ({
      date: fmt(l.date),
      Berat: l.weight,
      Tidur: l.sleep_hours,
      Olahraga: l.exercise_minutes,
    }));

  if (loading) return (
    <div style={loadingStyles.container}>
      <div style={loadingStyles.spinner} />
      <p style={loadingStyles.text}>Memuat dashboard...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              ...toastStyles.base,
              background: toast.type === "error" ? "#DC2626" : COLORS.greenSage,
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.greeting}>Selamat datang kembali,</p>
          <h1 style={styles.userName}>{profile?.full_name || "User"} 🌿</h1>
        </div>
        <div style={styles.headerButtons}>
          <button onClick={() => navigate("/chat")} style={styles.chatBtn}>
            Chat
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        {[
          { id: "overview", label: "Overview" },
          { id: "input", label: "Input Data" },
          { id: "history", label: "Riwayat" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              background: activeTab === tab.id ? COLORS.greenForest : "transparent",
              color: activeTab === tab.id ? COLORS.white : COLORS.textSecondary,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={styles.tabContent}>
            {!latest && (
              <div style={styles.emptyState}>
                <p style={styles.emptyTitle}>Belum ada data kesehatan</p>
                <p style={styles.emptyDesc}>Mulai catat data kesehatanmu untuk melihat overview</p>
                <button onClick={() => setActiveTab("input")} style={styles.emptyBtn}>
                  Input Data Sekarang
                </button>
              </div>
            )}

            {latest && (
              <>
                <section>
                  <p style={styles.sectionLabel}>Data Terakhir — {fmt(latest.date)}</p>
                  <div style={styles.metricGrid}>
                    <MetricCard label="Berat Badan" value={latest.weight} unit="kg" />
                    <MetricCard label="Tinggi Badan" value={latest.height} unit="cm" />
                    <MetricCard label="BMI" value={latestBMI} sub={bmiInfo.label} color={bmiInfo.color} bg={bmiInfo.bg} />
                    {latest.blood_pressure && (
                      <MetricCard label="Tekanan Darah" value={latest.blood_pressure} unit="mmHg" color="#EF4444" bg="#FEF2F2" />
                    )}
                  </div>
                </section>

                <section>
                  <p style={styles.sectionLabel}>Kebiasaan Harian</p>
                  <div style={styles.habitsGrid}>
                    {[
                      { label: "Air Putih", val: `${latest.water_glasses ?? 0}/8`, ok: (latest.water_glasses ?? 0) >= 8 },
                      { label: "Olahraga", val: `${latest.exercise_minutes ?? 0}/60m`, ok: (latest.exercise_minutes ?? 0) >= 30 },
                      { label: "Tidur", val: `${latest.sleep_hours ?? 0}/8j`, ok: (latest.sleep_hours ?? 0) >= 7 },
                      { label: "Kopi", val: `${latest.coffee_cups ?? 0}/3`, ok: (latest.coffee_cups ?? 0) <= 3 },
                    ].map(item => (
                      <div key={item.label} style={{
                        ...styles.habitItem,
                        borderColor: item.ok ? COLORS.greenSage : COLORS.borderSoft,
                      }}>
                        <span style={styles.habitLabel}>{item.label}</span>
                        <span style={{ ...styles.habitValue, color: item.ok ? COLORS.greenSage : COLORS.textTertiary }}>
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {chartData.length > 1 && (
                  <section>
                    <p style={styles.sectionLabel}>Tren 14 Hari</p>
                    <div style={styles.chartCard}>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={chartData} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.borderSoft} />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: COLORS.textTertiary }} />
                          <YAxis tick={{ fontSize: 11, fill: COLORS.textTertiary }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="Berat" stroke={COLORS.greenSage} strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                )}

                {/* Saran Edelweys */}
                <div style={styles.saranCard}>
                  <div style={styles.saranHeader}>
                    <div style={styles.saranAvatar}>
                      <img src={logo} alt="E" style={{ width: "18px", height: "18px" }} />
                    </div>
                    <span style={styles.saranLabel}>SARAN EDELWEYS</span>
                  </div>
                  <p style={styles.saranText}>
                    {latest.water_glasses < 8
                      ? "Jangan lupa minum air putih yang cukup ya! Target 8 gelas sehari."
                      : latest.exercise_minutes < 30
                        ? "Coba tambah waktu olahragamu minimal 30 menit sehari ya!"
                        : "Kamu udah doing great! Pertahankan pola hidup sehatmu! 💪"}
                  </p>
                </div>

                <button onClick={() => setActiveTab("input")} style={styles.fullBtn}>
                  Update Data Hari Ini
                </button>
              </>
            )}
          </div>
        )}

        {/* INPUT TAB */}
        {activeTab === "input" && (
          <div style={styles.tabContent}>
            <div style={styles.inputBanner}>
              <p style={styles.inputBannerTitle}>Catat kondisi kesehatanmu hari ini</p>
              <p style={styles.inputBannerDesc}>Data yang kamu isi membantu Edelweys memberikan saran personal</p>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.inputLabel}>Tanggal</label>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                style={styles.dateInput}
              />
            </div>

            <div>
              <p style={styles.sectionLabel}>1. Data Tubuh</p>
              <div style={styles.inputGrid}>
                <InputField label="Berat Badan (kg)" name="weight" value={form.weight}
                  onChange={handleChange} placeholder="65" min={30} max={200} />
                <InputField label="Tinggi Badan (cm)" name="height" value={form.height}
                  onChange={handleChange} placeholder="165" min={100} max={250} />
              </div>
            </div>

            <div>
              <p style={styles.sectionLabel}>2. Tekanan Darah <span style={{ color: COLORS.textTertiary, fontWeight: 400 }}>(opsional)</span></p>
              <div style={styles.inputGrid}>
                <InputField label="Sistolik" name="systolic" value={form.systolic}
                  onChange={handleChange} placeholder="120" min={60} max={200} step={1} />
                <InputField label="Diastolik" name="diastolic" value={form.diastolic}
                  onChange={handleChange} placeholder="80" min={40} max={130} step={1} />
              </div>
            </div>

            <div>
              <p style={styles.sectionLabel}>3. Kebiasaan Harian</p>
              <div style={styles.inputGrid}>
                <InputField label="Air Putih (gelas)" name="water_glasses" value={form.water_glasses}
                  onChange={handleChange} placeholder="8" min={0} max={20} step={1} />
                <InputField label="Kopi (cangkir)" name="coffee_cups" value={form.coffee_cups}
                  onChange={handleChange} placeholder="1" min={0} max={10} step={1} />
                <InputField label="Olahraga (menit)" name="exercise_minutes" value={form.exercise_minutes}
                  onChange={handleChange} placeholder="30" min={0} max={300} step={5} />
                <InputField label="Tidur (jam)" name="sleep_hours" value={form.sleep_hours}
                  onChange={handleChange} placeholder="8" min={0} max={12} step={0.5} />
              </div>
            </div>

            <button onClick={handleSubmit} disabled={saving} style={styles.submitBtn}>
              {saving ? "Menyimpan..." : "Simpan Data Kesehatan"}
            </button>

            <button onClick={() => setForm(emptyForm)} style={styles.resetBtn}>
              Reset form
            </button>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div style={styles.tabContent}>
            <p style={styles.sectionLabel}>Riwayat Kesehatan ({logs.length} catatan)</p>
            {logs.length === 0 && (
              <p style={{ color: COLORS.textTertiary, textAlign: "center", padding: "30px 0" }}>
                Belum ada riwayat.
              </p>
            )}
            {logs.map((log, i) => {
              const bmi = log.bmi ?? calcBMI(log.weight, log.height);
              const bi = bmiCategory(bmi);
              return (
                <div key={log.id ?? i} style={styles.historyCard}>
                  <div style={styles.historyHeader}>
                    <span style={styles.historyDate}>{fmt(log.date)}</span>
                    {i === 0 && <Chip label="Terbaru" />}
                  </div>
                  <div style={styles.historyChips}>
                    {log.weight && <Chip label={`${log.weight} kg`} />}
                    {log.height && <Chip label={`${log.height} cm`} />}
                    {bmi && <Chip label={`BMI ${bmi}`} color={bi.color} bg={bi.bg} />}
                    {log.blood_pressure && <Chip label={`${log.blood_pressure} mmHg`} color="#EF4444" bg="#FEF2F2" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: COLORS.bgMain,
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  header: {
    padding: "24px 24px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    fontSize: "13px",
    color: COLORS.textTertiary,
    fontWeight: "500",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    margin: "0 0 4px",
  },
  userName: {
    fontSize: "28px",
    fontWeight: "800",
    color: COLORS.textPrimary,
    margin: 0,
    letterSpacing: "-0.03em",
  },
  headerButtons: {
    display: "flex",
    gap: "8px",
  },
  chatBtn: {
    padding: "8px 16px",
    borderRadius: "99px",
    border: `1px solid ${COLORS.borderSoft}`,
    background: COLORS.white,
    color: COLORS.textPrimary,
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  logoutBtn: {
    padding: "8px 16px",
    borderRadius: "99px",
    border: "none",
    background: "#FEE2E2",
    color: "#DC2626",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  tabContainer: {
    display: "flex",
    gap: "4px",
    padding: "20px 24px 0",
    background: COLORS.white,
    borderRadius: "99px",
    margin: "16px 24px 0",
    border: `1px solid ${COLORS.borderSoft}`,
    width: "fit-content",
  },
  tab: {
    padding: "10px 20px",
    borderRadius: "99px",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  content: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px 24px 40px",
  },
  tabContent: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: COLORS.textTertiary,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    margin: "0 0 12px",
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "12px",
  },
  habitsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "8px",
  },
  habitItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    background: COLORS.white,
    borderRadius: "10px",
    border: `1px solid ${COLORS.borderSoft}`,
  },
  habitLabel: {
    fontSize: "13px",
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  habitValue: {
    fontSize: "14px",
    fontWeight: "700",
  },
  chartCard: {
    background: COLORS.white,
    borderRadius: "12px",
    padding: "16px",
    border: `1px solid ${COLORS.borderSoft}`,
  },
  saranCard: {
    background: COLORS.greenDeep,
    borderRadius: "12px",
    padding: "20px",
  },
  saranHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  saranAvatar: {
    width: "28px",
    height: "28px",
    background: COLORS.greenSage,
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: COLORS.white,
  },
  saranLabel: {
    fontSize: "10px",
    fontWeight: "600",
    color: COLORS.greenSage,
    letterSpacing: "0.1em",
  },
  saranText: {
    fontSize: "14px",
    color: COLORS.borderLight,
    lineHeight: "1.6",
    margin: 0,
  },
  fullBtn: {
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: COLORS.greenForest,
    color: COLORS.white,
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
  emptyState: {
    textAlign: "center",
    padding: "48px 20px",
    background: COLORS.white,
    borderRadius: "12px",
    border: `1px dashed ${COLORS.borderLight}`,
  },
  emptyTitle: {
    fontWeight: "700",
    fontSize: "16px",
    color: COLORS.textPrimary,
    margin: "0 0 8px",
  },
  emptyDesc: {
    color: COLORS.textTertiary,
    margin: "0 0 20px",
    fontSize: "14px",
  },
  emptyBtn: {
    padding: "10px 20px",
    borderRadius: "99px",
    border: "none",
    background: COLORS.greenSage,
    color: COLORS.white,
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  inputBanner: {
    background: "#F0FDF4",
    borderRadius: "10px",
    padding: "14px 16px",
    border: `1px solid ${COLORS.borderSoft}`,
  },
  inputBannerTitle: {
    margin: 0,
    fontWeight: "600",
    color: COLORS.textPrimary,
    fontSize: "14px",
  },
  inputBannerDesc: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: COLORS.textTertiary,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  inputLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  dateInput: {
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: "10px",
    padding: "10px 14px",
    fontSize: "14px",
    color: COLORS.textPrimary,
    background: COLORS.white,
    fontFamily: "inherit",
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  submitBtn: {
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: COLORS.greenSage,
    color: COLORS.white,
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
  },
  resetBtn: {
    background: "none",
    border: "none",
    color: COLORS.textTertiary,
    fontWeight: "500",
    fontSize: "13px",
    cursor: "pointer",
    textDecoration: "underline",
  },
  historyCard: {
    background: COLORS.white,
    borderRadius: "12px",
    padding: "16px",
    border: `1px solid ${COLORS.borderSoft}`,
  },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  historyDate: {
    fontWeight: "600",
    color: COLORS.textPrimary,
    fontSize: "14px",
  },
  historyChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
};

const loadingStyles = {
  container: {
    height: "100vh",
    width: "100vw",
    background: COLORS.bgMain,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "16px",
    position: "fixed",
    top: 0,
    left: 0,
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  spinner: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: `3px solid ${COLORS.borderSoft}`,
    borderTopColor: COLORS.greenSage,
    animation: "spin 0.8s linear infinite",
  },
  text: {
    color: COLORS.textTertiary,
    fontWeight: "500",
    fontSize: "14px",
  },
};

const toastStyles = {
  base: {
    position: "fixed",
    top: 20,
    right: 20,
    zIndex: 9999,
    color: "white",
    borderRadius: "10px",
    padding: "12px 20px",
    fontWeight: "500",
    fontSize: "14px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
  },
};
