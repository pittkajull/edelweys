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
      ? "bg-edelweys-deep/90 border-white/10 shadow-glass-lg"
      : "bg-white/50 border-white/40 shadow-glass"
  }`} style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
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
      style={{ background: "linear-gradient(135deg, #EEEEE9 0%, #E8EDE5 100%)" }}>
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
      <p className="text-[11px] font-bold text-edelweys-text-tertiary tracking-[0.1em] uppercase m-0 mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-edelweys-text tracking-tight">{value ?? "-"}</span>
        {unit && <span className="text-sm text-edelweys-text-tertiary font-medium">{unit}</span>}
      </div>
      {sub && <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold" style={{ color, background: bg }}>{sub}</span>}
    </GlassCard>
  );

  return (
    <div className="min-h-screen font-sans" style={{ background: "linear-gradient(135deg, #EEEEE9 0%, #E8EDE5 50%, #E0E8DC 100%)" }}>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-[9999] text-white rounded-2xl px-5 py-3 font-semibold text-sm shadow-glass-lg ${
              toast.type === "error" ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-edelweys-sage to-edelweys-light"
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
            <p className="text-[11px] font-bold text-edelweys-text-tertiary tracking-[0.12em] uppercase m-0 mb-1">Selamat datang kembali,</p>
            <h1 className="text-3xl font-extrabold text-edelweys-text m-0 tracking-tight">{profile?.full_name || "User"}</h1>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-right">
              <p className="text-2xl font-extrabold text-edelweys-text m-0 tabular-nums tracking-tight">{timeStr}</p>
              <p className="text-xs text-edelweys-text-tertiary m-0">{dateStr}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate("/chat")} className="px-4 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 border border-white/40 bg-white/50 text-edelweys-text hover:bg-white/70" style={{ backdropFilter: "blur(10px)" }}>Chat</button>
              <button onClick={handleLogout} className="px-4 py-2.5 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 border-none bg-red-50 text-red-600 hover:bg-red-100">Logout</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 md:px-8">
        <div className="max-w-[1000px] mx-auto">
          <div className="flex gap-1 p-1.5 rounded-2xl border border-white/40 shadow-glass"
            style={{ background: "rgba(255,255,255,0.5)", backdropFilter: "blur(20px)" }}>
            {[
              { id: "overview", label: "Overview" },
              { id: "input", label: "Input Data" },
              { id: "history", label: "Riwayat" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-xl border-none text-sm font-bold cursor-pointer transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-edelweys-forest to-edelweys-sage text-white shadow-green-sm"
                    : "bg-transparent text-edelweys-text-secondary hover:bg-white/30"
                }`}>{tab.label}</button>
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
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-edelweys-sage/10 flex items-center justify-center">
                    <svg className="w-8 h-8 text-edelweys-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="font-bold text-lg text-edelweys-text m-0 mb-2">Belum ada data kesehatan</p>
                  <p className="text-edelweys-text-tertiary m-0 mb-6 text-sm">Mulai catat data kesehatanmu untuk melihat overview</p>
                  <button onClick={() => setActiveTab("input")} className="px-6 py-3 rounded-xl border-none bg-gradient-to-r from-edelweys-sage to-edelweys-light text-white text-sm font-bold cursor-pointer shadow-green-sm hover:shadow-green transition-all">Input Data Sekarang</button>
                </div>
              </GlassCard>
            )}

            {latest && (
              <>
                <section>
                  <p className="text-[11px] font-bold text-edelweys-text-tertiary tracking-[0.1em] uppercase m-0 mb-3">Data Terakhir — {fmt(latest.logged_at)}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <MetricCard label="Berat Badan" value={latest.weight} unit="kg" />
                    <MetricCard label="Tinggi Badan" value={latest.height} unit="cm" />
                    <MetricCard label="BMI" value={latestBMI} sub={bmiInfo.label} color={bmiInfo.color} bg={bmiInfo.bg} />
                    {(latest.blood_pressure_sytolic || latest.blood_pressure_diastolic) && <MetricCard label="Tekanan Darah" value={`${latest.blood_pressure_sytolic ?? "-"}/${latest.blood_pressure_diastolic ?? "-"}`} unit="mmHg" color="#EF4444" bg="#FEF2F2" />}
                  </div>
                </section>

                <section>
                  <p className="text-[11px] font-bold text-edelweys-text-tertiary tracking-[0.1em] uppercase m-0 mb-3">Kebiasaan Harian</p>
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
                          <p className="text-xs text-edelweys-text-tertiary font-medium m-0 mt-1">{item.label}</p>
                          <p className={`text-base font-bold m-0 ${item.ok ? "text-edelweys-sage" : "text-edelweys-text-tertiary"}`}>{item.val}</p>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                </section>

                {chartData.length > 1 && (
                  <section>
                    <p className="text-[11px] font-bold text-edelweys-text-tertiary tracking-[0.1em] uppercase m-0 mb-3">Tren 14 Hari</p>
                    <GlassCard>
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={chartData} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#D5E0D2" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#7A8B76" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#7A8B76" }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="Berat" stroke="#6B9162" strokeWidth={2.5} dot={{ r: 4, fill: "#6B9162" }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </GlassCard>
                  </section>
                )}

                {/* Saran Edelweys */}
                <GlassCard dark>
                  <div className="flex items-center gap-3 mb-4">
                    <img src={logo} alt="E" className="w-12 h-12 rounded-lg" />
                    <span className="text-[11px] font-bold text-edelweys-sage tracking-[0.1em] uppercase">Saran Edelweys</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {latest.water_glasses < 8 && (
                      <div className="flex items-start gap-3 p-3 bg-white/[0.06] rounded-xl">
                        <span className="text-lg">💧</span>
                        <p className="text-sm text-edelweys-border-light leading-relaxed m-0">Minum air putih yang cukup! Target 8 gelas sehari. Saat ini baru {latest.water_glasses ?? 0} gelas.</p>
                      </div>
                    )}
                    {latest.exercise_minutes < 30 && (
                      <div className="flex items-start gap-3 p-3 bg-white/[0.06] rounded-xl">
                        <span className="text-lg">🏃</span>
                        <p className="text-sm text-edelweys-border-light leading-relaxed m-0">Coba tambah waktu olahraga minimal 30 menit sehari. Saat ini baru {latest.exercise_minutes ?? 0} menit.</p>
                      </div>
                    )}
                    {latest.sleep_hours < 7 && (
                      <div className="flex items-start gap-3 p-3 bg-white/[0.06] rounded-xl">
                        <span className="text-lg">😴</span>
                        <p className="text-sm text-edelweys-border-light leading-relaxed m-0">Tidurmu kurang! Target 7-8 jam sehari. Saat ini baru {latest.sleep_hours ?? 0} jam.</p>
                      </div>
                    )}
                    {latest.coffee_cups > 3 && (
                      <div className="flex items-start gap-3 p-3 bg-white/[0.06] rounded-xl">
                        <span className="text-lg">☕</span>
                        <p className="text-sm text-edelweys-border-light leading-relaxed m-0">Kopimu kebanyakan! Batasi max 3 cangkir sehari. Saat ini {latest.coffee_cups ?? 0} cangkir.</p>
                      </div>
                    )}
                    {latest.water_glasses >= 8 && latest.exercise_minutes >= 30 && latest.sleep_hours >= 7 && latest.coffee_cups <= 3 && (
                      <div className="flex items-start gap-3 p-3 bg-white/[0.06] rounded-xl">
                        <span className="text-lg">💪</span>
                        <p className="text-sm text-edelweys-border-light leading-relaxed m-0">Kamu udah doing great! Pertahankan pola hidup sehatmu!</p>
                      </div>
                    )}
                  </div>
                </GlassCard>

                <button onClick={() => setActiveTab("input")} className="py-4 rounded-xl border-none bg-gradient-to-r from-edelweys-sage to-edelweys-light text-white text-sm font-bold cursor-pointer w-full shadow-green-sm hover:shadow-green transition-all">Update Data Hari Ini</button>
              </>
            )}
          </motion.div>
        )}

        {activeTab === "input" && (
          <motion.div className="flex flex-col gap-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassCard>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-edelweys-sage/10 border border-edelweys-sage/20">
                <svg className="w-5 h-5 text-edelweys-sage flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                  <p className="m-0 font-semibold text-edelweys-text text-sm">Catat kondisi kesehatanmu hari ini</p>
                  <p className="mt-0.5 text-xs text-edelweys-text-tertiary m-0">Data yang kamu isi membantu Edelweys memberikan saran personal</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <label className="text-xs font-bold text-edelweys-text-tertiary tracking-wide uppercase mb-2 block">Tanggal</label>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                className="w-full border-2 border-edelweys-border rounded-xl px-4 py-3 text-sm text-edelweys-text bg-white/40 font-sans" style={{ backdropFilter: "blur(10px)" }} />
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-bold text-edelweys-text-tertiary tracking-[0.1em] uppercase m-0 mb-4">1. Data Tubuh</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Berat Badan (kg)", name: "weight", placeholder: "65" },
                  { label: "Tinggi Badan (cm)", name: "height", placeholder: "165" },
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-xs font-semibold text-edelweys-text mb-2 block">{f.label}</label>
                    <input type="number" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                      className="w-full border-2 border-edelweys-border rounded-xl px-4 py-3 text-sm font-medium text-edelweys-text bg-white/40 font-sans" style={{ backdropFilter: "blur(10px)" }} />
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-bold text-edelweys-text-tertiary tracking-[0.1em] uppercase m-0 mb-4">2. Tekanan Darah <span className="font-normal">(opsional)</span></p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Sistolik", name: "systolic", placeholder: "120" },
                  { label: "Diastolik", name: "diastolic", placeholder: "80" },
                ].map(f => (
                  <div key={f.name}>
                    <label className="text-xs font-semibold text-edelweys-text mb-2 block">{f.label}</label>
                    <input type="number" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                      className="w-full border-2 border-edelweys-border rounded-xl px-4 py-3 text-sm font-medium text-edelweys-text bg-white/40 font-sans" style={{ backdropFilter: "blur(10px)" }} />
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <p className="text-[11px] font-bold text-edelweys-text-tertiary tracking-[0.1em] uppercase m-0 mb-4">3. Kebiasaan Harian</p>
              <div className="flex gap-1 p-1 bg-white/30 rounded-xl mb-4 border border-white/40" style={{ backdropFilter: "blur(10px)" }}>
                <button onClick={() => setHabitsMode("number")} className={`flex-1 py-2.5 px-4 rounded-lg border-none text-sm font-bold cursor-pointer transition-all ${habitsMode === "number" ? "bg-gradient-to-r from-edelweys-sage to-edelweys-light text-white shadow-green-sm" : "bg-transparent text-edelweys-text-secondary hover:bg-white/30"}`}>Angka</button>
                <button onClick={() => setHabitsMode("text")} className={`flex-1 py-2.5 px-4 rounded-lg border-none text-sm font-bold cursor-pointer transition-all ${habitsMode === "text" ? "bg-gradient-to-r from-edelweys-sage to-edelweys-light text-white shadow-green-sm" : "bg-transparent text-edelweys-text-secondary hover:bg-white/30"}`}>Catatan</button>
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
                        className="w-full border-2 border-edelweys-border rounded-xl px-4 py-3 text-sm font-medium text-edelweys-text bg-white/40 font-sans" style={{ backdropFilter: "blur(10px)" }} />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea value={habitsNote} onChange={(e) => setHabitsNote(e.target.value)}
                  placeholder="Tulis catatan kebiasaan harianmu hari ini..."
                  className="w-full min-h-[120px] border-2 border-edelweys-border rounded-xl p-4 text-sm font-sans resize-y bg-white/40 text-edelweys-text outline-none" style={{ backdropFilter: "blur(10px)" }} />
              )}
            </GlassCard>

            <button onClick={handleSubmit} disabled={saving} className="py-4 rounded-xl border-none bg-gradient-to-r from-edelweys-sage to-edelweys-light text-white text-sm font-bold cursor-pointer w-full shadow-green-sm hover:shadow-green transition-all">{saving ? "Menyimpan..." : "Simpan Data Kesehatan"}</button>
            <button onClick={() => { setForm(emptyForm); setHabitsNote(""); }} className="bg-transparent border-none text-edelweys-text-tertiary font-medium text-[13px] cursor-pointer underline hover:text-edelweys-text transition-colors">Reset form</button>
          </motion.div>
        )}

        {activeTab === "history" && (
          <motion.div className="flex flex-col gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-[11px] font-bold text-edelweys-text-tertiary tracking-[0.1em] uppercase m-0 mb-1">Riwayat Kesehatan ({logs.length} catatan)</p>
            {logs.length === 0 && (
              <GlassCard>
                <p className="text-edelweys-text-tertiary text-center py-8">Belum ada riwayat.</p>
              </GlassCard>
            )}
            {logs.map((log, i) => {
              const bmi = log.bmi ?? calcBMI(log.weight, log.height);
              const bi = bmiCategory(bmi);
              return (
                <GlassCard key={log.id ?? i}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-edelweys-text text-sm">{fmt(log.logged_at)}</span>
                    {i === 0 && <span className="bg-gradient-to-r from-edelweys-sage to-edelweys-light text-white rounded-full px-3 py-1 text-[11px] font-bold">Terbaru</span>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {log.weight && <span className="bg-edelweys-sage/10 text-edelweys-sage rounded-full px-3 py-1 text-xs font-semibold">{log.weight} kg</span>}
                    {log.height && <span className="bg-edelweys-sage/10 text-edelweys-sage rounded-full px-3 py-1 text-xs font-semibold">{log.height} cm</span>}
                    {bmi && <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: bi.bg, color: bi.color }}>BMI {bmi}</span>}
                    {(log.blood_pressure_sytolic || log.blood_pressure_diastolic) && <span className="bg-red-50 text-red-500 rounded-full px-3 py-1 text-xs font-semibold">{log.blood_pressure_sytolic ?? "-"}/{log.blood_pressure_diastolic ?? "-"} mmHg</span>}
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
