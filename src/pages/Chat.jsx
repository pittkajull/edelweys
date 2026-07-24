import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";
import logo from "../assets/edelweys-new-logo.png";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: "", username: "" });
  const [savedMsgCount, setSavedMsgCount] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfileAndHistory = async (userId) => {
      let { data: prof } = await supabase.from("profiles").select("*").eq("id", userId).single();

      const { data: { user } } = await supabase.auth.getUser();
      const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || "";
      const username = user?.user_metadata?.name || user?.email?.split("@")[0] || "user";

      if (!prof) {
        const { data: newProf } = await supabase.from("profiles").insert({
          id: userId,
          username: username,
          full_name: fullName,
        }).select().single();
        prof = newProf;
      } else if (!prof.full_name && fullName) {
        const { data: updated } = await supabase.from("profiles").update({ full_name: fullName, username }).eq("id", userId).select().single();
        if (updated) prof = updated;
      }

      setUserId(userId);
      setProfile(prof);
      setEditForm({ full_name: prof?.full_name || "", username: prof?.username || "" });

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
        chats.forEach((chat) => {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await loadProfileAndHistory(session.user.id);
        }
      }
    );

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await loadProfileAndHistory(session.user.id);
      }
    })();

    return () => subscription?.unsubscribe();
  }, []);

  // Save current messages to chat_history
  const saveCurrentConversation = async (msgs) => {
    if (!userId || !msgs || msgs.length <= 1) return;
    const unsaved = msgs.slice(savedMsgCount);
    if (unsaved.length === 0) return;

    // Add small offset to each message so they get different created_at timestamps
    const now = Date.now();
    const messagesToSave = unsaved.map((m, i) => ({
      user_id: userId,
      role: m.role,
      message: m.content,
      created_at: new Date(now - (unsaved.length - 1 - i) * 1000).toISOString(),
    }));

    const { error } = await supabase.from("chat_history").insert(messagesToSave);
    if (!error) {
      setSavedMsgCount(msgs.length);
    }
    return !error;
  };

  // Save on browser close or tab switch
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length > 1 && userId) {
        // Save to localStorage as backup
        try {
          localStorage.setItem("edelweys_pending_chat", JSON.stringify({
            userId,
            messages,
            timestamp: Date.now(),
          }));
        } catch (e) {}
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && messages.length > 1 && userId && messages.length > savedMsgCount) {
        saveCurrentConversation(messages);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [messages, userId, savedMsgCount]);

  // Restore pending chat from localStorage on load
  useEffect(() => {
    if (!userId) return;
    try {
      const pending = JSON.parse(localStorage.getItem("edelweys_pending_chat") || "null");
      if (pending && pending.userId === userId && pending.messages?.length > 1) {
        const age = Date.now() - pending.timestamp;
        if (age < 24 * 60 * 60 * 1000) { // Less than 24h old
          // Save pending messages to Supabase
          const now = Date.now();
          const toSave = pending.messages.filter(m => m.role !== "assistant" || m.content !== pending.messages[0]?.content).map((m, i) => ({
            user_id: userId,
            role: m.role,
            message: m.content,
            created_at: new Date(now - (pending.messages.length - 1 - i) * 1000).toISOString(),
          }));
          supabase.from("chat_history").insert(toSave).then(({ error }) => {
            if (!error) {
              setChatHistory(prev => [{
                id: Date.now(),
                title: pending.messages.find(m => m.role === "user")?.content?.slice(0, 30) || "Obrolan",
                messages: pending.messages,
                time: "Baru saja",
              }, ...prev]);
            }
          });
        }
        localStorage.removeItem("edelweys_pending_chat");
      }
    } catch (e) {
      localStorage.removeItem("edelweys_pending_chat");
    }
  }, [userId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const startNewChat = async () => {
    if (messages.length > 1 && userId && messages.length > savedMsgCount) {
      // Only save messages that haven't been saved yet
      const unsaved = messages.slice(savedMsgCount);
      const now = Date.now();
      const messagesToSave = unsaved.map((m, i) => ({
        user_id: userId,
        role: m.role,
        message: m.content,
        created_at: new Date(now - (unsaved.length - 1 - i) * 1000).toISOString(),
      }));
      const { error } = await supabase.from("chat_history").insert(messagesToSave);
      if (!error) {
        const firstUserMsg = messages.find(m => m.role === "user");
        const title = firstUserMsg ? firstUserMsg.content.slice(0, 30) : "Obrolan baru";
        setChatHistory(prev => [{
          id: Date.now(),
          title: title,
          messages: [...messages],
          time: "Baru saja",
        }, ...prev]);
      } else {
        console.error("Gagal save chat:", error);
      }
    }
    setMessages([{ role: "assistant", content: "Heyy yoww! Gimana kabarnya? Ada yang bisa Edelweys bantuin hari ini?" }]);
    setActiveChatId(null);
    setSavedMsgCount(0);
  };

  const loadChat = (chat) => { setMessages(chat.messages); setActiveChatId(chat.id); setSavedMsgCount(chat.messages.length); setSidebarOpen(false); };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
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
      const finalMessages = [...newMessages, { role: "assistant", content: data.reply }];
      setMessages(finalMessages);

      // Save both user + assistant messages to chat_history immediately
      if (userId) {
        const now = Date.now();
        const toSave = [
          { user_id: userId, role: "user", message: input, created_at: new Date(now - 1000).toISOString() },
          { user_id: userId, role: "assistant", message: data.reply, created_at: new Date(now).toISOString() },
        ];
        const { error } = await supabase.from("chat_history").insert(toSave);
        if (!error) setSavedMsgCount(finalMessages.length);
      }
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

  const isHome = messages.length <= 1;

  return (
    <div className="flex h-screen w-screen font-sans overflow-hidden fixed inset-0" style={{ background: "#D9E2D4" }}>
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.3)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="w-[260px] h-full flex-shrink-0 z-50 flex flex-col fixed left-0 top-0"
            style={{ background: "#1E3319" }}
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10">
              <img src={logo} alt="Edelweys" className="h-7" />
              <button onClick={() => setSidebarOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer border-none bg-transparent">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
            </div>
            <button onClick={startNewChat} className="mx-3 mt-3 px-3 py-2.5 rounded-lg text-white text-sm font-medium cursor-pointer text-left flex items-center gap-2 transition-colors border-none" style={{ background: "rgba(255,255,255,0.08)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14m-7-7h14" /></svg>
              Obrolan Baru
            </button>
            <button onClick={() => { navigate("/dashboard"); setSidebarOpen(false); }} className="mx-3 mt-2 px-3 py-2.5 rounded-lg text-white/70 text-sm font-medium cursor-pointer text-left flex items-center gap-2 transition-colors border-none hover:text-white hover:bg-white/5" style={{ background: "transparent" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
              Dashboard
            </button>
            {!userId && (
              <div className="mx-3 mt-3 p-2.5 rounded-lg border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
                <p className="m-0 text-xs text-white/50">Login untuk menyimpan riwayat</p>
              </div>
            )}
            {userId && chatHistory.length > 0 && (
              <div className="flex-1 overflow-y-auto px-3 mt-3">
                <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider px-2 m-0 mb-2">Riwayat</p>
                {chatHistory.map((chat) => (
                  <div key={chat.id} onClick={() => loadChat(chat)}
                    className={`px-3 py-2 rounded-lg cursor-pointer mb-0.5 transition-colors text-white/70 hover:text-white hover:bg-white/5 ${activeChatId === chat.id ? "bg-white/10 text-white" : ""}`}>
                    <p className="text-[13px] m-0 truncate">{chat.title}</p>
                    <p className="text-[11px] text-white/30 m-0 mt-0.5">{chat.time}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="p-3 border-t border-white/10 mt-auto">
              <div onClick={() => userId && setShowProfileEdit(true)} className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#6B9162" }}>
                  <span className="text-xs font-medium text-white">{profile?.full_name?.charAt(0) || "U"}</span>
                </div>
                <p className="text-[13px] text-white/80 m-0 truncate flex-1">{profile?.full_name || "Guest"}</p>
              </div>
              {userId ? (
                <button onClick={handleLogout} className="w-full mt-2 py-2 rounded-lg text-xs text-white/50 hover:text-white/70 hover:bg-white/5 cursor-pointer transition-colors border-none bg-transparent">Logout</button>
              ) : (
                <button onClick={() => navigate("/login")} className="w-full mt-2 py-2 rounded-lg text-white text-xs font-medium cursor-pointer transition-colors border-none" style={{ background: "rgba(255,255,255,0.08)" }}>Login</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b" style={{ borderColor: "rgba(30,51,25,0.12)", background: "rgba(217,226,212,0.9)", backdropFilter: "blur(12px)" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer transition-colors border-none bg-transparent hover:bg-black/5" style={{ color: "#1E3319" }}>
            {sidebarOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 18l-6-6 6-6" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
            )}
          </button>
          {!isHome && (
            <div className="flex-1 text-center">
              <p className="m-0 text-sm font-medium" style={{ color: "#1E3319" }}>Edelweys</p>
            </div>
          )}
          {isHome && <div className="flex-1" />}
          <button onClick={() => navigate("/dashboard")} className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors border" style={{ borderColor: "rgba(30,51,25,0.15)", color: "#1E3319", background: "transparent" }}>Dashboard</button>
        </div>

        {/* Guest Banner */}
        {!userId && (
          <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ background: "rgba(107,145,98,0.1)", borderColor: "rgba(107,145,98,0.15)" }}>
            <p className="m-0 text-xs" style={{ color: "#3D5A35" }}>
              Kamu belum login. Riwayat chat tidak akan tersimpan.{" "}
              <span className="font-semibold cursor-pointer hover:underline" style={{ color: "#4A7A40" }} onClick={() => navigate("/login")}>Login sekarang</span>
            </p>
          </div>
        )}

        {/* Messages or Home */}
        {isHome ? (
          /* Home screen - centered like Claude */
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <motion.div
              className="flex items-center gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <img src={logo} alt="Edelweys" className="w-[52px] h-[52px]" />
              <h1 className="text-[28px] md:text-[32px] font-bold m-0" style={{ color: "#1E3319" }}>Heyy yoww!</h1>
            </motion.div>
            <motion.div
              className="w-full max-w-[600px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <div className="rounded-2xl border p-4" style={{ background: "rgba(255,255,255,0.45)", borderColor: "rgba(30,51,25,0.1)" }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pesanmu di sini..."
                  className="w-full min-h-[80px] border-none outline-none resize-none text-[15px] bg-transparent"
                  style={{ color: "#1E3319" }}
                />
                <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: "rgba(30,51,25,0.06)" }}>
                  <div />
                  <motion.button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer border-none"
                    style={{ background: input.trim() ? "#4A7A40" : "rgba(30,51,25,0.08)", color: input.trim() ? "white" : "#5A6B57", transition: "all 0.2s" }}
                    whileHover={input.trim() ? { scale: 1.05 } : {}}
                    whileTap={input.trim() ? { scale: 0.95 } : {}}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          /* Chat messages */
          <>
            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-[700px] mx-auto flex flex-col gap-4">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {msg.role === "assistant" && (
                        <img src={logo} alt="E" className="w-8 h-8 rounded-lg flex-shrink-0 mt-1" />
                      )}
                      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${
                        msg.role === "user"
                          ? "text-white rounded-br-md"
                          : "rounded-bl-md"
                      }`} style={msg.role === "user" 
                        ? { background: "linear-gradient(135deg, #2D4A29, #6B9162)" }
                        : { background: "rgba(255,255,255,0.5)", border: "1px solid rgba(30,51,25,0.08)", color: "#1E3319" }
                      }>
                        {formatMessage(msg.content)}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div className="flex gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <img src={logo} alt="E" className="w-8 h-8 rounded-lg" />
                    <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(30,51,25,0.08)" }}>
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#6B9162", animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#6B9162", animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: "#6B9162", animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            {/* Input */}
            <div className="px-4 pb-4">
              <div className="max-w-[700px] mx-auto">
                <div className="rounded-2xl border p-3" style={{ background: "rgba(255,255,255,0.5)", borderColor: "rgba(30,51,25,0.12)" }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ketik pesanmu di sini..."
                    className="w-full px-2 py-1 border-none outline-none resize-none text-[14px] bg-transparent min-h-[40px] max-h-[120px]"
                    style={{ color: "#1E3319" }}
                    rows={1}
                  />
                  <div className="flex items-center justify-end mt-2 pt-2 border-t" style={{ borderColor: "rgba(30,51,25,0.08)" }}>
                    <motion.button
                      onClick={sendMessage}
                      disabled={loading || !input.trim()}
                      className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer transition-all border-none"
                      style={{ background: input.trim() ? "#6B9162" : "rgba(30,51,25,0.1)", color: input.trim() ? "white" : "#5A6B57" }}
                      whileHover={input.trim() ? { scale: 1.05 } : {}}
                      whileTap={input.trim() ? { scale: 0.95 } : {}}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showProfileEdit && (
          <motion.div className="fixed inset-0 flex items-center justify-center z-[1000]"
            style={{ background: "rgba(30,51,25,0.3)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfileEdit(false)}>
            <motion.div className="w-full max-w-[400px] mx-4 rounded-2xl p-6 border"
              style={{ background: "#E8EDE5", borderColor: "rgba(30,51,25,0.12)" }}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold m-0 mb-5" style={{ color: "#1E3319" }}>Edit Profile</h3>
              <div className="mb-4">
                <label className="text-xs font-semibold mb-2 block" style={{ color: "#5A6B57" }}>Nama Lengkap</label>
                <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-[#6B9162]"
                  style={{ borderColor: "rgba(30,51,25,0.15)", background: "rgba(255,255,255,0.5)", color: "#1E3319" }} />
              </div>
              <div className="mb-5">
                <label className="text-xs font-semibold mb-2 block" style={{ color: "#5A6B57" }}>Username</label>
                <input type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors focus:border-[#6B9162]"
                  style={{ borderColor: "rgba(30,51,25,0.15)", background: "rgba(255,255,255,0.5)", color: "#1E3319" }} />
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowProfileEdit(false)} className="px-4 py-2 rounded-xl text-sm font-medium cursor-pointer border transition-colors"
                  style={{ borderColor: "rgba(30,51,25,0.15)", color: "#5A6B57", background: "transparent" }}>Batal</button>
                <button onClick={handleSaveProfile} className="px-4 py-2 rounded-xl text-white text-sm font-medium cursor-pointer border-none"
                  style={{ background: "#6B9162" }}>Simpan</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
