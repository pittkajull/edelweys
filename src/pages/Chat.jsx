import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";
import logo from "../assets/edelweys.png";

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
  chatUserBg: "#6B9162",
  chatBotBg: "#FFFFFF",
};

export default function Chat() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Heyy yoww! Gimana kabarnya? Ada yang bisa Edelweys bantuin hari ini?",
    },
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
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setProfile(prof);
        setEditForm({ full_name: prof?.full_name || "", username: prof?.username || "" });

        // Load chat history from database
        const { data: chats } = await supabase
          .from("chat_history")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (chats) {
          setChatHistory(chats.map(c => ({
            id: c.id,
            title: c.title || "Obrolan",
            messages: c.messages || [],
            time: new Date(c.created_at).toLocaleDateString("id-ID"),
          })));
        }
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewChat = () => {
    if (messages.length > 1 && userId) {
      // Save current chat to database
      const firstUserMsg = messages.find(m => m.role === "user");
      const title = firstUserMsg ? firstUserMsg.content.slice(0, 30) : "Obrolan baru";
      supabase.from("chat_history").insert({
        user_id: userId,
        title: title,
        messages: messages,
      }).then(({ data }) => {
        if (data) {
          setChatHistory(prev => [{
            id: data.id,
            title: title,
            messages: [...messages],
            time: "Baru saja",
          }, ...prev]);
        }
      });
    }
    setMessages([
      {
        role: "assistant",
        content: "Heyy yoww! Gimana kabarnya? Ada yang bisa Edelweys bantuin hari ini?",
      },
    ]);
    setActiveChatId(null);
  };

  const loadChat = (chat) => {
    setMessages(chat.messages);
    setActiveChatId(chat.id);
  };

  const deleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!userId) return;
    await supabase.from("chat_history").delete().eq("id", chatId);
    setChatHistory(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessages([{
        role: "assistant",
        content: "Heyy yoww! Gimana kabarnya? Ada yang bisa Edelweys bantuin hari ini?",
      }]);
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
      const history = newMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("http://localhost:8000/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history,
          user_id: userId,
        }),
      });

      const data = await res.json();
      setIsTyping(false);
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setIsTyping(false);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Aduh, Edelweys lagi error nih. Coba lagi ya!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleSaveProfile = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: editForm.full_name, username: editForm.username })
      .eq("id", userId);

    if (!error) {
      setProfile({ ...profile, ...editForm });
      setShowProfileEdit(false);
    }
  };

  const formatMessage = (text) => {
    // Check if text contains table (lines starting with |)
    const lines = text.split('\n');
    const hasTable = lines.some(l => l.trim().startsWith('|'));

    if (hasTable) {
      // Parse table
      const tableLines = [];
      const otherLines = [];
      let inTable = false;

      lines.forEach((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('|')) {
          inTable = true;
          // Skip separator lines (|---|---|)
          if (!trimmed.match(/^\|[\s-]+\|$/)) {
            tableLines.push(trimmed);
          }
        } else {
          if (inTable) inTable = false;
          otherLines.push({ line, index: i });
        }
      });

      // Parse table rows
      const rows = tableLines.map(row =>
        row.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
      );

      const result = [];

      // Add lines before table
      otherLines.filter(o => o.index < lines.findIndex(l => l.trim().startsWith('|'))).forEach(o => {
        result.push(<span key={`pre-${o.index}`}>{formatInline(o.line)}<br /></span>);
      });

      // Add table
      if (rows.length > 0) {
        result.push(
          <table key="table" style={styles.chatTable}>
            <thead>
              <tr>
                {rows[0].map((cell, ci) => (
                  <th key={ci} style={styles.chatTh}>{formatInline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={styles.chatTd}>{formatInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }

      // Add lines after table
      otherLines.filter(o => o.index > lines.findLastIndex(l => l.trim().startsWith('|'))).forEach(o => {
        result.push(<span key={`post-${o.index}`}>{formatInline(o.line)}<br /></span>);
      });

      return result;
    }

    // No table - just format inline
    return lines.map((line, i) => (
      <span key={i}>
        {formatInline(line)}
        {i < lines.length - 1 && <br />}
      </span>
    ));
  };

  const formatInline = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            style={styles.sidebar}
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "tween", duration: 0.25, ease: "easeInOut" }}
          >
            <div style={styles.sidebarContent}>
              {/* Logo */}
              <div style={styles.sidebarHeader}>
                <img src={logo} alt="Edelweys" style={{ height: "36px" }} />
              </div>

              {/* New Chat Button */}
              <button onClick={startNewChat} style={styles.newChatBtn}>
                + Obrolan Baru
              </button>

              {/* Guest Warning */}
              {!userId && (
                <div style={styles.guestWarning}>
                  <p style={styles.guestWarningText}>
                    Login untuk menyimpan riwayat chat
                  </p>
                </div>
              )}

              {/* Chat History - only for logged in users */}
              {userId && chatHistory.length > 0 && (
                <div style={styles.historySection}>
                  <p style={styles.historyLabel}>Riwayat</p>
                  {chatHistory.map((chat) => (
                    <div
                      key={chat.id}
                      style={{
                        ...styles.historyItem,
                        background: activeChatId === chat.id ? "rgba(107, 145, 98, 0.2)" : "transparent",
                      }}
                      onClick={() => loadChat(chat)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p style={styles.historyTitle}>{chat.title}</p>
                        <button
                          onClick={(e) => deleteChat(chat.id, e)}
                          style={styles.deleteBtn}
                        >
                          ×
                        </button>
                      </div>
                      <p style={styles.historyTime}>{chat.time}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Bottom Section */}
              <div style={styles.sidebarBottom}>
                <div
                  style={styles.profileSection}
                  onClick={() => userId && setShowProfileEdit(true)}
                >
                  <div style={styles.profileAvatar}>
                    <span style={styles.profileAvatarText}>
                      {profile?.full_name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div style={styles.profileInfo}>
                    <p style={styles.profileName}>{profile?.full_name || "Guest"}</p>
                    {userId && <p style={styles.profileHint}>Klik untuk edit</p>}
                  </div>
                </div>
                {userId ? (
                  <button onClick={handleLogout} style={styles.logoutBtn}>
                    Logout
                  </button>
                ) : (
                  <button onClick={() => navigate("/login")} style={styles.loginBtn}>
                    Login
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div style={styles.mainChat}>
        {/* Header */}
        <div style={styles.chatHeader}>
          <div style={styles.chatHeaderLeft}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.menuBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <img src={logo} alt="Edelweys" style={{ width: "40px", height: "40px", borderRadius: "12px" }} />
            <div style={styles.chatHeaderInfo}>
              <p style={styles.chatName}>Edelweys</p>
              <p style={styles.statusText}>● Online</p>
            </div>
          </div>
          <button onClick={() => navigate("/dashboard")} style={styles.dashBtn}>
            Dashboard
          </button>
        </div>

        {/* Guest Banner */}
        {!userId && (
          <div style={styles.guestBanner}>
            <span>⚠️</span>
            <p style={styles.guestBannerText}>
              Kamu belum login. Riwayat chat tidak akan tersimpan.{" "}
              <span style={styles.guestBannerLink} onClick={() => navigate("/login")}>Login sekarang</span>
            </p>
          </div>
        )}

        {/* Messages */}
        <div style={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...styles.messageRow,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.role === "assistant" && (
                <img src={logo} alt="Edelweys" style={{ width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0 }} />
              )}
              <div
                style={{
                  ...styles.bubble,
                  ...(msg.role === "user" ? styles.userBubble : styles.botBubble),
                }}
              >
                {formatMessage(msg.content)}
              </div>
              {msg.role === "user" && (
                <div style={styles.userAvatar}>U</div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                style={{ ...styles.messageRow, justifyContent: "flex-start" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <img src={logo} alt="Edelweys" style={{ width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0 }} />
                <div style={styles.typingBubble}>
                  <div style={styles.typingDots}>
                    <div style={styles.dot} className="bounce1" />
                    <div style={styles.dot} className="bounce2" />
                    <div style={styles.dot} className="bounce3" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div style={styles.inputArea}>
          <div style={styles.inputContainer}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesanmu di sini..."
              style={styles.textarea}
              rows={1}
            />
            <button
              onClick={sendMessage}
              style={{
                ...styles.sendBtn,
                opacity: input.trim() ? 1 : 0.4,
              }}
              disabled={loading || !input.trim()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <AnimatePresence>
        {showProfileEdit && (
          <motion.div
            style={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowProfileEdit(false)}
          >
            <motion.div
              style={styles.modal}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={styles.modalTitle}>Edit Profile</h3>

              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Nama Lengkap</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.modalField}>
                <label style={styles.modalLabel}>Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  style={styles.modalInput}
                />
              </div>

              <div style={styles.modalActions}>
                <button onClick={() => setShowProfileEdit(false)} style={styles.modalCancelBtn}>
                  Batal
                </button>
                <button onClick={handleSaveProfile} style={styles.modalSaveBtn}>
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
        .bounce1 { animation: bounce 1.2s infinite 0s; }
        .bounce2 { animation: bounce 1.2s infinite 0.2s; }
        .bounce3 { animation: bounce 1.2s infinite 0.4s; }
      `}</style>
    </div>
  );
}

const glassBg = "rgba(255, 255, 255, 0.7)";
const glassBorder = "1px solid rgba(255, 255, 255, 0.5)";
const glassShadow = "0 8px 32px rgba(30, 51, 25, 0.08)";

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    background: COLORS.bgMain,
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    overflow: "hidden",
  },

  // Sidebar
  sidebar: {
    width: "260px",
    height: "100%",
    background: COLORS.greenDeep,
    flexShrink: 0,
    zIndex: 20,
  },
  sidebarContent: {
    width: "260px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    padding: "20px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  newChatBtn: {
    margin: "16px",
    padding: "12px 16px",
    background: COLORS.greenSage,
    border: "none",
    borderRadius: "12px",
    color: COLORS.white,
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",
  },
  guestWarning: {
    margin: "0 16px 12px",
    padding: "12px",
    background: "rgba(251, 191, 36, 0.15)",
    borderRadius: "10px",
    border: "1px solid rgba(251, 191, 36, 0.3)",
  },
  guestWarningText: {
    margin: 0,
    fontSize: "12px",
    color: "#FCD34D",
    fontWeight: "500",
  },
  historySection: {
    flex: 1,
    overflowY: "auto",
    padding: "0 12px",
  },
  historyLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#7A9B76",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    padding: "4px 8px 8px",
    margin: 0,
  },
  historyItem: {
    padding: "12px",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "4px",
    transition: "background 0.2s",
  },
  historyTitle: {
    fontSize: "13px",
    fontWeight: "500",
    color: COLORS.white,
    margin: "0 0 4px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  historyTime: {
    fontSize: "11px",
    color: "#7A9B76",
    margin: 0,
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#7A9B76",
    fontSize: "16px",
    cursor: "pointer",
    padding: "0 4px",
    lineHeight: 1,
    opacity: 0.6,
  },
  sidebarBottom: {
    padding: "16px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "10px",
    transition: "background 0.2s",
  },
  profileAvatar: {
    width: "36px",
    height: "36px",
    background: COLORS.greenSage,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: {
    fontSize: "14px",
    fontWeight: "700",
    color: COLORS.white,
  },
  profileInfo: {
    flex: 1,
    overflow: "hidden",
  },
  profileName: {
    fontSize: "13px",
    fontWeight: "600",
    color: COLORS.white,
    margin: 0,
  },
  profileHint: {
    fontSize: "11px",
    color: "#7A9B76",
    margin: "2px 0 0",
  },
  logoutBtn: {
    width: "100%",
    padding: "10px",
    background: "rgba(220, 38, 38, 0.15)",
    border: "none",
    borderRadius: "10px",
    color: "#FCA5A5",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  loginBtn: {
    width: "100%",
    padding: "10px",
    background: COLORS.greenSage,
    border: "none",
    borderRadius: "10px",
    color: COLORS.white,
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },

  // Main Chat
  mainChat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minWidth: 0,
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    background: glassBg,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: glassBorder,
    boxShadow: glassShadow,
  },
  chatHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  chatHeaderInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  menuBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    border: glassBorder,
    background: "rgba(255,255,255,0.5)",
    color: COLORS.textPrimary,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chatName: {
    margin: 0,
    fontWeight: "700",
    color: COLORS.textPrimary,
    fontSize: "16px",
    lineHeight: "1.2",
  },
  statusText: {
    margin: 0,
    fontSize: "12px",
    color: COLORS.greenSage,
    lineHeight: "1.2",
  },
  dashBtn: {
    padding: "10px 18px",
    borderRadius: "10px",
    border: glassBorder,
    background: "rgba(255,255,255,0.5)",
    color: COLORS.textPrimary,
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    backdropFilter: "blur(10px)",
  },

  // Guest Banner
  guestBanner: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "rgba(251, 191, 36, 0.15)",
    borderBottom: "1px solid rgba(251, 191, 36, 0.3)",
  },
  guestBannerText: {
    margin: 0,
    fontSize: "13px",
    color: COLORS.textSecondary,
  },
  guestBannerLink: {
    color: COLORS.greenSage,
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
  },

  // Messages
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    maxWidth: "75%",
  },
  userAvatar: {
    width: "32px",
    height: "32px",
    background: COLORS.greenDeep,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "12px",
    fontWeight: "700",
    color: COLORS.white,
  },
  bubble: {
    padding: "14px 18px",
    fontSize: "14px",
    lineHeight: "1.6",
    wordBreak: "break-word",
  },
  userBubble: {
    background: COLORS.chatUserBg,
    color: COLORS.white,
    borderRadius: "16px 16px 4px 16px",
    textAlign: "left",
  },
  botBubble: {
    background: glassBg,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    color: COLORS.textPrimary,
    borderRadius: "16px 16px 16px 4px",
    border: glassBorder,
    boxShadow: glassShadow,
    textAlign: "left",
  },
  typingBubble: {
    background: glassBg,
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    padding: "14px 18px",
    borderRadius: "16px 16px 16px 4px",
    border: glassBorder,
    boxShadow: glassShadow,
  },
  typingDots: {
    display: "flex",
    gap: "5px",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: COLORS.greenSage,
  },
  chatTable: {
    borderCollapse: "collapse",
    width: "100%",
    margin: "8px 0",
    fontSize: "13px",
  },
  chatTh: {
    background: "rgba(107, 145, 98, 0.1)",
    border: `1px solid ${COLORS.borderSoft}`,
    padding: "8px 12px",
    textAlign: "left",
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  chatTd: {
    border: `1px solid ${COLORS.borderSoft}`,
    padding: "8px 12px",
    textAlign: "left",
    color: COLORS.textPrimary,
  },

  // Input Area
  inputArea: {
    padding: "16px 24px 20px",
    background: glassBg,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderTop: glassBorder,
  },
  inputContainer: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    padding: "14px 18px",
    borderRadius: "14px",
    border: `2px solid ${COLORS.borderSoft}`,
    background: "rgba(255,255,255,0.6)",
    fontSize: "14px",
    color: COLORS.textPrimary,
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    minHeight: "48px",
    maxHeight: "120px",
  },
  sendBtn: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    border: "none",
    background: COLORS.greenSage,
    color: COLORS.white,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(107, 145, 98, 0.3)",
    transition: "all 0.2s",
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.3)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: glassBg,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "20px",
    padding: "32px",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    border: glassBorder,
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: COLORS.textPrimary,
    margin: "0 0 24px",
  },
  modalField: {
    marginBottom: "18px",
  },
  modalLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: "8px",
  },
  modalInput: {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.borderLight}`,
    background: "rgba(255,255,255,0.6)",
    fontSize: "14px",
    color: COLORS.textPrimary,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    marginTop: "24px",
  },
  modalCancelBtn: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.borderSoft}`,
    background: "rgba(255,255,255,0.5)",
    color: COLORS.textSecondary,
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },
  modalSaveBtn: {
    padding: "10px 20px",
    borderRadius: "10px",
    border: "none",
    background: COLORS.greenSage,
    color: COLORS.white,
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
