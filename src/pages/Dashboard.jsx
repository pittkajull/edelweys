import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const calcBMI = (weight, height) => {
  if (!weight || !height || height === 0) return null;
  return (weight / ((height / 100) ** 2)).toFixed(1);
};

const bmiCategory = (bmi) => {
  if (!bmi) return { label: "-", color: "#8A8279", bg: "#F5EDE3" };
  const b = parseFloat(bmi);
  if (b < 18.5) return { label: "Kurang", color: "#5B8DB8", bg: "#EDF4FA" };
  if (b < 25) return { label: "Normal", color: "#7D9B76", bg: "#F0F5EE" };
  if (b < 30) return { label: "Berlebih", color: "#C4956A", bg: "#FDF5ED" };
  return { label: "Obesitas", color: "#C47A6A", bg: "#FDF0ED" };
};

const fmt = (d) => new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

const GlassCard = ({ children, className = "", dark = false }) => (
  <div className={`rounded-soft p-5 border transition-all duration-200 ${
    dark
      ? "shadow-soft-lg"
      : "shadow-soft"
  }`} style={{
    background: dark ? "linear-gradient(135deg, #2D2A26 0%, #3D3833 100%)" : "rgba(255, 252, 248, 0.7)",
    borderColor: dark ? "rgba(255,255,255,0.08)" : "rgba(232, 222, 212, 0.6)",
    backdropFilter: "blur(16px)"
  }}>
    {children}
  </div>
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
  const [habitsMode, setHabitsMode] = useState("number");
  const [habitsNote, setHabitsNote] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const emptyForm = { date: today, weight: "", height: "", systolic: "", diastolic: "", coffee_cups: "", exercise_minutes: "", water_glasses: "", sleep_hours: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/login"); return; }
      setUser(session.user);

      let { data: prof } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      const userMeta = session.user.user_metadata || {};
      const fullName = userMeta.full_name || userMeta.name || "";
      const username = userMeta.name || session.user.email?.split("@")[0] || "user";

      if (!prof) {
        const { data: newProf } = await supabase.from("profiles").insert({
          id: session.user.id,
          username: username,
          full_name: fullName,
        }).select().single();
        prof = newProf;
      } else if (!prof.full_name && fullName) {
        const { data: updated } = await supabase.from("profiles").update({ full_name: fullName, username }).eq("id", session.user.id).select().single();
        if (updated) prof = updated;
      }
      setProfile(prof);

      const { data: hlogs } = await supabase.from("health_logs").select("*").eq("user_id", session.user.id).order("logged_at", { ascending: false }).limit(30);
      setLogs(hlogs || []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.weight && !form.height) { showToast("Isi minimal berat atau tinggi badan!", "error"); return; }
    setSaving(true);
    const bmi = calcBMI(form.weight, form.height);

    // Build payload with only non-null fields
    const payload = {
      user_id: user.id,
      logged_at: form.date,
    };
    if (form.weight) payload.weight = parseFloat(form.weight);
    if (form.height) payload.height = parseFloat(form.height);
    if (form.coffee_cups) payload.coffee_cups = parseInt(form.coffee_cups);
    if (form.exercise_minutes) payload.exercise_minutes = parseInt(form.exercise_minutes);
    if (form.water_glasses) payload.water_glasses = parseInt(form.water_glasses);
    if (form.sleep_hours) payload.sleep_hours = parseFloat(form.sleep_hours);

    console.log("Payload:", payload);

    const { error } = await supabase.from("health_logs").upsert(payload, { onConflict: "user_id,logged_at" });
    if (error) {
      console.error("Gagal simpan:", error);
      showToast("Gagal simpan: " + error.message, "error");
    }
    else {
      showToast("Data kesehatan berhasil disimpan!");
      const { data: hlogs } = await supabase.from("health_logs").select("*").eq("user_id", user.id).order("logged_at", { ascending: false }).limit(30);
      setLogs(hlogs || []);
      setActiveTab("overview");
    }
    setSaving(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/login"); };

  const latest = logs[0] || null;
  const latestBMI = latest?.bmi ?? (latest ? calcBMI(latest.weight, latest.height) : null);
  const bmiInfo = bmiCategory(latestBMI);
  const chartData = [...logs].reverse().slice(-14).map(l => ({ date: fmt(l.logged_at), Berat: l.weight }));
  const timeStr = currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center flex-col gap-4 fixed inset-0 font-sans"
      style={{ background: "linear-gradient(180deg, #FAF5EE 0%, #F5EDE3 100%)" }}>
      <motion.div
        className="w-12 h-12 rounded-full border-[3px] border-edelweys-border border-t-edelweys-sage"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-edelweys-text-tertiary font-medium text-sm">Memuat dashboard...</p>
    </div>
  );

  const MetricCard = ({ label, value, unit, sub, color = "#7D9B76", bg = "#F0F5EE" }) => (
    <GlassCard>
      <p className="text-[11px] font-bold tracking-[0.1em] uppercase m-0 mb-2" style={{ color: "#8A8279" }}>{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-display text-edelweys-text tracking-tight">{value ?? "-"}</span>
        {unit && <span className="text-sm font-medium" style={{ color: "#8A8279" }}>{unit}</span>}
      </div>
      {sub && <span className="inline-block mt-2 px-3 py-1 rounded-pill text-xs font-semibold" style={{ color, background: bg }}>{sub}</span>}
    </GlassCard>
  );

  return (
    <div className="min-h-screen font-sans" style={{ background: "linear-gradient(180deg, #FAF5EE 0%, #F5EDE3 50%, #EDE4D8 100%)" }}>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-[9999] text-white rounded-2xl px-5 py-3 font-semibold text-sm shadow-soft-lg ${
              toast.type === "error" ? "bg-gradient-to-r from-red-400 to-red-500" : "bg-gradient-to-r from-edelweys-forest to-edelweys-sage"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "error" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              )}
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 md:px-8 pt-6 pb-4">
        <div className="max-w-[1000px] mx-auto flex justify-between items-start flex-wrap gap-4">
          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase m-0 mb-1" style={{ color: "#8A8279" }}>Selamat datang kembali,</p>
            <h1 className="text-3xl font-display text-edelweys-text m-0 tracking-tight">{profile?.full_name || "User"}</h1>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-right">
              <p className="text-2xl font-semibold text-edelweys-text m-0 tabular-nums tracking-tight">{timeStr}</p>
              <p className="text-xs m-0" style={{ color: "#8A8279" }}>{dateStr}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate("/chat")} className="px-4 py-2.5 rounded-2xl font-semibold text-sm cursor-pointer transition-all duration-200 border-2 border-edelweys-border bg-edelweys-surface/50 text-edelweys-text hover:bg-edelweys-surface">Chat</button>
              <button onClick={handleLogout} className="px-4 py-2.5 rounded-2xl font-semibold text-sm cursor-pointer transition-all duration-200 border-none" style={{ background: "rgba(200, 120, 100, 0.1)", color: "#B85A4A" }}>Logout</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 md:px-8">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex gap-1 p-1.5 rounded-2xl border border-edelweys-border-light shadow-soft"
            style={{ background: "rgba(255, 252, 248, 0.7)", backdropFilter: "blur(16px)" }}>
            {[
              { id: "overview", label: "Overview" },
              { id: "input", label: "Input Data" },
              { id: "history", label: "Riwayat" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-xl border-none text-sm font-semibold cursor-pointer transition-all duration-200 ${
                  activeTab === tab.id
                    ? "text-white shadow-sage-sm"
                    : "bg-transparent text-edelweys-text-secondary hover:bg-edelweys-surface/50"
                }`} style={activeTab === tab.id ? { background: "linear-gradient(135deg, #4A5D4A 0%, #7D9B76 100%)" } : {}}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1000px] mx-auto px-5 md:px-8 py-6 pb-12">
        {activeTab === "overview" && (
          <motion.div className="flex flex-col gap-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {!latest && (
              <GlassCard>
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: "rgba(125, 155, 118, 0.1)" }}>
                    <svg className="w-8 h-8 text-edelweys-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="font-semibold text-lg text-edelweys-text m-0 mb-2">Belum ada data kesehatan</p>
                  <p className="m-0 mb-6 text-sm" style={{ color: "#8A8279" }}>Mulai catat data kesehatanmu untuk melihat overview</p>
                  <button onClick={() => setActiveTab("input")} className="px-6 py-3 rounded-2xl border-none text-white text-sm font-semibold cursor-pointer shadow-sage-sm hover:shadow-sage transition-all" style={{ background: "linear-gradient(135deg, #4A5D4A 0%, #7D9B76 100%)" }}>Input Data Sekarang</button>
                </div>
              </GlassCard>
            )}

            {latest && (
              <>
                <section>
                  <p className="text-[11px] font-bold tracking-[0.1em] uppercase m-0 mb-3" style={{ color: "#8A8279" }}>Data Terakhir — {fmt(latest.logged_at)}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricCard label="Berat Badan" value={latest.weight} unit="kg" />
                    <MetricCard label="Tinggi Badan" value={latest.height} unit="cm" />
                    <MetricCard label="BMI" value={latestBMI} sub={bmiInfo.label} color={bmiInfo.color} bg={bmiInfo.bg} />
                    {(latest.blood_pressure_sytolic || latest.blood_pressure_diastolic) && <MetricCard label="Tekanan Darah" value={`${latest.blood_pressure_sytolic ?? "-"}/${latest.blood_pressure_diastolic ?? "-"}`} unit="mmHg" color="#C47A6A" bg="#FDF0ED" />}
                  </div>
                </section>

                <section>
                  <p className="text-[11px] font-bold tracking-[0.1em] uppercase m-0 mb-3" style={{ color: "#8A8279" }}>Kebiasaan Harian</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Air Putih", val: `${latest.water_glasses ?? 0}/8`, ok: (latest.water_glasses ?? 0) >= 8, icon: "💧" },
                      { label: "Olahraga", val: `${latest.exercise_minutes ?? 0}/60m`, ok: (latest.exercise_minutes ?? 0) >= 30, icon: "🏃" },
                      { label: "Tidur", val: `${latest.sleep_hours ?? 0}/8j`, ok: (latest.sleep_hours ?? 0) >= 7, icon: "😴" },
                      { label: "Kopi", val: `${latest.coffee_cups ?? 0}/3`, ok: (latest.coffee_cups ?? 0) <= 3, icon: "☕" },
                    ].map(item => (
                      <GlassCard key={item.label}>
                        <div className={`border-l-[3px] pl-3 ${item.ok ? "border-l-edelweys-sage" : "border-l-edelweys-border"}`}>
                          <span className="text-lg">{item.icon}</span>
                          <p className="text-xs font-medium m-0 mt-1" style={{ color: "#8A8279" }}>{item.label}</p>
                          <p className={`text-base font-semibold m-0 ${item.ok ? "text-edelweys-sage" : ""}`} style={!item.ok ? { color: "#8A8279" } : {}}>{item.val}</p>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </section>

                {chartData.length > 1 && (
                  <section>
                    <p className="text-[11px] font-bold tracking-[0.1em] uppercase m-0 mb-3" style={{ color: "#8A8279" }}>Tren 14 Hari</p>
                    <GlassCard>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E8DED4" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8A8279" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#8A8279" }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="Berat" stroke="#C4956A" strokeWidth={2.5} dot={{ r: 4, fill: "#C4956A" }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </GlassCard>
                  </section>
                )}

                {/* Saran Edelweys */}
                <GlassCard dark>
                  <div className="flex items-center gap-3 mb-4">
                    <img src={logo} alt="E" className="w-12 h-12 rounded-2xl" />
                    <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-edelweys-sage">Saran Edelweys</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {latest.water_glasses < 8 && (
                      <div className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <span className="text-lg">💧</span>
                        <p className="text-sm leading-relaxed m-0" style={{ color: "rgba(232, 222, 212, 0.8)" }}>Minum air putih yang cukup! Target 8 gelas sehari. Saat ini baru {latest.water_glasses ?? 0} gelas.</p>
                      </div>
                    )}
                    {latest.exercise_minutes < 30 && (
                      <div className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <span className="text-lg">🏃</span>
                        <p className="text-sm leading-relaxed m-0" style={{ color: "rgba(232, 222, 212, 0.8)" }}>Coba tambah waktu olahraga minimal 30 menit sehari. Saat ini baru {latest.exercise_minutes ?? 0} menit.</p>
                      </div>
                    )}
                    {latest.sleep_hours < 7 && (
                      <div className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <span className="text-lg">😴</span>
                        <p className="text-sm leading-relaxed m-0" style={{ color: "rgba(232, 222, 212, 0.8)" }}>Tidurmu kurang! Target 7-8 jam sehari. Saat ini baru {latest.sleep_hours ?? 0} jam.</p>
                      </div>
                    )}
                    {latest.coffee_cups > 3 && (
                      <div className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <span className="text-lg">☕</span>
                        <p className="text-sm leading-relaxed m-0" style={{ color: "rgba(232, 222, 212, 0.8)" }}>Kopimu kebanyakan! Batasi max 3 cangkir sehari. Saat ini {latest.coffee_cups ?? 0} cangkir.</p>
                      </div>
                    )}
                    {latest.water_glasses >= 8 && latest.exercise_minutes >= 30 && latest.sleep_hours >= 7 && latest.coffee_cups <= 3 && (
                      <div className="flex items-start gap-3 p-3 rounded-2xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <span className="text-lg">💪</span>
                        <p className="text-sm leading-relaxed m-0" style={{ color: "rgba(232, 222, 212, 0.8)" }}>Kamu udah doing great! Pertahankan pola hidup sehatmu!</p>
                      </div>
                    )}
                  </div>
                </GlassCard>

                <button onClick={() => setActiveTab("input")} className="py-4 rounded-2xl border-none text-white text-sm font-semibold cursor-pointer w-full shadow-sage-sm hover:shadow-sage transition-all" style={{ background: "linear-gradient(135deg, #4A5D4A 0%, #7D9B76 100%)" }}>Update Data Hari Ini</button>
              </>
            )}
          </motion.div>
        )}

        {activeTab === "input" && (
          <motion.div className="flex flex-col gap-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard>
              <div className="flex items-center gap-3 p-3 rounded-2xl border" style={{ background: "rgba(125, 155, 118, 0.08)", borderColor: "rgba(125, 155, 118, 0.15)" }}>
                <svg className="w-5 h-5 text-edelweys-sage flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <p className="m-0 font-semibold text-edelweys-text text-sm">Catat kondisi kesehatanmu hari ini</p>
                  <p className="mt-0.5 text-xs m-0" style={{ color: "#8A8279" }}>Data yang kamu isi membantu Edelweys memberikan saran personal</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <label className="text-xs font-semibold text-edelweys-text mb-2 block">Tanggal</label>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                className="w-full border-2 border-edelweys-border rounded-2xl px-4 py-3 text-sm text-edelweys-text bg-edelweys-surface/50 font-sans" />
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-bold tracking-[0.1em] uppercase m-0 mb-4" style={{ color: "#8A8279" }}>1. Data Tubuh</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Berat Badan (kg)", name: "weight", placeholder: "65" },
                  { label: "Tinggi Badan (cm)", name: "height", placeholder: "165" },
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-xs font-semibold text-edelweys-text mb-2 block">{f.label}</label>
                    <input type="number" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                      className="w-full border-2 border-edelweys-border rounded-2xl px-4 py-3 text-sm font-medium text-edelweys-text bg-edelweys-surface/50 font-sans" />
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-bold tracking-[0.1em] uppercase m-0 mb-4" style={{ color: "#8A8279" }}>2. Tekanan Darah <span className="font-normal">(opsional)</span></p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Sistolik", name: "systolic", placeholder: "120" },
                  { label: "Diastolik", name: "diastolic", placeholder: "80" },
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-xs font-semibold text-edelweys-text mb-2 block">{f.label}</label>
                    <input type="number" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                      className="w-full border-2 border-edelweys-border rounded-2xl px-4 py-3 text-sm font-medium text-edelweys-text bg-edelweys-surface/50 font-sans" />
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-bold tracking-[0.1em] uppercase m-0 mb-4" style={{ color: "#8A8279" }}>3. Kebiasaan Harian</p>
              <div className="flex gap-1 p-1 rounded-xl mb-4 border border-edelweys-border-light" style={{ background: "rgba(255, 252, 248, 0.5)" }}>
                <button onClick={() => setHabitsMode("number")} className={`flex-1 py-2.5 px-4 rounded-lg border-none text-sm font-semibold cursor-pointer transition-all ${habitsMode === "number" ? "text-white shadow-sage-sm" : "bg-transparent text-edelweys-text-secondary hover:bg-edelweys-surface/50"}`} style={habitsMode === "number" ? { background: "linear-gradient(135deg, #4A5D4A 0%, #7D9B76 100%)" } : {}}>Angka</button>
                <button onClick={() => setHabitsMode("text")} className={`flex-1 py-2.5 px-4 rounded-lg border-none text-sm font-semibold cursor-pointer transition-all ${habitsMode === "text" ? "text-white shadow-sage-sm" : "bg-transparent text-edelweys-text-secondary hover:bg-edelweys-surface/50"}`} style={habitsMode === "text" ? { background: "linear-gradient(135deg, #4A5D4A 0%, #7D9B76 100%)" } : {}}>Catatan</button>
              </div>
              {habitsMode === "number" ? (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Air Putih (gelas)", name: "water_glasses", placeholder: "8" },
                    { label: "Kopi (cangkir)", name: "coffee_cups", placeholder: "1" },
                    { label: "Olahraga (menit)", name: "exercise_minutes", placeholder: "30" },
                    { label: "Tidur (jam)", name: "sleep_hours", placeholder: "8" },
                  ].map(f => (
                    <div key={f.name}>
                      <label className="text-xs font-semibold text-edelweys-text mb-2 block">{f.label}</label>
                      <input type="number" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                        className="w-full border-2 border-edelweys-border rounded-2xl px-4 py-3 text-sm font-medium text-edelweys-text bg-edelweys-surface/50 font-sans" />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea value={habitsNote} onChange={(e) => setHabitsNote(e.target.value)}
                  placeholder="Tulis catatan kebiasaan harianmu hari ini..."
                  className="w-full min-h-[120px] border-2 border-edelweys-border rounded-2xl p-4 text-sm font-sans resize-y bg-edelweys-surface/50 text-edelweys-text outline-none" />
              )}
            </GlassCard>

            <button onClick={handleSubmit} disabled={saving} className="py-4 rounded-2xl border-none text-white text-sm font-semibold cursor-pointer w-full shadow-sage-sm hover:shadow-sage transition-all" style={{ background: "linear-gradient(135deg, #4A5D4A 0%, #7D9B76 100%)" }}>{saving ? "Menyimpan..." : "Simpan Data Kesehatan"}</button>
            <button onClick={() => { setForm(emptyForm); setHabitsNote(""); }} className="bg-transparent border-none font-medium text-[13px] cursor-pointer underline hover:text-edelweys-text transition-colors" style={{ color: "#8A8279" }}>Reset form</button>
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div className="flex flex-col gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-[11px] font-bold tracking-[0.1em] uppercase m-0 mb-1" style={{ color: "#8A8279" }}>Riwayat Kesehatan ({logs.length} catatan)</p>
            {logs.length === 0 && (
              <GlassCard>
                <p className="text-center py-8" style={{ color: "#8A8279" }}>Belum ada riwayat.</p>
              </GlassCard>
            )}
            {logs.map((log, i) => {
              const bmi = log.bmi ?? calcBMI(log.weight, log.height);
              const bi = bmiCategory(bmi);
              return (
                <GlassCard key={log.id ?? i}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-edelweys-text text-sm">{fmt(log.logged_at)}</span>
                    {i === 0 && <span className="text-white rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: "linear-gradient(135deg, #C4956A 0%, #D4A574 100%)" }}>Terbaru</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {log.weight && <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(125, 155, 118, 0.1)", color: "#7D9B76" }}>{log.weight} kg</span>}
                    {log.height && <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(125, 155, 118, 0.1)", color: "#7D9B76" }}>{log.height} cm</span>}
                    {bmi && <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: bi.bg, color: bi.color }}>BMI {bmi}</span>}
                    {(log.blood_pressure_sytolic || log.blood_pressure_diastolic) && <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(196, 122, 106, 0.1)", color: "#C47A6A" }}>{log.blood_pressure_sytolic ?? "-"}/{log.blood_pressure_diastolic ?? "-"} mmHg</span>}
                  </div>
                </GlassCard>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
