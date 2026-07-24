import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";
import logo from "../assets/logo.png";

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
    const loadProfileAndHistory = async (userId) => {
      let { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();

      // Get user data from auth
      const { data: { user } } = await supabase.auth.getUser();
      const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || "";
      const username = user?.user_metadata?.name || user?.email?.split("@")[0] || "user";

      if (!prof) {
        // Create profile
        const { data: newProf } = await supabase.from("profiles").insert({
          id: userId,
          username: username,
          full_name: fullName,
        }).select().single();
        prof = newProf;
      } else if (!prof.full_name && fullName) {
        // Update profile if full_name is empty (e.g. Google user with metadata)
        const { data: updated } = await supabase.from("profiles").update({ full_name: fullName, username }).eq("id", userId).select().single();
        if (updated) prof = updated;
      }

      setUserId(userId);
      setProfile(prof);
      setEditForm({ full_name: prof?.full_name || "", username: prof?.username || "" });

      // Load chat history
      const { data: chats, error } = await supabase
        .from("chat_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Gagal load chat history:", error);
      } else if (chats && chats.length > 0) {
        const conversations = [];
        let currentChat = { messages: [], startTime: null, title: "" };
        chats.forEach((chat, i) => {
          const msgTime = new Date(chat.created_at);
          if (!currentChat.startTime || (currentChat.startTime - msgTime) > 30 * 60 * 1000) {
            if (currentChat.messages.length > 0) {
              conversations.push({ ...currentChat });
            }
            currentChat = { messages: [], startTime: msgTime, title: chat.message?.slice(0, 30) || "Obrolan" };
          }
          currentChat.messages.unshift({ role: chat.role, content: chat.message });
        });
        if (currentChat.messages.length > 0) {
          conversations.push({ ...currentChat });
        }
        setChatHistory(conversations.slice(0, 20).map((c, i) => ({
          id: i,
          title: c.title,
          messages: c.messages,
          time: c.startTime?.toLocaleDateString("id-ID") || "Baru saja",
        })));
      }
    };

    // Listen for auth state changes (handles Google OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await loadProfileAndHistory(session.user.id);
        }
      }
    );

    // Also check current session on mount
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadProfileAndHistory(session.user.id);
      }
    })();

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const startNewChat = () => {
    if (messages.length > 1 && userId) {
      // Save each message individually to chat_history
      const messagesToSave = messages.map(m => ({
        user_id: userId,
        role: m.role,
        message: m.content,
      }));
      console.log("Menyimpan chat:", { user_id: userId, messagesCount: messagesToSave.length });
      supabase.from("chat_history").insert(messagesToSave).then(({ data, error }) => {
        if (error) {
          console.error("Gagal simpan chat:", error);
        } else {
          console.log("Chat tersimpan");
          // Add to local history
          const firstUserMsg = messages.find(m => m.role === "user");
          const title = firstUserMsg ? firstUserMsg.content.slice(0, 30) : "Obrolan baru";
          setChatHistory(prev => [{
            id: Date.now(),
            title: title,
            messages: [...messages],
            time: "Baru saja",
          }, ...prev]);
        }
      });
    }
    setMessages([{ role: "assistant", content: "Heyy yoww! Gimana kabarnya? Ada yang bisa Edelweys bantuin hari ini?" }]);
    setActiveChatId(null);
  };

  const loadChat = (chat) => { setMessages(chat.messages); setActiveChatId(chat.id); };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!userId) return;
    // Delete all messages for this user (simplified - in production you'd track conversation IDs)
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
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${apiUrl}/api/chat/`, {
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
          <table key="table" className="border-collapse w-full my-3 text-[13px]">
            <thead><tr>{rows[0].map((cell, ci) => <th key={ci} className="bg-edelweys-sage/10 border border-edelweys-border px-3 py-2 text-left font-bold text-edelweys-text">{formatInline(cell)}</th>)}</tr></thead>
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
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>;
      return part;
    });
  };

  return (
    <div className="flex h-screen w-screen font-sans overflow-hidden fixed inset-0" style={{ background: "linear-gradient(135deg, #EEEEE9 0%, #E8EDE5 100%)" }}>
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="w-[280px] h-full flex-shrink-0 z-20"
            style={{ background: "linear-gradient(180deg, #1E3319 0%, #2D4A29 100%)" }}
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="w-[280px] h-full flex flex-col">
              <div className="p-5 border-b border-white/10">
                <img src={logo} alt="Edelweys" className="h-12" />
              </div>
              <button onClick={startNewChat} className="mx-4 my-4 px-4 py-3 bg-gradient-to-r from-edelweys-sage to-edelweys-light border-none rounded-xl text-white text-sm font-bold cursor-pointer text-left shadow-green-sm hover:shadow-green transition-all flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Obrolan Baru
              </button>
              {!userId && (
                <div className="mx-4 mb-3 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <p className="m-0 text-xs text-yellow-300 font-medium">Login untuk menyimpan riwayat chat</p>
                </div>
              )}
              {userId && chatHistory.length > 0 && (
                <div className="flex-1 overflow-y-auto px-3">
                  <p className="text-[10px] font-bold text-white/40 tracking-widest uppercase py-2 px-2 m-0">Riwayat</p>
                  {chatHistory.map((chat) => (
                    <div key={chat.id} onClick={() => loadChat(chat)}
                      className={`p-3 rounded-xl cursor-pointer mb-1 transition-all duration-200 hover:bg-white/5 ${activeChatId === chat.id ? "bg-white/10" : ""}`}>
                      <div className="flex justify-between items-center">
                        <p className="text-[13px] font-medium text-white/90 m-0 truncate flex-1">{chat.title}</p>
                        <button onClick={(e) => deleteChat(chat.id, e)} className="bg-transparent border-none text-white/30 text-lg cursor-pointer px-1 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all">×</button>
                      </div>
                      <p className="text-[11px] text-white/40 m-0 mt-1">{chat.time}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="p-4 border-t border-white/10">
                <div onClick={() => userId && setShowProfileEdit(true)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer mb-3 hover:bg-white/5 transition-all">
                  <div className="w-10 h-10 bg-gradient-to-br from-edelweys-sage to-edelweys-light rounded-xl flex items-center justify-center shadow-green-sm">
                    <span className="text-sm font-bold text-white">{profile?.full_name?.charAt(0) || "U"}</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[13px] font-semibold text-white m-0">{profile?.full_name || "Guest"}</p>
                    {userId && <p className="text-[11px] text-white/40 m-0 mt-0.5">Klik untuk edit</p>}
                  </div>
                </div>
                {userId ? (
                  <button onClick={handleLogout} className="w-full py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-[13px] font-medium cursor-pointer hover:bg-red-500/20 transition-all">Logout</button>
                ) : (
                  <button onClick={() => navigate("/login")} className="w-full py-2.5 bg-gradient-to-r from-edelweys-sage to-edelweys-light border-none rounded-xl text-white text-[13px] font-bold cursor-pointer shadow-green-sm hover:shadow-green transition-all">Login</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/30"
          style={{ background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-10 h-10 rounded-xl border border-white/40 bg-white/40 text-edelweys-text cursor-pointer flex items-center justify-center hover:bg-white/60 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            </button>
            <img src={logo} alt="Edelweys" className="w-14 h-14 rounded-xl shadow-green-sm" />
            <div>
              <p className="m-0 font-bold text-edelweys-text text-base">Edelweys</p>
              <p className="m-0 text-xs text-edelweys-sage font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-edelweys-sage animate-pulse" /> Online
              </p>
            </div>
          </div>
          <button onClick={() => navigate("/dashboard")} className="px-4 py-2.5 rounded-xl border border-white/40 bg-white/40 text-edelweys-text cursor-pointer text-[13px] font-semibold hover:bg-white/60 transition-all" style={{ backdropFilter: "blur(10px)" }}>Dashboard</button>
        </div>

        {/* Guest Banner */}
        {!userId && (
          <div className="flex items-center gap-2 px-5 py-3 bg-yellow-500/10 border-b border-yellow-500/20">
            <svg className="w-4 h-4 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <p className="m-0 text-[13px] text-edelweys-text-secondary">
              Kamu belum login. Riwayat chat tidak akan tersimpan.{" "}
              <span className="text-edelweys-sage font-bold cursor-pointer hover:underline" onClick={() => navigate("/login")}>Login sekarang</span>
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`flex items-end gap-3 max-w-[75%] ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {msg.role === "assistant" && <img src={logo} alt="Edelweys" className="w-12 h-12 rounded-xl flex-shrink-0 shadow-green-sm" />}
                <div className={`px-5 py-3.5 text-[14px] leading-relaxed break-words ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-edelweys-sage to-edelweys-light text-white rounded-2xl rounded-br-md"
                    : "border border-white/40 shadow-glass text-edelweys-text rounded-2xl rounded-bl-md"
                }`} style={msg.role === "bot" ? { background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)" } : msg.role === "assistant" ? { background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)" } : {}}>
                  {formatMessage(msg.content)}
                </div>
                {msg.role === "user" && <div className="w-9 h-9 bg-edelweys-deep rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-lg">U</div>}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div className="flex items-end gap-3 justify-start"
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <img src={logo} alt="Edelweys" className="w-12 h-12 rounded-xl shadow-green-sm" />
                <div className="px-5 py-4 rounded-2xl rounded-bl-md border border-white/40 shadow-glass" style={{ background: "rgba(255,255,255,0.6)", backdropFilter: "blur(20px)" }}>
                  <div className="flex gap-1.5">
                    <motion.div className="w-2.5 h-2.5 rounded-full bg-edelweys-sage" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                    <motion.div className="w-2.5 h-2.5 rounded-full bg-edelweys-sage" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                    <motion.div className="w-2.5 h-2.5 rounded-full bg-edelweys-sage" animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-white/30" style={{ background: "rgba(255, 255, 255, 0.6)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}>
          <div className="flex gap-3 items-end">
            <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Ketik pesanmu di sini..."
              className="flex-1 px-5 py-4 rounded-2xl border-2 border-edelweys-border bg-white/40 text-[14px] text-edelweys-text resize-none outline-none font-sans transition-all duration-200 focus:border-edelweys-sage focus:bg-white/60 focus:shadow-green-sm" style={{ backdropFilter: "blur(10px)", minHeight: "52px", maxHeight: "120px" }} />
            <motion.button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className={`w-12 h-12 rounded-2xl border-none bg-gradient-to-r from-edelweys-sage to-edelweys-light text-white cursor-pointer flex items-center justify-center flex-shrink-0 transition-all duration-200 ${input.trim() ? "shadow-green-sm hover:shadow-green opacity-100" : "opacity-40"}`}
              whileHover={input.trim() ? { scale: 1.1 } : {}}
              whileTap={input.trim() ? { scale: 0.9 } : {}}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showProfileEdit && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[1000]"
            style={{ backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfileEdit(false)}>
            <motion.div className="w-full max-w-[400px] mx-4 rounded-3xl p-8 border border-white/40 shadow-glass-xl"
              style={{ background: "rgba(255, 255, 255, 0.7)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold text-edelweys-text m-0 mb-6">Edit Profile</h3>
              <div className="mb-4">
                <label className="text-xs font-bold text-edelweys-text-tertiary tracking-wide uppercase mb-2 block">Nama Lengkap</label>
                <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-edelweys-border bg-white/40 text-sm text-edelweys-text outline-none font-sans transition-all focus:border-edelweys-sage focus:bg-white/60" style={{ backdropFilter: "blur(10px)" }} />
              </div>
              <div className="mb-6">
                <label className="text-xs font-bold text-edelweys-text-tertiary tracking-wide uppercase mb-2 block">Username</label>
                <input type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-edelweys-border bg-white/40 text-sm text-edelweys-text outline-none font-sans transition-all focus:border-edelweys-sage focus:bg-white/60" style={{ backdropFilter: "blur(10px)" }} />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowProfileEdit(false)} className="px-5 py-2.5 rounded-xl border border-edelweys-border bg-white/40 text-edelweys-text-secondary text-sm font-semibold cursor-pointer hover:bg-white/60 transition-all" style={{ backdropFilter: "blur(10px)" }}>Batal</button>
                <button onClick={handleSaveProfile} className="px-5 py-2.5 rounded-xl border-none bg-gradient-to-r from-edelweys-sage to-edelweys-light text-white text-sm font-bold cursor-pointer shadow-green-sm hover:shadow-green transition-all">Simpan</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
