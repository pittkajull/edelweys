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

const glassBg = "rgba(255, 255, 255, 0.7)";
const glassBorder = "1px solid rgba(255, 255, 255, 0.5)";
const glassShadow = "0 8px 32px rgba(30, 51, 25, 0.08)";

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
  <div style={glassCard}>
    <p style={labelStyle}>{label}</p>
    <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
      <span style={valueStyle}>{value ?? "-"}</span>
      {unit && <span style={unitStyle}>{unit}</span>}
    </div>
    {sub && (
      <span style={{ ...badgeStyle, color, background: bg }}>{sub}</span>
    )}
  </div>
);

const glassCard = {
  background: glassBg,
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  borderRadius: "14px",
  padding: "20px",
  border: glassBorder,
  boxShadow: glassShadow,
};

const labelStyle = {
  fontSize: "11px",
  fontWeight: "600",
  color: COLORS.textTertiary,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  margin: "0 0 8px",
};

const valueStyle = {
  fontSize: "28px",
  fontWeight: "800",
  color: COLORS.textPrimary,
  letterSpacing: "-0.02em",
};

const unitStyle = {
  fontSize: "14px",
  color: COLORS.textTertiary,
  fontWeight: "500",
};

const badgeStyle = {
  display: "inline-block",
  marginTop: "8px",
  padding: "3px 10px",
  borderRadius: "99px",
  fontSize: "11px",
  fontWeight: "600",
};

const InputField = ({ label, name, value, onChange, type = "number", placeholder, min, max, step = "0.1" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={{ fontSize: "12px", fontWeight: "600", color: COLORS.textPrimary }}>{label}</label>
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} min={min} max={max} step={step}
      style={{
        border: `2px solid ${COLORS.borderSoft}`, borderRadius: "12px", padding: "12px 14px",
        fontSize: "14px", fontWeight: "500", color: COLORS.textPrimary,
        outline: "none", background: "rgba(255,255,255,0.6)", width: "100%", boxSizing: "border-box",
        fontFamily: "inherit", backdropFilter: "blur(10px)",
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [habitsMode, setHabitsMode] = useState("number"); // "number" or "text"
  const [habitsNote, setHabitsNote] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const emptyForm = {
    date: today, weight: "", height: "",
    systolic: "", diastolic: "",
    coffee_cups: "", exercise_minutes: "",
    water_glasses: "", sleep_hours: "",
  };
  const [form, setForm] = useState(emptyForm);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      habits_note: habitsMode === "text" ? habitsNote : null,
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
    }));

  const timeStr = currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

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
              position: "fixed", top: 20, right: 20, zIndex: 9999,
              background: toast.type === "error" ? "#DC2626" : COLORS.greenSage,
              color: "white", borderRadius: "12px", padding: "12px 20px",
              fontWeight: "500", fontSize: "14px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <p style={styles.greeting}>SELAMAT DATANG KEMBALI,</p>
          <h1 style={styles.userName}>{profile?.full_name || "User"} 🌿</h1>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.timeDisplay}>
            <p style={styles.timeText}>{timeStr}</p>
            <p style={styles.dateText}>{dateStr}</p>
          </div>
          <div style={styles.headerButtons}>
            <button onClick={() => navigate("/chat")} style={styles.chatBtn}>Chat</button>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
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
              <div style={glassCard}>
                <p style={{ fontWeight: "700", fontSize: "16px", color: COLORS.textPrimary, margin: "0 0 8px" }}>
                  Belum ada data kesehatan
                </p>
                <p style={{ color: COLORS.textTertiary, margin: "0 0 20px", fontSize: "14px" }}>
                  Mulai catat data kesehatanmu untuk melihat overview
                </p>
                <button onClick={() => setActiveTab("input")} style={styles.greenBtn}>
                  Input Data Sekarang
                </button>
              </div>
            )}

            {latest && (
              <>
                <section>
                  <p style={sectionLabel}>Data Terakhir — {fmt(latest.date)}</p>
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
                  <p style={sectionLabel}>Kebiasaan Harian</p>
                  <div style={styles.habitsGrid}>
                    {[
                      { label: "Air Putih", val: `${latest.water_glasses ?? 0}/8`, ok: (latest.water_glasses ?? 0) >= 8 },
                      { label: "Olahraga", val: `${latest.exercise_minutes ?? 0}/60m`, ok: (latest.exercise_minutes ?? 0) >= 30 },
                      { label: "Tidur", val: `${latest.sleep_hours ?? 0}/8j`, ok: (latest.sleep_hours ?? 0) >= 7 },
                      { label: "Kopi", val: `${latest.coffee_cups ?? 0}/3`, ok: (latest.coffee_cups ?? 0) <= 3 },
                    ].map(item => (
                      <div key={item.label} style={{
                        ...glassCard,
                        borderLeft: `3px solid ${item.ok ? COLORS.greenSage : COLORS.borderSoft}`,
                      }}>
                        <span style={{ fontSize: "12px", color: COLORS.textTertiary, fontWeight: "500" }}>{item.label}</span>
                        <span style={{ fontSize: "16px", fontWeight: "700", color: item.ok ? COLORS.greenSage : COLORS.textTertiary }}>
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {chartData.length > 1 && (
                  <section>
                    <p style={sectionLabel}>Tren 14 Hari</p>
                    <div style={glassCard}>
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
                <div style={saranCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                    <img src={logo} alt="E" style={{ width: "28px", height: "28px", borderRadius: "8px" }} />
                    <span style={{ fontSize: "11px", fontWeight: "600", color: COLORS.greenSage, letterSpacing: "0.08em" }}>SARAN EDELWEYS</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {latest.water_glasses < 8 && (
                      <div style={tipItem}>
                        <span>💧</span>
                        <p style={tipText}>Minum air putih yang cukup! Target 8 gelas sehari. Saat ini baru {latest.water_glasses ?? 0} gelas.</p>
                      </div>
                    )}
                    {latest.exercise_minutes < 30 && (
                      <div style={tipItem}>
                        <span>🏃</span>
                        <p style={tipText}>Coba tambah waktu olahraga minimal 30 menit sehari. Saat ini baru {latest.exercise_minutes ?? 0} menit.</p>
                      </div>
                    )}
                    {latest.sleep_hours < 7 && (
                      <div style={tipItem}>
                        <span>😴</span>
                        <p style={tipText}>Tidurmu kurang! Target 7-8 jam sehari. Saat ini baru {latest.sleep_hours ?? 0} jam.</p>
                      </div>
                    )}
                    {latest.coffee_cups > 3 && (
                      <div style={tipItem}>
                        <span>☕</span>
                        <p style={tipText}>Kopimu kebanyakan! Batasi max 3 cangkir sehari. Saat ini {latest.coffee_cups ?? 0} cangkir.</p>
                      </div>
                    )}
                    {latest.water_glasses >= 8 && latest.exercise_minutes >= 30 && latest.sleep_hours >= 7 && latest.coffee_cups <= 3 && (
                      <div style={tipItem}>
                        <span>💪</span>
                        <p style={tipText}>Kamu udah doing great! Pertahankan pola hidup sehatmu!</p>
                      </div>
                    )}
                  </div>
                </div>

                <button onClick={() => setActiveTab("input")} style={styles.greenBtn}>
                  Update Data Hari Ini
                </button>
              </>
            )}
          </div>
        )}

        {/* INPUT TAB */}
        {activeTab === "input" && (
          <div style={styles.tabContent}>
            <div style={{ ...glassCard, background: "rgba(107, 145, 98, 0.1)", border: `1px solid rgba(107, 145, 98, 0.3)` }}>
              <p style={{ margin: 0, fontWeight: "600", color: COLORS.textPrimary, fontSize: "14px" }}>
                Catat kondisi kesehatanmu hari ini
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "13px", color: COLORS.textTertiary }}>
                Data yang kamu isi membantu Edelweys memberikan saran personal
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: COLORS.textPrimary }}>Tanggal</label>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                style={{
                  border: `2px solid ${COLORS.borderSoft}`, borderRadius: "12px", padding: "12px 14px",
                  fontSize: "14px", color: COLORS.textPrimary, background: "rgba(255,255,255,0.6)",
                  fontFamily: "inherit", backdropFilter: "blur(10px)",
                }}
              />
            </div>

            <div>
              <p style={sectionLabel}>1. Data Tubuh</p>
              <div style={styles.inputGrid}>
                <InputField label="Berat Badan (kg)" name="weight" value={form.weight}
                  onChange={handleChange} placeholder="65" min={30} max={200} />
                <InputField label="Tinggi Badan (cm)" name="height" value={form.height}
                  onChange={handleChange} placeholder="165" min={100} max={250} />
              </div>
            </div>

            <div>
              <p style={sectionLabel}>2. Tekanan Darah <span style={{ color: COLORS.textTertiary, fontWeight: 400 }}>(opsional)</span></p>
              <div style={styles.inputGrid}>
                <InputField label="Sistolik" name="systolic" value={form.systolic}
                  onChange={handleChange} placeholder="120" min={60} max={200} step={1} />
                <InputField label="Diastolik" name="diastolic" value={form.diastolic}
                  onChange={handleChange} placeholder="80" min={40} max={130} step={1} />
              </div>
            </div>

            <div>
              <p style={sectionLabel}>3. Kebiasaan Harian</p>

              {/* Mode Toggle */}
              <div style={styles.modeToggle}>
                <button
                  onClick={() => setHabitsMode("number")}
                  style={{
                    ...styles.modeBtn,
                    background: habitsMode === "number" ? COLORS.greenSage : "transparent",
                    color: habitsMode === "number" ? COLORS.white : COLORS.textSecondary,
                  }}
                >
                  Angka
                </button>
                <button
                  onClick={() => setHabitsMode("text")}
                  style={{
                    ...styles.modeBtn,
                    background: habitsMode === "text" ? COLORS.greenSage : "transparent",
                    color: habitsMode === "text" ? COLORS.white : COLORS.textSecondary,
                  }}
                >
                  Catatan
                </button>
              </div>

              {habitsMode === "number" ? (
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
              ) : (
                <textarea
                  value={habitsNote}
                  onChange={(e) => setHabitsNote(e.target.value)}
                  placeholder="Tulis catatan kebiasaan harianmu hari ini..."
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    border: `2px solid ${COLORS.borderSoft}`,
                    borderRadius: "12px",
                    padding: "14px",
                    fontSize: "14px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    background: "rgba(255,255,255,0.6)",
                    color: COLORS.textPrimary,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              )}
            </div>

            <button onClick={handleSubmit} disabled={saving} style={styles.greenBtn}>
              {saving ? "Menyimpan..." : "Simpan Data Kesehatan"}
            </button>

            <button onClick={() => { setForm(emptyForm); setHabitsNote(""); }} style={styles.resetBtn}>
              Reset form
            </button>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div style={styles.tabContent}>
            <p style={sectionLabel}>Riwayat Kesehatan ({logs.length} catatan)</p>
            {logs.length === 0 && (
              <div style={glassCard}>
                <p style={{ color: COLORS.textTertiary, textAlign: "center", padding: "20px 0" }}>
                  Belum ada riwayat.
                </p>
              </div>
            )}
            {logs.map((log, i) => {
              const bmi = log.bmi ?? calcBMI(log.weight, log.height);
              const bi = bmiCategory(bmi);
              return (
                <div key={log.id ?? i} style={glassCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontWeight: "600", color: COLORS.textPrimary, fontSize: "14px" }}>{fmt(log.date)}</span>
                    {i === 0 && <Chip label="Terbaru" />}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
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
    flexWrap: "wrap",
    gap: "16px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  timeDisplay: {
    textAlign: "right",
  },
  timeText: {
    fontSize: "24px",
    fontWeight: "800",
    color: COLORS.textPrimary,
    margin: 0,
    letterSpacing: "-0.02em",
    fontVariantNumeric: "tabular-nums",
  },
  dateText: {
    fontSize: "12px",
    color: COLORS.textTertiary,
    margin: 0,
  },
  greeting: {
    fontSize: "11px",
    color: COLORS.textTertiary,
    fontWeight: "600",
    letterSpacing: "0.08em",
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
    padding: "10px 18px",
    borderRadius: "10px",
    border: glassBorder,
    background: "rgba(255,255,255,0.5)",
    color: COLORS.textPrimary,
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
  },
  logoutBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: "none",
    background: "rgba(239, 68, 68, 0.1)",
    color: "#DC2626",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  tabContainer: {
    display: "flex",
    gap: "4px",
    padding: "20px 24px 0",
    background: glassBg,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "16px",
    margin: "16px 24px 0",
    border: glassBorder,
    boxShadow: glassShadow,
    width: "fit-content",
  },
  tab: {
    padding: "10px 20px",
    borderRadius: "12px",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
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
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "12px",
  },
  habitsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  inputGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  modeToggle: {
    display: "flex",
    gap: "4px",
    padding: "4px",
    background: "rgba(255,255,255,0.5)",
    borderRadius: "12px",
    marginBottom: "12px",
    border: glassBorder,
  },
  modeBtn: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "10px",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  greenBtn: {
    padding: "14px",
    borderRadius: "12px",
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
};

const saranCard = {
  ...glassCard,
  background: COLORS.greenDeep,
  border: "none",
};

const tipItem = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  padding: "10px 12px",
  background: "rgba(255,255,255,0.08)",
  borderRadius: "10px",
};

const tipText = {
  fontSize: "13px",
  color: COLORS.borderLight,
  lineHeight: "1.5",
  margin: 0,
};

const sectionLabel = {
  fontSize: "11px",
  fontWeight: "600",
  color: COLORS.textTertiary,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  margin: "0 0 12px",
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
