import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { motion, AnimatePresence } from "framer-motion";
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
  ReferenceLine,
} from "recharts";

// ─── helpers ────────────────────────────────────────────────────────────────
const calcBMI = (weight, height) => {
  if (!weight || !height || height === 0) return null;
  return (weight / ((height / 100) ** 2)).toFixed(1);
};

const bmiCategory = (bmi) => {
  if (!bmi) return { label: "-", color: "#9CA3AF", bg: "#F3F4F6" };
  const b = parseFloat(bmi);
  if (b < 18.5) return { label: "Kurang", color: "#3B82F6", bg: "#EFF6FF" };
  if (b < 25)   return { label: "Normal", color: "#2D5A3D", bg: "#F0FDF4" };
  if (b < 30)   return { label: "Berlebih", color: "#D4A574", bg: "#FFF8E7" };
  return         { label: "Obesitas", color: "#DC2626", bg: "#FEF2F2" };
};

const fmt = (d) =>
  new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

// ─── sub-components ──────────────────────────────────────────────────────────
const MetricCard = ({ label, value, unit, sub, color = "#2D5A3D", bg = "#F0FDF4" }) => (
  <div style={{
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(10px)",
    borderRadius: 16,
    padding: "18px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    boxShadow: "0 2px 8px rgba(139, 119, 80, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderLeft: `4px solid ${color}`,
  }}>
    <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 500, letterSpacing: "0.02em" }}>{label}</span>
    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ fontSize: 26, fontWeight: 700, color: "#1A1A1A" }}>{value ?? "-"}</span>
      {unit && <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>{unit}</span>}
    </div>
    {sub && (
      <span style={{
        fontSize: 11, fontWeight: 600, color, background: bg,
        borderRadius: 8, padding: "3px 10px", alignSelf: "flex-start",
      }}>{sub}</span>
    )}
  </div>
);

const RingProgress = ({ value, max, color, size = 80, label, center }) => {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const fill = Math.min((value / max) * circ, circ);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8E4DF" strokeWidth={8} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: 13, fontWeight: 700, fill: "#1A1A1A" }}>{center}</text>
      </svg>
      <span style={{ fontSize: 11, color: "#6B7280", fontWeight: 500 }}>{label}</span>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "number", placeholder, min, max, step = "0.1" }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{label}</label>
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} min={min} max={max} step={step}
      style={{
        border: "1.5px solid #E8E4DF", borderRadius: 10, padding: "12px 14px",
        fontSize: 15, fontWeight: 500, color: "#1A1A1A",
        outline: "none", transition: "border-color 0.2s",
        background: "#FAFAF8", width: "100%", boxSizing: "border-box",
        fontFamily: "inherit",
      }}
      onFocus={e => e.target.style.borderColor = "#D4A574"}
      onBlur={e => e.target.style.borderColor = "#E8E4DF"}
    />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "white", borderRadius: 10, padding: "10px 14px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontSize: 13,
      border: "1px solid #E8E4DF",
    }}>
      <p style={{ margin: 0, fontWeight: 600, color: "#1A1A1A" }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ margin: "4px 0 0", color: p.color, fontWeight: 500 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const Chip = ({ label, color = "#2D5A3D", bg = "#F0FDF4" }) => (
  <span style={{
    background: bg, color, borderRadius: 8,
    padding: "4px 10px", fontSize: 12, fontWeight: 500,
  }}>{label}</span>
);

// ─── main component ───────────────────────────────────────────────────────────
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
      BMI: l.bmi,
      Tidur: l.sleep_hours,
      Olahraga: l.exercise_minutes,
      "Air Putih": l.water_glasses,
    }));

  const habits = [
    { label: "Air Putih", value: latest?.water_glasses ?? 0, max: 8, color: "#3B82F6", center: `${latest?.water_glasses ?? 0}` },
    { label: "Olahraga", value: latest?.exercise_minutes ?? 0, max: 60, color: "#2D5A3D", center: `${latest?.exercise_minutes ?? 0}m` },
    { label: "Tidur", value: latest?.sleep_hours ?? 0, max: 9, color: "#8B5CF6", center: `${latest?.sleep_hours ?? 0}j` },
    { label: "Kopi", value: latest?.coffee_cups ?? 0, max: 3, color: "#D4A574", center: `${latest?.coffee_cups ?? 0}` },
  ];

  if (loading) return (
    <div style={{
      height: "100vh", width: "100vw", background: "#F8F6F3",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 16, position: "fixed", top: 0, left: 0,
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: "3px solid #E8E4DF", borderTopColor: "#D4A574",
        animation: "spin 0.8s linear infinite",
      }} />
      <p style={{ color: "#6B7280", fontWeight: 500, fontSize: 14 }}>Memuat dashboard...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8F6F3", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed", top: 20, right: 20, zIndex: 9999,
              background: toast.type === "error" ? "#DC2626" : "#2D5A3D",
              color: "white", borderRadius: 12, padding: "12px 20px",
              fontWeight: 500, fontSize: 14, boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header style={{
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #E8E4DF",
        padding: "14px 24px", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, background: "#2D5A3D", borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }}>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <ellipse key={i} cx="12" cy="12" rx="2" ry="5" fill="white" transform={`rotate(${angle} 12 12)`} />
              ))}
              <circle cx="12" cy="12" r="2.5" fill="#E8C547" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: "#1A1A1A", fontFamily: "'Playfair Display', Georgia, serif" }}>
              Edelweys
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>
              heyy yoww, {profile?.full_name?.split(" ")[0] || "user"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => navigate("/chat")}
            style={{
              background: "white", color: "#2D5A3D", border: "1px solid #E8E4DF",
              borderRadius: 10, padding: "8px 16px", fontWeight: 500,
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}
          >Chat</button>
          <button
            onClick={handleLogout}
            style={{
              background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA",
              borderRadius: 10, padding: "8px 16px", fontWeight: 500,
              fontSize: 13, cursor: "pointer", fontFamily: "inherit",
            }}
          >Logout</button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 0, padding: "16px 24px 0",
        maxWidth: 900, margin: "0 auto",
      }}>
        {[
          { id: "overview", label: "Overview" },
          { id: "input", label: "Input Data" },
          { id: "history", label: "Riwayat" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: "12px 0", border: "none", cursor: "pointer",
              fontWeight: 500, fontSize: 14, borderRadius: "12px 12px 0 0",
              background: activeTab === tab.id ? "white" : "transparent",
              color: activeTab === tab.id ? "#2D5A3D" : "#9CA3AF",
              borderBottom: activeTab === tab.id ? "2px solid #2D5A3D" : "2px solid transparent",
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
          >{tab.label}</button>
        ))}
      </div>

      {/* Content */}
      <main style={{
        maxWidth: 900, margin: "0 auto",
        background: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(10px)",
        borderRadius: "0 0 20px 20px",
        padding: 24, minHeight: 500,
        boxShadow: "0 4px 20px rgba(139, 119, 80, 0.06)",
        border: "1px solid rgba(255, 255, 255, 0.5)",
      }}>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {!latest && (
              <div style={{
                textAlign: "center", padding: "48px 20px",
                background: "rgba(255, 255, 255, 0.5)", borderRadius: 16,
                border: "1px dashed #D4A574",
              }}>
                <p style={{ fontWeight: 600, fontSize: 16, color: "#1A1A1A", margin: "0 0 8px" }}>
                  Belum ada data kesehatan
                </p>
                <p style={{ color: "#6B7280", margin: "0 0 20px", fontSize: 14 }}>
                  Mulai catat data kesehatanmu untuk melihat overview
                </p>
                <button onClick={() => setActiveTab("input")} style={{
                  background: "#2D5A3D", color: "white", border: "none",
                  borderRadius: 10, padding: "12px 24px", fontWeight: 500,
                  fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                }}>Input Data Sekarang</button>
              </div>
            )}

            {latest && (
              <>
                <section>
                  <h3 style={{ margin: "0 0 12px", fontSize: 12, color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Data Terakhir - {fmt(latest.date)}
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                    <MetricCard label="Berat Badan" value={latest.weight} unit="kg" />
                    <MetricCard label="Tinggi Badan" value={latest.height} unit="cm" />
                    <MetricCard
                      label="BMI"
                      value={latestBMI}
                      sub={bmiInfo.label}
                      color={bmiInfo.color}
                      bg={bmiInfo.bg}
                    />
                    {latest.blood_pressure && (
                      <MetricCard label="Tekanan Darah" value={latest.blood_pressure} unit="mmHg" color="#DC2626" bg="#FEF2F2" />
                    )}
                  </div>
                </section>

                <section>
                  <h3 style={{ margin: "0 0 12px", fontSize: 12, color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Kebiasaan Harian
                  </h3>
                  <div style={{
                    background: "rgba(255, 255, 255, 0.5)", borderRadius: 16, padding: "20px 24px",
                    display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 16,
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                  }}>
                    {habits.map(h => (
                      <RingProgress key={h.label} value={h.value} max={h.max}
                        color={h.color} center={h.center} label={h.label} />
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                    {[
                      { label: "Target air putih", val: `${latest.water_glasses ?? 0}/8 gelas`, ok: (latest.water_glasses ?? 0) >= 8 },
                      { label: "Target olahraga", val: `${latest.exercise_minutes ?? 0}/60 menit`, ok: (latest.exercise_minutes ?? 0) >= 30 },
                      { label: "Target tidur", val: `${latest.sleep_hours ?? 0}/8 jam`, ok: (latest.sleep_hours ?? 0) >= 7 },
                      { label: "Batas kopi", val: `${latest.coffee_cups ?? 0}/3 cangkir`, ok: (latest.coffee_cups ?? 0) <= 3 },
                    ].map(item => (
                      <div key={item.label} style={{
                        background: item.ok ? "rgba(45, 90, 61, 0.08)" : "rgba(212, 165, 116, 0.15)",
                        borderRadius: 10, padding: "10px 14px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <span style={{ fontSize: 12, color: "#6B7280", fontWeight: 500 }}>{item.label}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: item.ok ? "#2D5A3D" : "#D4A574" }}>
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {chartData.length > 1 && (
                  <section>
                    <h3 style={{ margin: "0 0 12px", fontSize: 12, color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Tren 14 Hari Terakhir
                    </h3>

                    <div style={{ background: "rgba(255, 255, 255, 0.5)", borderRadius: 16, padding: "16px 8px 8px", marginBottom: 14, border: "1px solid rgba(255, 255, 255, 0.5)" }}>
                      <p style={{ margin: "0 0 10px 16px", fontWeight: 500, fontSize: 13, color: "#374151" }}>Berat Badan (kg)</p>
                      <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={chartData} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DF" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                          <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line type="monotone" dataKey="Berat" stroke="#2D5A3D" strokeWidth={2}
                            dot={{ r: 4, fill: "#2D5A3D", strokeWidth: 0 }}
                            activeDot={{ r: 6 }} connectNulls />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ background: "rgba(255, 255, 255, 0.5)", borderRadius: 16, padding: "16px 8px 8px", border: "1px solid rgba(255, 255, 255, 0.5)" }}>
                      <p style={{ margin: "0 0 10px 16px", fontWeight: 500, fontSize: 13, color: "#374151" }}>Kebiasaan Harian</p>
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={chartData} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DF" />
                          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                          <YAxis tick={{ fontSize: 10, fill: "#9CA3AF" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="Air Putih" fill="#3B82F6" radius={[4,4,0,0]} />
                          <Bar dataKey="Tidur" fill="#8B5CF6" radius={[4,4,0,0]} />
                          <ReferenceLine y={8} stroke="#3B82F6" strokeDasharray="4 4" strokeWidth={1.5} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                )}

                <button onClick={() => setActiveTab("input")} style={{
                  background: "#2D5A3D", color: "white", border: "none",
                  borderRadius: 12, padding: "14px 0", fontWeight: 500,
                  fontSize: 14, cursor: "pointer", width: "100%",
                  fontFamily: "inherit",
                }}>Update Data Hari Ini</button>
              </>
            )}
          </div>
        )}

        {/* INPUT TAB */}
        {activeTab === "input" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{
              background: "rgba(45, 90, 61, 0.08)",
              borderRadius: 12, padding: "14px 18px",
            }}>
              <p style={{ margin: 0, fontWeight: 600, color: "#2D5A3D", fontSize: 14 }}>
                Catat kondisi kesehatanmu hari ini
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>
                Data yang kamu isi membantu Edelweys memberikan saran yang lebih personal
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Tanggal</label>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                style={{
                  border: "1.5px solid #E8E4DF", borderRadius: 10, padding: "12px 14px",
                  fontSize: 15, fontWeight: 500, color: "#1A1A1A", outline: "none",
                  background: "#FAFAF8", width: "100%", boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
                onFocus={e => e.target.style.borderColor = "#D4A574"}
                onBlur={e => e.target.style.borderColor = "#E8E4DF"}
              />
            </div>

            <div>
              <p style={{ margin: "0 0 12px", fontWeight: 600, color: "#1A1A1A", fontSize: 14 }}>
                1. Data Tubuh
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <InputField label="Berat Badan (kg)" name="weight" value={form.weight}
                  onChange={handleChange} placeholder="65" min={30} max={200} />
                <InputField label="Tinggi Badan (cm)" name="height" value={form.height}
                  onChange={handleChange} placeholder="165" min={100} max={250} />
              </div>
              {form.weight && form.height && (
                <div style={{
                  marginTop: 10, background: bmiCategory(calcBMI(form.weight, form.height)).bg,
                  borderRadius: 10, padding: "10px 14px",
                }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>BMI kamu (auto-hitung)</p>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: bmiCategory(calcBMI(form.weight, form.height)).color }}>
                    {calcBMI(form.weight, form.height)} - {bmiCategory(calcBMI(form.weight, form.height)).label}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p style={{ margin: "0 0 12px", fontWeight: 600, color: "#1A1A1A", fontSize: 14 }}>
                2. Tekanan Darah <span style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 400 }}>(opsional)</span>
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <InputField label="Sistolik" name="systolic" value={form.systolic}
                  onChange={handleChange} placeholder="120" min={60} max={200} step={1} />
                <InputField label="Diastolik" name="diastolic" value={form.diastolic}
                  onChange={handleChange} placeholder="80" min={40} max={130} step={1} />
              </div>
            </div>

            <div>
              <p style={{ margin: "0 0 12px", fontWeight: 600, color: "#1A1A1A", fontSize: 14 }}>
                3. Kebiasaan Harian
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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

            <button
              onClick={handleSubmit}
              disabled={saving}
              style={{
                background: saving ? "#E8E4DF" : "#2D5A3D",
                color: saving ? "#6B7280" : "white",
                border: "none", borderRadius: 12, padding: "14px 0",
                fontWeight: 500, fontSize: 15, cursor: saving ? "default" : "pointer",
                width: "100%", transition: "all 0.2s",
                fontFamily: "inherit",
              }}
            >
              {saving ? "Menyimpan..." : "Simpan Data Kesehatan"}
            </button>

            <button onClick={() => setForm(emptyForm)} style={{
              background: "none", border: "none", color: "#9CA3AF",
              fontWeight: 500, fontSize: 13, cursor: "pointer", textDecoration: "underline",
              fontFamily: "inherit",
            }}>Reset form</button>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h3 style={{ margin: 0, fontWeight: 600, color: "#1A1A1A", fontSize: 16 }}>
              Riwayat Kesehatan ({logs.length} catatan)
            </h3>
            {logs.length === 0 && (
              <p style={{ color: "#9CA3AF", textAlign: "center", padding: "30px 0", fontSize: 14 }}>
                Belum ada riwayat. Mulai catat data kesehatanmu!
              </p>
            )}
            {logs.map((log, i) => {
              const bmi = log.bmi ?? calcBMI(log.weight, log.height);
              const bi = bmiCategory(bmi);
              return (
                <div key={log.id ?? i} style={{
                  border: "1px solid #E8E4DF", borderRadius: 14,
                  padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10,
                  background: i === 0 ? "rgba(45, 90, 61, 0.04)" : "rgba(255, 255, 255, 0.5)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: "#1A1A1A", fontSize: 14 }}>
                      {fmt(log.date)}
                    </span>
                    {i === 0 && (
                      <span style={{
                        background: "#2D5A3D", color: "white",
                        borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 500,
                      }}>Terbaru</span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {log.weight && <Chip label={`${log.weight} kg`} />}
                    {log.height && <Chip label={`${log.height} cm`} />}
                    {bmi && <Chip label={`BMI ${bmi}`} color={bi.color} bg={bi.bg} />}
                    {log.blood_pressure && <Chip label={`${log.blood_pressure} mmHg`} color="#DC2626" bg="#FEF2F2" />}
                    {log.water_glasses != null && <Chip label={`${log.water_glasses} gelas`} color="#3B82F6" bg="#EFF6FF" />}
                    {log.coffee_cups != null && <Chip label={`${log.coffee_cups} kopi`} color="#D4A574" bg="#FFF8E7" />}
                    {log.exercise_minutes != null && <Chip label={`${log.exercise_minutes} mnt`} color="#2D5A3D" bg="#F0FDF4" />}
                    {log.sleep_hours != null && <Chip label={`${log.sleep_hours} jam`} color="#8B5CF6" bg="#F5F3FF" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <style>{`
        * { box-sizing: border-box; }
        button:hover { opacity: 0.9; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>
    </div>
  );
}
