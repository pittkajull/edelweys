import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/edelweys.png";
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
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      setProfile(prof);
      const { data: hlogs } = await supabase.from("health_logs").select("*").eq("user_id", session.user.id).order("date", { ascending: false }).limit(30);
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
    const blood_pressure = form.systolic && form.diastolic ? `${form.systolic}/${form.diastolic}` : null;
    const payload = {
      user_id: user.id, date: form.date,
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
    const { error } = await supabase.from("health_logs").upsert(payload, { onConflict: "user_id,date" });
    if (error) { showToast("Gagal simpan, coba lagi!", "error"); }
    else {
      showToast("Data kesehatan berhasil disimpan!");
      const { data: hlogs } = await supabase.from("health_logs").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(30);
      setLogs(hlogs || []);
      setActiveTab("overview");
    }
    setSaving(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/login"); };

  const latest = logs[0] || null;
  const latestBMI = latest?.bmi ?? (latest ? calcBMI(latest.weight, latest.height) : null);
  const bmiInfo = bmiCategory(latestBMI);
  const chartData = [...logs].reverse().slice(-14).map(l => ({ date: fmt(l.date), Berat: l.weight }));
  const timeStr = currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = currentTime.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  if (loading) return (
    <div className="h-screen w-screen bg-edelweys-bg flex items-center justify-center flex-col gap-4 fixed inset-0 font-sans">
      <div className="w-9 h-9 rounded-full border-[3px] border-edelweys-border border-t-edelweys-sage animate-spin" />
      <p className="text-edelweys-text-tertiary font-medium text-sm">Memuat dashboard...</p>
    </div>
  );

  const MetricCard = ({ label, value, unit, sub, color = "#6B9162", bg = "#F0FDF4" }) => (
    <div className="bg-white/70 backdrop-blur-[10px] rounded-[14px] p-5 border border-white/50 shadow-glass">
      <p className="text-[11px] font-semibold text-edelweys-text-tertiary tracking-widest uppercase m-0 mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-edelweys-text tracking-tight">{value ?? "-"}</span>
        {unit && <span className="text-sm text-edelweys-text-tertiary font-medium">{unit}</span>}
      </div>
      {sub && <span className="inline-block mt-2 px-2.5 py-0.5 rounded-pill text-xs font-semibold" style={{ color, background: bg }}>{sub}</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-edelweys-bg font-sans">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-[9999] text-white rounded-xl px-5 py-3 font-medium text-sm shadow-lg ${toast.type === "error" ? "bg-red-600" : "bg-edelweys-sage"}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-4 md:px-6 pt-5 flex justify-between items-start flex-wrap gap-3">
        <div>
          <p className="text-[10px] font-semibold text-edelweys-text-tertiary tracking-widest uppercase m-0 mb-1">SELAMAT DATANG KEMBALI,</p>
          <h1 className="text-2xl font-extrabold text-edelweys-text m-0 tracking-tight">{profile?.full_name || "User"} 🌿</h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="text-right">
            <p className="text-xl font-extrabold text-edelweys-text m-0 tabular-nums">{timeStr}</p>
            <p className="text-xs text-edelweys-text-tertiary m-0">{dateStr}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate("/chat")} className="px-3.5 py-2.5 rounded-[10px] border border-white/50 bg-white/50 text-edelweys-text text-[13px] font-semibold cursor-pointer backdrop-blur-[10px]">Chat</button>
            <button onClick={handleLogout} className="px-3.5 py-2.5 rounded-[10px] border-none bg-red-50 text-red-600 text-[13px] font-medium cursor-pointer">Logout</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1.5 bg-white/70 backdrop-blur-glass rounded-2xl mx-4 md:mx-6 mt-4 border border-white/50 shadow-glass">
        {[
          { id: "overview", label: "Overview" },
          { id: "input", label: "Input Data" },
          { id: "history", label: "Riwayat" },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-3 rounded-[10px] border-none text-[13px] font-semibold cursor-pointer transition-all font-sans ${
              activeTab === tab.id ? "bg-edelweys-forest text-white" : "bg-transparent text-edelweys-text-secondary"
            }`}>{tab.label}</button>
        ))}
      </div>

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-4 md:px-6 py-5 pb-10">

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="flex flex-col gap-4">
            {!latest && (
              <div className="bg-white/70 backdrop-blur-[10px] rounded-[14px] p-5 border border-white/50 shadow-glass">
                <p className="font-bold text-base text-edelweys-text m-0 mb-2">Belum ada data kesehatan</p>
                <p className="text-edelweys-text-tertiary m-0 mb-5 text-sm">Mulai catat data kesehatanmu untuk melihat overview</p>
                <button onClick={() => setActiveTab("input")} className="px-5 py-3 rounded-xl border-none bg-edelweys-sage text-white text-sm font-semibold cursor-pointer">Input Data Sekarang</button>
              </div>
            )}
            {latest && (
              <>
                <section>
                  <p className="text-[11px] font-semibold text-edelweys-text-tertiary tracking-widest uppercase m-0 mb-3">Data Terakhir — {fmt(latest.date)}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard label="Berat Badan" value={latest.weight} unit="kg" />
                    <MetricCard label="Tinggi Badan" value={latest.height} unit="cm" />
                    <MetricCard label="BMI" value={latestBMI} sub={bmiInfo.label} color={bmiInfo.color} bg={bmiInfo.bg} />
                    {latest.blood_pressure && <MetricCard label="Tekanan Darah" value={latest.blood_pressure} unit="mmHg" color="#EF4444" bg="#FEF2F2" />}
                  </div>
                </section>

                <section>
                  <p className="text-[11px] font-semibold text-edelweys-text-tertiary tracking-widest uppercase m-0 mb-3">Kebiasaan Harian</p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { label: "Air Putih", val: `${latest.water_glasses ?? 0}/8`, ok: (latest.water_glasses ?? 0) >= 8 },
                      { label: "Olahraga", val: `${latest.exercise_minutes ?? 0}/60m`, ok: (latest.exercise_minutes ?? 0) >= 30 },
                      { label: "Tidur", val: `${latest.sleep_hours ?? 0}/8j`, ok: (latest.sleep_hours ?? 0) >= 7 },
                      { label: "Kopi", val: `${latest.coffee_cups ?? 0}/3`, ok: (latest.coffee_cups ?? 0) <= 3 },
                    ].map(item => (
                      <div key={item.label} className={`bg-white/70 backdrop-blur-[10px] rounded-[14px] p-4 border border-white/50 shadow-glass border-l-[3px] ${item.ok ? "border-l-edelweys-sage" : "border-l-edelweys-border"}`}>
                        <span className="text-xs text-edelweys-text-tertiary font-medium block">{item.label}</span>
                        <span className={`text-base font-bold ${item.ok ? "text-edelweys-sage" : "text-edelweys-text-tertiary"}`}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {chartData.length > 1 && (
                  <section>
                    <p className="text-[11px] font-semibold text-edelweys-text-tertiary tracking-widest uppercase m-0 mb-3">Tren 14 Hari</p>
                    <div className="bg-white/70 backdrop-blur-[10px] rounded-[14px] p-4 border border-white/50 shadow-glass">
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={chartData} margin={{ top: 5, right: 16, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#D5E0D2" />
                          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#7A8B76" }} />
                          <YAxis tick={{ fontSize: 11, fill: "#7A8B76" }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="Berat" stroke="#6B9162" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                )}

                {/* Saran Edelweys */}
                <div className="bg-white/70 backdrop-blur-[10px] rounded-[14px] p-5 border border-white/50 shadow-glass bg-edelweys-deep border-none">
                  <div className="flex items-center gap-2.5 mb-4">
                    <img src={logo} alt="E" className="w-7 h-7 rounded-lg" />
                    <span className="text-[11px] font-semibold text-edelweys-sage tracking-widest">SARAN EDELWEYS</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {latest.water_glasses < 8 && (
                      <div className="flex items-start gap-2.5 p-2.5 bg-white/[0.08] rounded-[10px]">
                        <span>💧</span>
                        <p className="text-[13px] text-edelweys-border-light leading-relaxed m-0">Minum air putih yang cukup! Target 8 gelas sehari. Saat ini baru {latest.water_glasses ?? 0} gelas.</p>
                      </div>
                    )}
                    {latest.exercise_minutes < 30 && (
                      <div className="flex items-start gap-2.5 p-2.5 bg-white/[0.08] rounded-[10px]">
                        <span>🏃</span>
                        <p className="text-[13px] text-edelweys-border-light leading-relaxed m-0">Coba tambah waktu olahraga minimal 30 menit sehari. Saat ini baru {latest.exercise_minutes ?? 0} menit.</p>
                      </div>
                    )}
                    {latest.sleep_hours < 7 && (
                      <div className="flex items-start gap-2.5 p-2.5 bg-white/[0.08] rounded-[10px]">
                        <span>😴</span>
                        <p className="text-[13px] text-edelweys-border-light leading-relaxed m-0">Tidurmu kurang! Target 7-8 jam sehari. Saat ini baru {latest.sleep_hours ?? 0} jam.</p>
                      </div>
                    )}
                    {latest.coffee_cups > 3 && (
                      <div className="flex items-start gap-2.5 p-2.5 bg-white/[0.08] rounded-[10px]">
                        <span>☕</span>
                        <p className="text-[13px] text-edelweys-border-light leading-relaxed m-0">Kopimu kebanyakan! Batasi max 3 cangkir sehari. Saat ini {latest.coffee_cups ?? 0} cangkir.</p>
                      </div>
                    )}
                    {latest.water_glasses >= 8 && latest.exercise_minutes >= 30 && latest.sleep_hours >= 7 && latest.coffee_cups <= 3 && (
                      <div className="flex items-start gap-2.5 p-2.5 bg-white/[0.08] rounded-[10px]">
                        <span>💪</span>
                        <p className="text-[13px] text-edelweys-border-light leading-relaxed m-0">Kamu udah doing great! Pertahankan pola hidup sehatmu!</p>
                      </div>
                    )}
                  </div>
                </div>

                <button onClick={() => setActiveTab("input")} className="py-3.5 rounded-xl border-none bg-edelweys-sage text-white text-sm font-semibold cursor-pointer w-full">Update Data Hari Ini</button>
              </>
            )}
          </div>
        )}

        {/* INPUT TAB */}
        {activeTab === "input" && (
          <div className="flex flex-col gap-4">
            <div className="bg-white/70 backdrop-blur-[10px] rounded-[14px] p-4 border border-white/50 shadow-glass bg-edelweys-sage/10 border border-edelweys-sage/30">
              <p className="m-0 font-semibold text-edelweys-text text-sm">Catat kondisi kesehatanmu hari ini</p>
              <p className="mt-1 text-xs text-edelweys-text-tertiary m-0">Data yang kamu isi membantu Edelweys memberikan saran personal</p>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-edelweys-text">Tanggal</label>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                className="border-2 border-edelweys-border rounded-xl px-3.5 py-3 text-sm text-edelweys-text bg-white/60 font-sans backdrop-blur-[10px]" />
            </div>

            <div>
              <p className="text-[11px] font-semibold text-edelweys-text-tertiary tracking-widest uppercase m-0 mb-3">1. Data Tubuh</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Berat Badan (kg)", name: "weight", placeholder: "65" },
                  { label: "Tinggi Badan (cm)", name: "height", placeholder: "165" },
                ].map(f => (
                  <div key={f.name} className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-edelweys-text">{f.label}</label>
                    <input type="number" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                      className="border-2 border-edelweys-border rounded-xl px-3.5 py-3 text-sm font-medium text-edelweys-text bg-white/60 font-sans backdrop-blur-[10px] w-full" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-edelweys-text-tertiary tracking-widest uppercase m-0 mb-3">2. Tekanan Darah <span className="font-normal">(opsional)</span></p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Sistolik", name: "systolic", placeholder: "120" },
                  { label: "Diastolik", name: "diastolic", placeholder: "80" },
                ].map(f => (
                  <div key={f.name} className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-edelweys-text">{f.label}</label>
                    <input type="number" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                      className="border-2 border-edelweys-border rounded-xl px-3.5 py-3 text-sm font-medium text-edelweys-text bg-white/60 font-sans backdrop-blur-[10px] w-full" />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-edelweys-text-tertiary tracking-widest uppercase m-0 mb-3">3. Kebiasaan Harian</p>
              <div className="flex gap-1 p-1 bg-white/50 rounded-xl mb-3 border border-white/50">
                <button onClick={() => setHabitsMode("number")} className={`flex-1 py-2 px-3 rounded-[10px] border-none text-[13px] font-semibold cursor-pointer transition-all font-sans ${habitsMode === "number" ? "bg-edelweys-sage text-white" : "bg-transparent text-edelweys-text-secondary"}`}>Angka</button>
                <button onClick={() => setHabitsMode("text")} className={`flex-1 py-2 px-3 rounded-[10px] border-none text-[13px] font-semibold cursor-pointer transition-all font-sans ${habitsMode === "text" ? "bg-edelweys-sage text-white" : "bg-transparent text-edelweys-text-secondary"}`}>Catatan</button>
              </div>
              {habitsMode === "number" ? (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Air Putih (gelas)", name: "water_glasses", placeholder: "8" },
                    { label: "Kopi (cangkir)", name: "coffee_cups", placeholder: "1" },
                    { label: "Olahraga (menit)", name: "exercise_minutes", placeholder: "30" },
                    { label: "Tidur (jam)", name: "sleep_hours", placeholder: "8" },
                  ].map(f => (
                    <div key={f.name} className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-edelweys-text">{f.label}</label>
                      <input type="number" name={f.name} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder}
                        className="border-2 border-edelweys-border rounded-xl px-3.5 py-3 text-sm font-medium text-edelweys-text bg-white/60 font-sans backdrop-blur-[10px] w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <textarea value={habitsNote} onChange={(e) => setHabitsNote(e.target.value)}
                  placeholder="Tulis catatan kebiasaan harianmu hari ini..."
                  className="w-full min-h-[120px] border-2 border-edelweys-border rounded-xl p-3.5 text-sm font-sans resize-y bg-white/60 text-edelweys-text outline-none box-border" />
              )}
            </div>

            <button onClick={handleSubmit} disabled={saving} className="py-3.5 rounded-xl border-none bg-edelweys-sage text-white text-sm font-semibold cursor-pointer w-full">{saving ? "Menyimpan..." : "Simpan Data Kesehatan"}</button>
            <button onClick={() => { setForm(emptyForm); setHabitsNote(""); }} className="bg-transparent border-none text-edelweys-text-tertiary font-medium text-[13px] cursor-pointer underline">Reset form</button>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-3">
            <p className="text-[11px] font-semibold text-edelweys-text-tertiary tracking-widest uppercase m-0 mb-1">Riwayat Kesehatan ({logs.length} catatan)</p>
            {logs.length === 0 && (
              <div className="bg-white/70 backdrop-blur-[10px] rounded-[14px] p-5 border border-white/50 shadow-glass">
                <p className="text-edelweys-text-tertiary text-center py-5">Belum ada riwayat.</p>
              </div>
            )}
            {logs.map((log, i) => {
              const bmi = log.bmi ?? calcBMI(log.weight, log.height);
              const bi = bmiCategory(bmi);
              return (
                <div key={log.id ?? i} className="bg-white/70 backdrop-blur-[10px] rounded-[14px] p-4 border border-white/50 shadow-glass">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="font-semibold text-edelweys-text text-sm">{fmt(log.date)}</span>
                    {i === 0 && <span className="bg-edelweys-sage text-white rounded-pill px-2.5 py-0.5 text-[11px] font-semibold">Terbaru</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
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

const Chip = ({ label, color = "#6B9162", bg = "#F0FDF4" }) => (
  <span className="rounded-pill px-2.5 py-1 text-xs font-medium" style={{ background: bg, color }}>{label}</span>
);
