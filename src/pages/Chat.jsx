import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";
import logo from "../assets/edelweys.png";

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Heyy yoww! Gimana kabarnya? Ada yang bisa Edelweys bantuin hari ini?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", username: "" });
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        const { data: prof } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        setProfile(prof);
        setEditForm({ full_name: prof?.full_name || "", username: prof?.username || "" });
        const { data: chats } = await supabase.from("chat_history").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false }).limit(20);
        if (chats) setChatHistory(chats.map(c => ({ id: c.id, title: c.title || "Obrolan", messages: c.messages || [], time: new Date(c.created_at).toLocaleDateString("id-ID") })));
      }
    };
    checkAuth();
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const startNewChat = () => {
    if (messages.length > 1 && userId) {
      const firstUserMsg = messages.find(m => m.role === "user");
      const title = firstUserMsg ? firstUserMsg.content.slice(0, 30) : "Obrolan baru";
      supabase.from("chat_history").insert({ user_id: userId, title, messages }).then(({ data }) => {
        if (data) setChatHistory(prev => [{ id: data.id, title, messages: [...messages], time: "Baru saja" }, ...prev]);
      });
    }
    setMessages([{ role: "assistant", content: "Heyy yoww! Gimana kabarnya? Ada yang bisa Edelweys bantuin hari ini?" }]);
    setActiveChatId(null);
  };

  const loadChat = (chat) => { setMessages(chat.messages); setActiveChatId(chat.id); };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!userId) return;
    await supabase.from("chat_history").delete().eq("id", chatId);
    setChatHistory(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([{ role: "assistant", content: "Heyy yoww! Gimana kabarnya? Ada yang bisa Edelweys bantuin hari ini?" }]);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setIsTyping(true);
    try {
      const history = newMessages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, history, user_id: userId }),
      });
      const data = await res.json();
      setIsTyping(false);
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setIsTyping(false);
      setMessages([...newMessages, { role: "assistant", content: "Aduh, Edelweys lagi error nih. Coba lagi ya!" }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/login"); };
  const handleSaveProfile = async () => {
    const { error } = await supabase.from("profiles").update({ full_name: editForm.full_name, username: editForm.username }).eq("id", userId);
    if (!error) { setProfile({ ...profile, ...editForm }); setShowProfileEdit(false); }
  };

  const formatMessage = (text) => {
    const lines = text.split('\n');
    const hasTable = lines.some(l => l.trim().startsWith('|'));
    if (hasTable) {
      const tableLines = []; const otherLines = []; let inTable = false;
      lines.forEach((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('|')) { inTable = true; if (!trimmed.match(/^\|[\s-]+\|$/)) tableLines.push(trimmed); }
        else { if (inTable) inTable = false; otherLines.push({ line, index: i }); }
      });
      const rows = tableLines.map(row => row.split('|').filter(cell => cell.trim()).map(cell => cell.trim()));
      const result = [];
      otherLines.filter(o => o.index < lines.findIndex(l => l.trim().startsWith('|'))).forEach(o => {
        result.push(<span key={`pre-${o.index}`}>{formatInline(o.line)}<br /></span>);
      });
      if (rows.length > 0) {
        result.push(
          <table key="table" className="border-collapse w-full my-2 text-[13px]">
            <thead><tr>{rows[0].map((cell, ci) => <th key={ci} className="bg-edelweys-sage/10 border border-edelweys-border px-3 py-2 text-left font-semibold text-edelweys-text">{formatInline(cell)}</th>)}</tr></thead>
            <tbody>{rows.slice(1).map((row, ri) => <tr key={ri}>{row.map((cell, ci) => <td key={ci} className="border border-edelweys-border px-3 py-2 text-left text-edelweys-text">{formatInline(cell)}</td>)}</tr>)}</tbody>
          </table>
        );
      }
      otherLines.filter(o => o.index > lines.findLastIndex(l => l.trim().startsWith('|'))).forEach(o => {
        result.push(<span key={`post-${o.index}`}>{formatInline(o.line)}<br /></span>);
      });
      return result;
    }
    return lines.map((line, i) => <span key={i}>{formatInline(line)}{i < lines.length - 1 && <br />}</span>);
  };

  const formatInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
      return part;
    });
  };

  return (
    <div className="flex h-screen w-screen bg-edelweys-bg font-sans overflow-hidden fixed inset-0">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="w-[260px] h-full bg-edelweys-deep flex-shrink-0 z-20"
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
          >
            <div className="w-[260px] h-full flex flex-col">
              <div className="p-5 border-b border-white/10">
                <img src={logo} alt="Edelweys" className="h-9" />
              </div>
              <button onClick={startNewChat} className="mx-4 my-4 px-4 py-3 bg-edelweys-sage border-none rounded-xl text-white text-sm font-semibold cursor-pointer text-left">+ Obrolan Baru</button>
              {!userId && (
                <div className="mx-4 mb-3 p-3 bg-yellow-500/15 rounded-[10px] border border-yellow-500/30">
                  <p className="m-0 text-xs text-yellow-300 font-medium">Login untuk menyimpan riwayat chat</p>
                </div>
              )}
              {userId && chatHistory.length > 0 && (
                <div className="flex-1 overflow-y-auto px-3">
                  <p className="text-[11px] font-semibold text-[#7A9B76] tracking-widest uppercase py-1 px-2 mb-2 m-0">Riwayat</p>
                  {chatHistory.map((chat) => (
                    <div key={chat.id} onClick={() => loadChat(chat)}
                      className={`p-3 rounded-[10px] cursor-pointer mb-1 transition-colors ${activeChatId === chat.id ? "bg-edelweys-sage/20" : ""}`}>
                      <div className="flex justify-between items-center">
                        <p className="text-[13px] font-medium text-white m-0 truncate">{chat.title}</p>
                        <button onClick={(e) => deleteChat(chat.id, e)} className="bg-transparent border-none text-[#7A9B76] text-lg cursor-pointer px-1 opacity-60">×</button>
                      </div>
                      <p className="text-[11px] text-[#7A9B76] m-0">{chat.time}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="p-4 border-t border-white/10">
                <div onClick={() => userId && setShowProfileEdit(true)} className="flex items-center gap-2.5 p-2.5 rounded-[10px] cursor-pointer mb-2.5 hover:bg-white/5">
                  <div className="w-9 h-9 bg-edelweys-sage rounded-[10px] flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{profile?.full_name?.charAt(0) || "U"}</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[13px] font-semibold text-white m-0">{profile?.full_name || "Guest"}</p>
                    {userId && <p className="text-[11px] text-[#7A9B76] m-0 mt-0.5">Klik untuk edit</p>}
                  </div>
                </div>
                {userId ? (
                  <button onClick={handleLogout} className="w-full py-2.5 bg-red-500/15 border-none rounded-[10px] text-red-300 text-[13px] font-medium cursor-pointer">Logout</button>
                ) : (
                  <button onClick={() => navigate("/login")} className="w-full py-2.5 bg-edelweys-sage border-none rounded-[10px] text-white text-[13px] font-semibold cursor-pointer">Login</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-white/70 backdrop-blur-glass border-b border-white/50 shadow-glass">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-9 h-9 rounded-[10px] border border-white/50 bg-white/50 text-edelweys-text cursor-pointer flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            </button>
            <img src={logo} alt="Edelweys" className="w-10 h-10 rounded-xl" />
            <div className="flex flex-col gap-0.5">
              <p className="m-0 font-bold text-edelweys-text text-base leading-tight">Edelweys</p>
              <p className="m-0 text-xs text-edelweys-sage leading-tight">● Online</p>
            </div>
          </div>
          <button onClick={() => navigate("/dashboard")} className="px-4 py-2.5 rounded-[10px] border border-white/50 bg-white/50 text-edelweys-text cursor-pointer text-[13px] font-semibold backdrop-blur-[10px]">Dashboard</button>
        </div>

        {/* Guest Banner */}
        {!userId && (
          <div className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500/15 border-b border-yellow-500/30">
            <span>⚠️</span>
            <p className="m-0 text-[13px] text-edelweys-text-secondary">
              Kamu belum login. Riwayat chat tidak akan tersimpan.{" "}
              <span className="text-edelweys-sage font-semibold cursor-pointer underline" onClick={() => navigate("/login")}>Login sekarang</span>
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex items-end gap-2.5 max-w-[75%] ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && <img src={logo} alt="Edelweys" className="w-8 h-8 rounded-[10px] flex-shrink-0" />}
              <div className={`px-4 py-3.5 text-[14px] leading-relaxed break-words ${
                msg.role === "user"
                  ? "bg-edelweys-sage text-white rounded-[16px_16px_4px_16px] text-left"
                  : "bg-white/70 backdrop-blur-[10px] text-edelweys-text rounded-[16px_16px_16px_4px] border border-white/50 shadow-glass text-left"
              }`}>{formatMessage(msg.content)}</div>
              {msg.role === "user" && <div className="w-8 h-8 bg-edelweys-deep rounded-[10px] flex items-center justify-center flex-shrink-0 text-[12px] font-bold text-white">U</div>}
            </div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div className="flex items-end gap-2.5 justify-start"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <img src={logo} alt="Edelweys" className="w-8 h-8 rounded-[10px] flex-shrink-0" />
                <div className="bg-white/70 backdrop-blur-[10px] px-4 py-3.5 rounded-[16px_16px_16px_4px] border border-white/50 shadow-glass">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-edelweys-sage animate-bounce" style={{ animationDelay: "0s" }} />
                    <div className="w-2 h-2 rounded-full bg-edelweys-sage animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <div className="w-2 h-2 rounded-full bg-edelweys-sage animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 pb-5 bg-white/70 backdrop-blur-glass border-t border-white/50">
          <div className="flex gap-3 items-end">
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Ketik pesanmu di sini..."
              className="flex-1 px-4 py-3.5 rounded-2xl border-2 border-edelweys-border bg-white/60 text-[14px] text-edelweys-text resize-none outline-none font-sans min-h-[48px] max-h-[120px]" />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              className={`w-12 h-12 rounded-2xl border-none bg-edelweys-sage text-white cursor-pointer flex items-center justify-center flex-shrink-0 shadow-green-sm transition-all ${input.trim() ? "opacity-100" : "opacity-40"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showProfileEdit && (
          <motion.div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[1000]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfileEdit(false)}>
            <motion.div className="bg-white/70 backdrop-blur-glass rounded-[20px] p-8 w-full max-w-[380px] shadow-glass-lg border border-white/50"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-edelweys-text m-0 mb-6">Edit Profile</h3>
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-edelweys-text mb-2">Nama Lengkap</label>
                <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-[10px] border border-edelweys-border-light bg-white/60 text-sm text-edelweys-text outline-none font-sans box-border" />
              </div>
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-edelweys-text mb-2">Username</label>
                <input type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-[10px] border border-edelweys-border-light bg-white/60 text-sm text-edelweys-text outline-none font-sans box-border" />
              </div>
              <div className="flex gap-3 justify-end mt-6">
                <button onClick={() => setShowProfileEdit(false)} className="px-5 py-2.5 rounded-[10px] border border-edelweys-border bg-white/50 text-edelweys-text-secondary text-sm font-medium cursor-pointer">Batal</button>
                <button onClick={handleSaveProfile} className="px-5 py-2.5 rounded-[10px] border-none bg-edelweys-sage text-white text-sm font-semibold cursor-pointer">Simpan</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
