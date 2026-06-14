import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../services/supabase";

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
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewChat = () => {
    if (messages.length > 1) {
      const firstUserMsg = messages.find(m => m.role === "user");
      const title = firstUserMsg ? firstUserMsg.content.slice(0, 30) : "Obrolan baru";
      const newHistory = {
        id: Date.now(),
        title: title,
        messages: [...messages],
        time: "Baru saja",
      };
      setChatHistory(prev => [newHistory, ...prev]);
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
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            style={styles.sidebar}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 200, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div style={styles.sidebarContent}>
              {/* Logo */}
              <div style={styles.sidebarHeader}>
                <span style={styles.logoText}>✦ Edelweys</span>
              </div>

              {/* New Chat Button */}
              <button onClick={startNewChat} style={styles.newChatBtn}>
                + Obrolan Baru
              </button>

              {/* Chat History */}
              <div style={styles.historySection}>
                {chatHistory.length > 0 && (
                  <p style={styles.historyLabel}>Riwayat</p>
                )}
                {chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    style={{
                      ...styles.historyItem,
                      background: activeChatId === chat.id ? "rgba(107, 145, 98, 0.2)" : "transparent",
                    }}
                    onClick={() => loadChat(chat)}
                  >
                    <p style={styles.historyTitle}>{chat.title}</p>
                  </div>
                ))}
              </div>

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
                  </div>
                </div>
                {userId && (
                  <button onClick={handleLogout} style={styles.logoutBtn}>
                    Logout
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
            <div style={styles.chatAvatar}>E</div>
            <div>
              <p style={styles.chatName}>Edelweys</p>
              <p style={styles.statusText}>● Online</p>
            </div>
          </div>
          <button onClick={() => navigate("/dashboard")} style={styles.dashBtn}>
            Dashboard
          </button>
        </div>

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
                <div style={styles.botAvatar}>E</div>
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
                style={styles.messageRow}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div style={styles.botAvatar}>E</div>
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
              {loading ? "..." : "Kirim"}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
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
                <button
                  onClick={() => setShowProfileEdit(false)}
                  style={styles.modalCancelBtn}
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveProfile}
                  style={styles.modalSaveBtn}
                >
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
    height: "100%",
    background: COLORS.greenDeep,
    overflow: "hidden",
    flexShrink: 0,
  },
  sidebarContent: {
    width: "200px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    padding: "20px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logoText: {
    fontSize: "16px",
    fontWeight: "700",
    color: COLORS.white,
  },
  newChatBtn: {
    margin: "12px 12px",
    padding: "10px 14px",
    background: COLORS.greenSage,
    border: "none",
    borderRadius: "99px",
    color: COLORS.white,
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    textAlign: "left",
  },
  historySection: {
    flex: 1,
    overflowY: "auto",
    padding: "0 8px",
  },
  historyLabel: {
    fontSize: "10px",
    fontWeight: "600",
    color: COLORS.textTertiary,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "8px 8px 8px",
    margin: 0,
  },
  historyItem: {
    padding: "10px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "2px",
  },
  historyTitle: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#7A9B76",
    margin: 0,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  sidebarBottom: {
    padding: "12px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px",
    borderRadius: "8px",
    cursor: "pointer",
    marginBottom: "8px",
  },
  profileAvatar: {
    width: "32px",
    height: "32px",
    background: COLORS.greenSage,
    borderRadius: "8px",
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
  logoutBtn: {
    width: "100%",
    padding: "8px",
    background: "rgba(220, 38, 38, 0.2)",
    border: "none",
    borderRadius: "8px",
    color: "#FCA5A5",
    fontSize: "12px",
    fontWeight: "500",
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
    padding: "12px 20px",
    background: COLORS.white,
    borderBottom: `1px solid ${COLORS.borderSoft}`,
  },
  chatHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  menuBtn: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    border: `1px solid ${COLORS.borderSoft}`,
    background: COLORS.white,
    color: COLORS.textPrimary,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chatAvatar: {
    width: "36px",
    height: "36px",
    background: COLORS.greenSage,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
    color: COLORS.white,
  },
  chatName: {
    margin: 0,
    fontWeight: "700",
    color: COLORS.textPrimary,
    fontSize: "15px",
  },
  statusText: {
    margin: 0,
    fontSize: "11px",
    color: COLORS.greenSage,
  },
  dashBtn: {
    padding: "8px 16px",
    borderRadius: "99px",
    border: `1px solid ${COLORS.borderSoft}`,
    background: COLORS.white,
    color: COLORS.textPrimary,
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "500",
  },

  // Messages
  messages: {
    flex: 1,
    overflowY: "auto",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  messageRow: {
    display: "flex",
    alignItems: "flex-end",
    gap: "8px",
    maxWidth: "70%",
  },
  botAvatar: {
    width: "28px",
    height: "28px",
    background: COLORS.greenSage,
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "12px",
    fontWeight: "700",
    color: COLORS.white,
  },
  userAvatar: {
    width: "28px",
    height: "28px",
    background: COLORS.greenDeep,
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontSize: "12px",
    fontWeight: "700",
    color: COLORS.white,
  },
  bubble: {
    padding: "12px 16px",
    fontSize: "14px",
    lineHeight: "1.5",
    wordBreak: "break-word",
  },
  userBubble: {
    background: COLORS.chatUserBg,
    color: COLORS.white,
    borderRadius: "12px 12px 2px 12px",
    marginLeft: "auto",
  },
  botBubble: {
    background: COLORS.chatBotBg,
    color: COLORS.textPrimary,
    borderRadius: "12px 12px 12px 2px",
    border: `1px solid ${COLORS.borderSoft}`,
  },
  typingBubble: {
    background: COLORS.white,
    padding: "12px 16px",
    borderRadius: "12px 12px 12px 2px",
    border: `1px solid ${COLORS.borderSoft}`,
  },
  typingDots: {
    display: "flex",
    gap: "4px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: COLORS.greenSage,
  },

  // Input Area
  inputArea: {
    padding: "12px 20px 16px",
    background: COLORS.white,
    borderTop: `1px solid ${COLORS.borderSoft}`,
  },
  inputContainer: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: "99px",
    border: `1px solid ${COLORS.borderSoft}`,
    background: COLORS.white,
    fontSize: "14px",
    color: COLORS.textPrimary,
    resize: "none",
    outline: "none",
    fontFamily: "inherit",
    minHeight: "40px",
    maxHeight: "100px",
  },
  sendBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",
    background: COLORS.greenSage,
    color: COLORS.white,
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: COLORS.white,
    borderRadius: "16px",
    padding: "28px",
    width: "100%",
    maxWidth: "360px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  },
  modalTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: COLORS.textPrimary,
    margin: "0 0 20px",
  },
  modalField: {
    marginBottom: "16px",
  },
  modalLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: "6px",
  },
  modalInput: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.borderLight}`,
    background: COLORS.white,
    fontSize: "14px",
    color: COLORS.textPrimary,
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  modalActions: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "20px",
  },
  modalCancelBtn: {
    padding: "8px 16px",
    borderRadius: "10px",
    border: `1px solid ${COLORS.borderSoft}`,
    background: COLORS.white,
    color: COLORS.textSecondary,
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
  },
  modalSaveBtn: {
    padding: "8px 16px",
    borderRadius: "10px",
    border: "none",
    background: COLORS.greenSage,
    color: COLORS.white,
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
};
