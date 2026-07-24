import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/edelweys-new-logo.png";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const calcBMI = (weight, height) => {
  if (!weight || !height || height === 0) return null;
  return (weight / ((height / 100) ** 2)).toFixed(1);
};

const bmiCategory = (bmi) => {
  if (!bmi) return { label: "-", color: "#7A8B76", bg: "#F3F4F6" };
  const b = parseFloat(bmi);
  if (b < 18.5) return { label: "Kurang", color: "#3B82F6", bg: "#EFF6FF" };
  if (b < 25) return { label: "Normal", color: "#6B9162", bg: "#F0FDF4" };
  if (b < 30) return { label: "Berlebih", color: "#F59E0B", bg: "#FFFBEB" };
  return { label: "Obesitas", color: "#EF4444", bg: "#FEF2F2" };
};

const fmt = (d) => new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short" });

const GlassCard = ({ children, className = "", dark = false }) => (
  <div className={`rounded-2xl p-5 border transition-all duration-200 ${
    dark
      ? "border-white/10"
      : "border"
  }`} style={{
    background: dark ? "#1E3319" : "rgba(255,255,255,0.5)",
    borderColor: dark ? "rgba(255,255,255,0.1)" : "rgba(30,51,25,0.1)",
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

      const { data: hlogs } = await supabase.from("health_logs").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(30);
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
      created_at: form.date,
    };
    if (form.weight) payload.weight = parseFloat(form.weight);
    if (form.height) payload.height = parseFloat(form.height);
    if (form.systolic && form.diastolic) payload.blood_pressure = `${form.systolic}/${form.diastolic}`;
    if (form.coffee_cups) payload.coffee_cups = parseInt(form.coffee_cups);
    if (form.exercise_minutes) payload.exercise_minutes = parseInt(form.exercise_minutes);
    if (form.water_glasses) payload.water_glasses = parseInt(form.water_glasses);
    if (form.sleep_hours) payload.sleep_hours = parseFloat(form.sleep_hours);

    console.log("Payload:", payload);

    const { error } = await supabase.from("health_logs").upsert(payload, { onConflict: "user_id,created_at" });
    if (error) {
      console.error("Gagal simpan:", error);
      showToast("Gagal simpan: " + error.message, "error");
    }
    else {
      showToast("Data kesehatan berhasil disimpan!");
      const { data: hlogs } = await supabase.from("health_logs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30);
      setLogs(hlogs || []);
      setActiveTab("overview");
    }
    setSaving(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/login"); };

  const latest = logs[0] || null;
  const latestBMI = latest?.bmi ?? (latest ? calcBMI(latest.weight, latest.height) : null);
  const bmiInfo = bmiCategory(latestBMI);
  const chartData = [...logs].reverse().slice(-14).map(l => ({ date: fmt(l.created_at), Berat: l.weight }));
  const timeStr = currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center flex-col gap-4 fixed inset-0 font-sans"
      style={{ background: "linear-gradient(135deg, #D9E2D4 0%, #C8D4C0 100%)" }}>
      <motion.div
        className="w-12 h-12 rounded-full border-[3px] border-edelweys-border border-t-edelweys-sage"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-edelweys-text-tertiary font-medium text-sm">Memuat dashboard...</p>
    </div>
  );

  const MetricCard = ({ label, value, unit, sub, color = "#6B9162", bg = "#F0FDF4" }) => (
    <GlassCard>
      <p className="text-[11px] font-medium tracking-wide uppercase m-0 mb-1" style={{ color: "#5A6B57" }}>{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold" style={{ color: "#1E3319" }}>{value ?? "-"}</span>
        {unit && <span className="text-sm" style={{ color: "#5A6B57" }}>{unit}</span>}
      </div>
      {sub && <span className="inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium" style={{ color, background: bg }}>{sub}</span>}
    </GlassCard>
  );

  return (
    <div className="min-h-screen font-sans" style={{ background: "#D9E2D4" }}>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-[9999] text-white rounded-xl px-4 py-3 font-medium text-sm ${
              toast.type === "error" ? "bg-red-500" : "bg-[#6B9162]"
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === "error" ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              )}
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-6 py-4 border-b" style={{ borderColor: "rgba(30,51,25,0.12)", background: "rgba(217,226,212,0.9)", backdropFilter: "blur(12px)" }}>
        <div className="max-w-[1000px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Edelweys" className="w-8 h-8 rounded-lg" />
            <div>
              <p className="m-0 text-sm font-medium" style={{ color: "#1E3319" }}>Dashboard</p>
              <p className="m-0 text-xs" style={{ color: "#5A6B57" }}>{profile?.full_name || "User"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/chat")} className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors border" style={{ borderColor: "rgba(30,51,25,0.15)", color: "#1E3319", background: "transparent" }}>Chat</button>
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors border-none" style={{ color: "#5A6B57" }}>Logout</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex gap-1 p-1 rounded-xl border"
            style={{ background: "rgba(255,255,255,0.3)", borderColor: "rgba(30,51,25,0.1)" }}>
            {[
              { id: "overview", label: "Overview" },
              { id: "input", label: "Input Data" },
              { id: "history", label: "Riwayat" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-4 rounded-lg border-none text-sm font-medium cursor-pointer transition-all ${
                  activeTab === tab.id
                    ? "text-white"
                    : "bg-transparent hover:bg-white/30"
                }`} style={activeTab === tab.id ? { background: "#6B9162" } : { color: "#5A6B57" }}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1000px] mx-auto px-6 py-6 pb-12">
        {activeTab === "overview" && (
          <motion.div className="flex flex-col gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {!latest && (
              <GlassCard>
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: "rgba(107,145,98,0.1)" }}>
                    <svg className="w-6 h-6" style={{ color: "#6B9162" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="font-semibold text-base m-0 mb-1" style={{ color: "#1E3319" }}>Belum ada data kesehatan</p>
                  <p className="m-0 mb-5 text-sm" style={{ color: "#5A6B57" }}>Mulai catat data kesehatanmu untuk melihat overview</p>
                  <button onClick={() => setActiveTab("input")} className="px-5 py-2.5 rounded-xl border-none text-white text-sm font-medium cursor-pointer" style={{ background: "#6B9162" }}>Input Data Sekarang</button>
                </div>
              </GlassCard>
            )}

            {latest && (
              <>
                <section>
                  <p className="text-[11px] font-medium tracking-wide uppercase m-0 mb-3" style={{ color: "#5A6B57" }}>Data Terakhir — {fmt(latest.created_at)}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricCard label="Berat Badan" value={latest.weight} unit="kg" />
                    <MetricCard label="Tinggi Badan" value={latest.height} unit="cm" />
                    <MetricCard label="BMI" value={latestBMI} sub={bmiInfo.label} color={bmiInfo.color} bg={bmiInfo.bg} />
                    {latest.blood_pressure && <MetricCard label="Tekanan Darah" value={latest.blood_pressure} unit="mmHg" color="#EF4444" bg="#FEF2F2" />}
                  </div>
                </section>

                <section>
                  <p className="text-[11px] font-medium tracking-wide uppercase m-0 mb-3" style={{ color: "#5A6B57" }}>Kebiasaan Harian</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Air Putih", val: `${latest.water_glasses ?? 0}/8`, ok: (latest.water_glasses ?? 0) >= 8, icon: "💧" },
                      { label: "Olahraga", val: `${latest.exercise_minutes ?? 0}/60m`, ok: (latest.exercise_minutes ?? 0) >= 30, icon: "🏃" },
                      { label: "Tidur", val: `${latest.sleep_hours ?? 0}/8j`, ok: (latest.sleep_hours ?? 0) >= 7, icon: "😴" },
                      { label: "Kopi", val: `${latest.coffee_cups ?? 0}/3`, ok: (latest.coffee_cups ?? 0) <= 3, icon: "☕" },
                    ].map(item => (
                      <GlassCard key={item.label}>
                        <div className={`border-l-[3px] pl-3 ${item.ok ? "border-l-[#6B9162]" : "border-l-edelweys-border"}`}>
                          <span className="text-lg">{item.icon}</span>
                          <p className="text-xs font-medium m-0 mt-1" style={{ color: "#5A6B57" }}>{item.label}</p>
                          <p className={`text-base font-semibold m-0 ${item.ok ? "text-[#6B9162]" : ""}`} style={!item.ok ? { color: "#5A6B57" } : {}}>{item.val}</p>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </section>

                {chartData.length > 1 && (
                  <section>
                    <p className="text-[11px] font-medium tracking-wide uppercase m-0 mb-3" style={{ color: "#5A6B57" }}>Tren 14 Hari</p>
                    <GlassCard>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={chartData} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,51,25,0.08)" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#5A6B57" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#5A6B57" }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="Berat" stroke="#6B9162" strokeWidth={2} dot={{ r: 3, fill: "#6B9162" }} activeDot={{ r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </GlassCard>
                  </section>
                )}

                {/* Saran Edelweys */}
                <GlassCard dark>
                  <div className="flex items-center gap-3 mb-4">
                    <img src={logo} alt="E" className="w-10 h-10 rounded-lg" />
                    <span className="text-[11px] font-medium tracking-wide uppercase" style={{ color: "#6B9162" }}>Saran Edelweys</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {latest.water_glasses < 8 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <span className="text-lg">💧</span>
                        <p className="text-sm leading-relaxed m-0" style={{ color: "rgba(255,255,255,0.7)" }}>Minum air putih yang cukup! Target 8 gelas sehari. Saat ini baru {latest.water_glasses ?? 0} gelas.</p>
                      </div>
                    )}
                    {latest.exercise_minutes < 30 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <span className="text-lg">🏃</span>
                        <p className="text-sm leading-relaxed m-0" style={{ color: "rgba(255,255,255,0.7)" }}>Coba tambah waktu olahraga minimal 30 menit sehari. Saat ini baru {latest.exercise_minutes ?? 0} menit.</p>
                      </div>
                    )}
                    {latest.sleep_hours < 7 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <span className="text-lg">😴</span>
                        <p className="text-sm leading-relaxed m-0" style={{ color: "rgba(255,255,255,0.7)" }}>Tidurmu kurang! Target 7-8 jam sehari. Saat ini baru {latest.sleep_hours ?? 0} jam.</p>
                      </div>
                    )}
                    {latest.coffee_cups > 3 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <span className="text-lg">☕</span>
                        <p className="text-sm leading-relaxed m-0" style={{ color: "rgba(255,255,255,0.7)" }}>Kopimu kebanyakan! Batasi max 3 cangkir sehari. Saat ini {latest.coffee_cups ?? 0} cangkir.</p>
                      </div>
                    )}
                    {latest.water_glasses >= 8 && latest.exercise_minutes >= 30 && latest.sleep_hours >= 7 && latest.coffee_cups <= 3 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <span className="text-lg">💪</span>
                        <p className="text-sm leading-relaxed m-0" style={{ color: "rgba(255,255,255,0.7)" }}>Kamu udah doing great! Pertahankan pola hidup sehatmu!</p>
                      </div>
                    )}
                  </div>
                </GlassCard>

                <button onClick={() => setActiveTab("input")} className="py-3 rounded-xl border-none text-white text-sm font-medium cursor-pointer w-full" style={{ background: "#6B9162" }}>Update Data Hari Ini</button>
              </>
            )}
          </motion.div>
        )}

        {activeTab === "input" && (
          <motion.div className="flex flex-col gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard>
              <div className="flex items-center gap-3 p-3 rounded-xl border" style={{ background: "rgba(107,145,98,0.08)", borderColor: "rgba(107,145,98,0.15)" }}>
                <svg className="w-5 h-5 flex-shrink-0" style={{ color: "#6B9162" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <p className="m-0 font-medium text-sm" style={{ color: "#1E3319" }}>Catat kondisi kesehatanmu hari ini</p>
                  <p className="mt-0.5 text-xs m-0" style={{ color: "#5A6B57" }}>Data yang kamu isi membantu Edelweys memberikan saran personal</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <label className="text-xs font-medium mb-2 block" style={{ color: "#5A6B57" }}>Tanggal</label>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 text-sm bg-white/50 font-sans outline-none focus:border-[#6B9162]"
                style={{ borderColor: "rgba(30,51,25,0.15)", color: "#1E3319" }} />
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-medium tracking-wide uppercase m-0 mb-4" style={{ color: "#5A6B57" }}>1. Data Tubuh</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Berat Badan (kg)", name: "weight", placeholder: "65" },
                  { label: "Tinggi Badan (cm)", name: "height", placeholder: "165" },
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-xs font-medium mb-2 block" style={{ color: "#5A6B57" }}>{f.label}</label>
                    <input type="number" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                      className="w-full border rounded-lg px-4 py-3 text-sm font-medium bg-white/50 font-sans outline-none focus:border-[#6B9162]"
                      style={{ borderColor: "rgba(30,51,25,0.15)", color: "#1E3319" }} />
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-medium tracking-wide uppercase m-0 mb-4" style={{ color: "#5A6B57" }}>2. Tekanan Darah <span className="font-normal">(opsional)</span></p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Sistolik", name: "systolic", placeholder: "120" },
                  { label: "Diastolik", name: "diastolic", placeholder: "80" },
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-xs font-medium mb-2 block" style={{ color: "#5A6B57" }}>{f.label}</label>
                    <input type="number" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                      className="w-full border rounded-lg px-4 py-3 text-sm font-medium bg-white/50 font-sans outline-none focus:border-[#6B9162]"
                      style={{ borderColor: "rgba(30,51,25,0.15)", color: "#1E3319" }} />
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-medium tracking-wide uppercase m-0 mb-4" style={{ color: "#5A6B57" }}>3. Kebiasaan Harian</p>
              <div className="flex gap-1 p-1 rounded-xl mb-4 border" style={{ background: "rgba(255,255,255,0.3)", borderColor: "rgba(30,51,25,0.1)" }}>
                <button onClick={() => setHabitsMode("number")} className={`flex-1 py-2 px-4 rounded-lg border-none text-sm font-medium cursor-pointer transition-all ${habitsMode === "number" ? "text-white" : "bg-transparent hover:bg-white/30"}`} style={habitsMode === "number" ? { background: "#6B9162" } : { color: "#5A6B57" }}>Angka</button>
                <button onClick={() => setHabitsMode("text")} className={`flex-1 py-2 px-4 rounded-lg border-none text-sm font-medium cursor-pointer transition-all ${habitsMode === "text" ? "text-white" : "bg-transparent hover:bg-white/30"}`} style={habitsMode === "text" ? { background: "#6B9162" } : { color: "#5A6B57" }}>Catatan</button>
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
                      <label className="text-xs font-medium mb-2 block" style={{ color: "#5A6B57" }}>{f.label}</label>
                      <input type="number" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                        className="w-full border rounded-lg px-4 py-3 text-sm font-medium bg-white/50 font-sans outline-none focus:border-[#6B9162]"
                        style={{ borderColor: "rgba(30,51,25,0.15)", color: "#1E3319" }} />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea value={habitsNote} onChange={(e) => setHabitsNote(e.target.value)}
                  placeholder="Tulis catatan kebiasaan harianmu hari ini..."
                  className="w-full min-h-[100px] border rounded-lg p-4 text-sm font-sans resize-y bg-white/50 outline-none focus:border-[#6B9162]"
                  style={{ borderColor: "rgba(30,51,25,0.15)", color: "#1E3319" }} />
              )}
            </GlassCard>

            <button onClick={handleSubmit} disabled={saving} className="py-3 rounded-xl border-none text-white text-sm font-medium cursor-pointer w-full" style={{ background: "#6B9162" }}>{saving ? "Menyimpan..." : "Simpan Data Kesehatan"}</button>
            <button onClick={() => { setForm(emptyForm); setHabitsNote(""); }} className="bg-transparent border-none font-medium text-[13px] cursor-pointer underline transition-colors" style={{ color: "#5A6B57" }}>Reset form</button>
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div className="flex flex-col gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-[11px] font-medium tracking-wide uppercase m-0 mb-1" style={{ color: "#5A6B57" }}>Riwayat Kesehatan ({logs.length} catatan)</p>
            {logs.length === 0 && (
              <GlassCard>
                <p className="text-center py-8" style={{ color: "#5A6B57" }}>Belum ada riwayat.</p>
              </GlassCard>
            )}
            {logs.map((log, i) => {
              const bmi = log.bmi ?? calcBMI(log.weight, log.height);
              const bi = bmiCategory(bmi);
              return (
                <GlassCard key={log.id ?? i}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-sm" style={{ color: "#1E3319" }}>{fmt(log.created_at)}</span>
                    {i === 0 && <span className="text-white rounded-lg px-2 py-0.5 text-[11px] font-medium" style={{ background: "#6B9162" }}>Terbaru</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {log.weight && <span className="rounded-lg px-2 py-1 text-xs font-medium" style={{ background: "rgba(107,145,98,0.1)", color: "#6B9162" }}>{log.weight} kg</span>}
                    {log.height && <span className="rounded-lg px-2 py-1 text-xs font-medium" style={{ background: "rgba(107,145,98,0.1)", color: "#6B9162" }}>{log.height} cm</span>}
                    {bmi && <span className="rounded-lg px-2 py-1 text-xs font-medium" style={{ background: bi.bg, color: bi.color }}>BMI {bmi}</span>}
                    {log.blood_pressure && <span className="rounded-lg px-2 py-1 text-xs font-medium" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>{log.blood_pressure} mmHg</span>}
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
